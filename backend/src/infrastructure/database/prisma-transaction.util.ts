import { Logger } from "@nestjs/common";

import { PrismaClient, Prisma } from "@prisma/client";

// ============================================================================
// PRISMA TRANSACTION UTILITIES
// ============================================================================
// Fix #74: Proper transaction handling with timeouts and retries
// ============================================================================

const logger = new Logger("PrismaTransaction");

// Define TransactionOptions locally since it's not exported from Prisma
export interface TransactionOptions {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

/**
 * Default transaction options
 */
export const DEFAULT_TRANSACTION_OPTIONS: TransactionOptions = {
  maxWait: 10000, // Maximum time to wait for a transaction slot (10s)
  timeout: 30000, // Maximum time for the transaction to complete (30s)
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
};

/**
 * Transaction options for financial operations
 * Uses Serializable isolation to prevent race conditions
 */
export const FINANCIAL_TRANSACTION_OPTIONS: TransactionOptions = {
  maxWait: 15000, // 15s wait for slot
  timeout: 60000, // 60s timeout for complex financial operations
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
};

/**
 * Transaction options for read-heavy operations
 */
export const READ_TRANSACTION_OPTIONS: TransactionOptions = {
  maxWait: 5000, // 5s wait
  timeout: 15000, // 15s timeout
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
};

/**
 * Execute a transaction with retry logic
 * @param prisma Prisma client instance
 * @param fn Transaction function
 * @param options Transaction options
 * @param maxRetries Maximum number of retries (default: 3)
 */
export async function executeWithRetry<T>(
  prisma: PrismaClient,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: TransactionOptions = DEFAULT_TRANSACTION_OPTIONS,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn, options);
    } catch (error: unknown) {
      lastError = error as Error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      logger.warn(
        `Transaction attempt ${attempt}/${maxRetries} failed: ${(error as Error).message}`,
      );

      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        const jitter = Math.random() * 1000;
        await sleep(delay + jitter);
      }
    }
  }

  throw lastError;
}

/**
 * Execute a financial transaction with proper isolation and retries
 */
export async function executeFinancialTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  return executeWithRetry(
    prisma,
    fn,
    FINANCIAL_TRANSACTION_OPTIONS,
    maxRetries,
  );
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  // Type guard for Prisma errors
  const prismaError = error as { code?: string; meta?: { code?: string } };

  // Prisma error codes that are retryable
  const retryableCodes = [
    "P2024", // Timed out fetching a new connection from the connection pool
    "P2034", // Transaction failed due to a write conflict or a deadlock
  ];

  if (prismaError.code && retryableCodes.includes(prismaError.code)) {
    return true;
  }

  // PostgreSQL error codes that are retryable
  const pgRetryableCodes = [
    "40001", // Serialization failure
    "40P01", // Deadlock detected
    "57014", // Query cancelled
  ];

  if (
    prismaError.meta?.code &&
    pgRetryableCodes.includes(prismaError.meta.code)
  ) {
    return true;
  }

  // Check for timeout errors
  if (
    (error as Error).message?.includes("timed out") ||
    (error as Error).message?.includes("timeout")
  ) {
    return true;
  }

  return false;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Optimistic locking helper
 * Throws if version mismatch is detected
 */
export async function withOptimisticLock<T extends { version: number }>(
  tx: Prisma.TransactionClient,
  tableName: string,
  id: string,
  currentVersion: number,
  updateFn: () => Promise<T>,
): Promise<T> {
  const result = await updateFn();

  if (result.version !== currentVersion + 1) {
    throw new Error(
      `Optimistic lock failed for ${tableName}:${id}. ` +
        `Expected version ${currentVersion + 1}, got ${result.version}`,
    );
  }

  return result;
}

/**
 * Pessimistic locking helper using SELECT FOR UPDATE
 */
export async function withPessimisticLock<T>(
  tx: Prisma.TransactionClient,
  tableName: "wallet" | "order" | "escrowHold" | "withdrawal", // Whitelist allowed tables
  idColumn: "id" | "userId", // Whitelist allowed columns
  idValue: string,
  updateFn: (locked: T) => Promise<T>,
): Promise<T> {
  // SECURITY FIX: Use parameterized query with whitelisted table/column names
  // This prevents SQL injection by only allowing predefined table and column names
  const tableMap: Record<string, string> = {
    wallet: '"Wallet"',
    order: '"Order"',
    escrowHold: '"EscrowHold"',
    withdrawal: '"Withdrawal"',
  };
  const columnMap: Record<string, string> = {
    id: '"id"',
    userId: '"userId"',
  };

  const safeTable = tableMap[tableName];
  const safeColumn = columnMap[idColumn];

  if (!safeTable || !safeColumn) {
    throw new Error("Invalid table or column name");
  }

  // Use (Prisma as any).sql for safe parameterized query
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // SECURITY: Ensure input is properly sanitized
  const [locked] = await tx.$queryRaw<T[]>(
    (Prisma as any)
      .sql`SELECT * FROM ${(Prisma as any).raw(safeTable)} WHERE ${(Prisma as any).raw(safeColumn)} = ${idValue} FOR UPDATE`,
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (!locked) {
    throw new Error("Record not found for pessimistic lock");
  }

  return updateFn(locked);
}

/**
 * Batch transaction helper
 * Executes multiple operations in a single transaction
 */
// Eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function batchTransaction<T>(
  prisma: PrismaClient,
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  operations: Array<(tx: Prisma.TransactionClient) => Promise<any>>,
  options: TransactionOptions = DEFAULT_TRANSACTION_OPTIONS,
): Promise<T[]> {
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.$transaction(async (tx: any) => {
    const results: T[] = [];
    for (const operation of operations) {
      results.push(await operation(tx));
    }
    return results;
  }, options);
}
