import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { nanoid } from 'nanoid';



@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private prisma: PrismaService) {}

  async runInTransaction<T>(
    callback: (tx: any) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: any;
    },
  ): Promise<T> {
    const transactionId = nanoid(8);
    const startTime = Date.now();

    this.logger.debug(`[${transactionId}] Starting transaction`);

    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          return await callback(tx);
        },
        options,
      );

      const duration = Date.now() - startTime;
      this.logger.debug(`[${transactionId}] Transaction completed (${duration}ms)`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `[${transactionId}] Transaction rolled back (${duration}ms): ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async executeWithRetry<T>(
    callback: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await callback();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        this.logger.warn(
          `Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`,
        );

        if (attempt < maxRetries) {
          await this.delay(delayMs * attempt);
        }
      }
    }

    throw lastError;
  }

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
