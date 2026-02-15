import { PrismaService } from '@infrastructure/database/prisma.service';



/**
 * Database Transaction Patterns (HIGH-031)
 *
 * Features:
 * - Transaction decorator
 * - Nested transactions
 * - Isolation levels
 * - Automatic rollback
 * - Deadlock handling
 */

export interface TransactionOptions {
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  maxWait?: number; // ms
  timeout?: number; // ms
}

/**
 * Transaction decorator
 * Automatically wraps method in transaction
 */
export function Transactional(options?: TransactionOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const prisma: PrismaService = this.prisma;

      if (!prisma) {
        throw new Error(
          'PrismaService not found. Make sure to inject it in constructor.',
        );
      }

      return await prisma.$transaction(
        async (tx) => {
          // Replace prisma with transaction client
          const originalPrisma = this.prisma;
          this.prisma = tx;

          try {
            return await originalMethod.apply(this, args);
          } finally {
            // Restore original prisma
            this.prisma = originalPrisma;
          }
        },
        {
          isolationLevel: options?.isolationLevel,
          maxWait: options?.maxWait,
          timeout: options?.timeout || 10000, // 10s default
        },
      );
    };

    return descriptor;
  };
}

/**
 * Transaction helper class
 */
export class TransactionHelper {
  /**
   * Execute multiple operations in transaction
   */
  static async execute<T>(
    prisma: PrismaService,
    operations: (tx: any) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    return await prisma.$transaction(operations, {
      isolationLevel: options?.isolationLevel,
      maxWait: options?.maxWait,
      timeout: options?.timeout || 10000,
    });
  }

  /**
   * Execute with retry on deadlock
   */
  static async executeWithRetry<T>(
    prisma: PrismaService,
    operations: (tx: any) => Promise<T>,
    maxRetries: number = 3,
    options?: TransactionOptions,
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(prisma, operations, options);
      } catch (error: Error) {
        lastError = error;

        // Check if it's a deadlock error
        if (this.isDeadlockError(error) && attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await this.sleep(Math.pow(2, attempt) * 100);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Check if error is deadlock
   */
  private static isDeadlockError(error: Error): boolean {
    return (
      error.code === 'P2034' || // Prisma deadlock
      error.message?.includes('deadlock') ||
      error.message?.includes('Deadlock')
    );
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Example usage:
 *
 * // Using decorator
 * @Injectable()
 * export class WalletService {
 *   constructor(private prisma: PrismaService) {}
 *
 *   @Transactional({ isolationLevel: 'Serializable' })
 *   async transfer(fromId: string, toId: string, amount: number) {
 *     // Everything here runs in transaction
 *     await this.prisma.wallet.update({
 *       where: { id: fromId },
 *       data: { balance: { decrement: amount } },
 *     });
 *
 *     await this.prisma.wallet.update({
 *       where: { id: toId },
 *       data: { balance: { increment: amount } },
 *     });
 *
 *     await this.prisma.transaction.create({
 *       data: { fromId, toId, amount },
 *     });
 *
 *     return { success: true };
 *   }
 * }
 *
 * // Using helper
 * await TransactionHelper.executeWithRetry(
 *   prisma,
 *   async (tx) => {
 *     await tx.wallet.update(...);
 *     await tx.transaction.create(...);
 *   },
 *   3, // max retries
 * );
 */
