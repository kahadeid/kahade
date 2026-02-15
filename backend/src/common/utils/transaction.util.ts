import { Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';



/**
 * Transaction Utilities
 *
 * Provides safe transaction wrappers to prevent race conditions.
 * ALWAYS use transactions for operations that modify multiple records
 * or when consistency is critical.
 */

const logger = new Logger('TransactionUtil');

/**
 * Safe Transaction Wrapper
 *
 * Wraps operations in a Prisma transaction with error handling and logging.
 *
 * Usage:
 * ```typescript
 * await safeTransaction(prisma, async (tx) => {
 *   await tx.wallet.update({ where: { id }, data: { ... } });
 *   await tx.ledger.create({ data: { ... } });
 * });
 * ```
 */
export async function safeTransaction<T>(
  prisma: PrismaClient,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  options: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  } = {},
): Promise<T> {
  const startTime = Date.now();
  const transactionId = uuidv4().substring(0, 8);

  try {
    logger.debug(`[${transactionId}] Transaction started`);

    const result = await prisma.$transaction(
      operation,
      {
        maxWait: options.maxWait || 5000, // 5 seconds
        timeout: options.timeout || 10000, // 10 seconds
        isolationLevel: options.isolationLevel,
      },
    );

    const duration = Date.now() - startTime;
    logger.debug(`[${transactionId}] Transaction completed in ${duration}ms`);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      `[${transactionId}] Transaction failed after ${duration}ms`,
      error,
    );
    throw error;
  }
}

/**
 * Serializable Transaction
 *
 * Uses SERIALIZABLE isolation level for maximum consistency.
 * Use for critical financial operations.
 */
export async function serializableTransaction<T>(
  prisma: PrismaClient,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return safeTransaction(prisma, operation, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

/**
 * Optimistic Locking Helper
 *
 * Implements optimistic locking using version field.
 * Retries on version conflict.
 *
 * Usage:
 * ```typescript
 * await withOptimisticLocking(
 *   () => prisma.wallet.findUnique({ where: { id } }),
 *   async (wallet, tx) => {
 *     return tx.wallet.update({
 *       where: { id, version: wallet.version },
 *       data: { balance: newBalance, version: { increment: 1 } },
 *     });
 *   },
 *   prisma,
 * );
 * ```
 */
export async function withOptimisticLocking<T, R>(
  fetchRecord: () => Promise<T & { version?: number }>,
  updateOperation: (record: T, tx: Prisma.TransactionClient) => Promise<R>,
  prisma: PrismaClient,
  options: {
    maxRetries?: number;
    retryDelay?: number;
  } = {},
): Promise<R> {
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 100;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const record = await fetchRecord();

      if (!record) {
        throw new Error('Record not found');
      }

      return await prisma.$transaction(async (tx) => {
        return await updateOperation(record, tx);
      });
    } catch (error) {
      // Check if it's a version conflict
      if (
        error.code === 'P2025' || // Record not found (version mismatch)
        error.message?.includes('version')
      ) {
        if (attempt === maxRetries - 1) {
          logger.error('Optimistic locking failed after max retries');
          throw new Error('Concurrent modification detected. Please retry.');
        }

        logger.warn(`Optimistic locking retry ${attempt + 1}/${maxRetries}`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Optimistic locking failed');
}

/**
 * Idempotency Key Handler
 *
 * Ensures operations are idempotent using a key.
 * Prevents duplicate operations from concurrent requests.
 *
 * Usage:
 * ```typescript
 * await withIdempotencyKey(
 *   'transaction-123',
 *   async (tx) => {
 *     // Your operation here
 *     return await createTransaction(...);
 *   },
 *   prisma,
 * );
 * ```
 */
export async function withIdempotencyKey<T>(
  idempotencyKey: string,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  prisma: PrismaClient,
  options: {
    ttl?: number; // TTL in seconds
  } = {},
): Promise<T> {
  const ttl = options.ttl || 86400; // 24 hours default

  return await prisma.$transaction(async (tx) => {
    // Check if operation already exists
    const existing = await (tx as any).idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existing) {
      // Operation already processed
      logger.debug(`Idempotency key ${idempotencyKey} already processed`);
      return existing.result as T;
    }

    // Execute operation
    const result = await operation(tx);

    // Store result with idempotency key
    await (tx as any).idempotencyKey.create({
      data: {
        key: idempotencyKey,
        result: result as any,
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });

    return result;
  });
}

/**
 * Distributed Lock Pattern
 *
 * Implements advisory locks using database.
 * Use for operations that need exclusive access.
 *
 * Usage:
 * ```typescript
 * await withDistributedLock(
 *   'wallet-123',
 *   async () => {
 *     // Critical section - only one process can execute this at a time
 *     await updateWallet(...);
 *   },
 *   prisma,
 * );
 * ```
 */
export async function withDistributedLock<T>(
  lockKey: string,
  operation: () => Promise<T>,
  prisma: PrismaClient,
  options: {
    timeout?: number;
    retryDelay?: number;
    maxRetries?: number;
  } = {},
): Promise<T> {
  const timeout = options.timeout || 30000; // 30 seconds
  const retryDelay = options.retryDelay || 100;
  const maxRetries = options.maxRetries || 300; // 30 seconds total with 100ms delay
  const lockId = `lock:${lockKey}`;

  let acquired = false;

  try {
    // Try to acquire lock
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // SECURITY: Ensure input is properly sanitized
        await (prisma as any).$executeRaw`
          INSERT INTO locks (id, acquired_at, expires_at)
          VALUES (
            ${lockId},
            NOW(),
            NOW() + INTERVAL '${timeout} milliseconds'
          )
        `;
        acquired = true;
        break;
      } catch (error) {
        // Lock already exists, wait and retry
        if (attempt === maxRetries - 1) {
          throw new Error(`Failed to acquire lock: ${lockKey}`);
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    if (!acquired) {
      throw new Error(`Failed to acquire lock: ${lockKey}`);
    }

    // Execute operation
    return await operation();
  } finally {
    // Release lock
    if (acquired) {
      try {
        // SECURITY: Ensure input is properly sanitized
        await (prisma as any).$executeRaw`
          DELETE FROM locks WHERE id = ${lockId}
        `;
      } catch (error) {
        logger.error(`Failed to release lock: ${lockKey}`, error);
      }
    }
  }
}

/**
 * Batch Operation with Transaction
 *
 * Safely processes batch operations in a transaction.
 * Supports partial success handling.
 *
 * Usage:
 * ```typescript
 * await batchTransaction(
 *   items,
 *   async (item, tx) => {
 *     await tx.user.update({ where: { id: item.id }, data: item });
 *   },
 *   prisma,
 * );
 * ```
 */
export async function batchTransaction<T, R>(
  items: T[],
  operation: (item: T, tx: Prisma.TransactionClient) => Promise<R>,
  prisma: PrismaClient,
  options: {
    batchSize?: number;
    continueOnError?: boolean;
  } = {},
): Promise<Array<R | Error>> {
  const batchSize = options.batchSize || 100;
  const results: Array<R | Error> = [];

  // Process in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    try {
      const batchResults = await prisma.$transaction(
        async (tx) => {
          const promises = batch.map((item) =>
            operation(item, tx).catch((error) => {
              if (!options.continueOnError) throw error;
              return error;
            })
          );
          return Promise.all(promises);
        },
      );

      results.push(...batchResults);
    } catch (error) {
      if (!options.continueOnError) {
        throw error;
      }
      results.push(error);
    }
  }

  return results;
}

/**
 * RACE CONDITION PREVENTION CHECKLIST:
 *
 * ✅ Use transactions for multi-step operations
 * ✅ Use FOR UPDATE lock for critical reads before writes
 * ✅ Use optimistic locking (version field) for high-concurrency scenarios
 * ✅ Use idempotency keys for payment/financial operations
 * ✅ Use distributed locks for exclusive operations
 * ✅ Use appropriate isolation level (Serializable for money)
 * ✅ Always validate state before updates
 * ✅ Handle deadlock errors with retries
 *
 * Example: Safe Money Transfer
 * ```typescript
 * await serializableTransaction(prisma, async (tx) => {
 *   // Lock both wallets
 *   const [fromWallet, toWallet] = await Promise.all([
// SECURITY: Ensure input is properly sanitized
*     tx.$queryRaw`SELECT * FROM wallets WHERE id = ${fromId} FOR UPDATE`,
 // SECURITY: Ensure input is properly sanitized
 *     tx.$queryRaw`SELECT * FROM wallets WHERE id = ${toId} FOR UPDATE`,
 *   ]);
 *
 *   // Validate balances
 *   if (fromWallet.balance < amount) {
 *     throw new Error('Insufficient balance');
 *   }
 *
 *   // Update balances
 *   await tx.wallet.update({
 *     where: { id: fromId },
 *     data: { balance: { decrement: amount } },
 *   });
 *
 *   await tx.wallet.update({
 *     where: { id: toId },
 *     data: { balance: { increment: amount } },
 *   });
 * });
 * ```
 */
