import { ConfigService } from "@nestjs/config";

import {
import { PrismaClient } from "@prisma/client";

  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
// Eslint-disable-next-line @typescript-eslint/no-unused-vars
// Eslint-disable-next-line @typescript-eslint/no-unused-vars

// ============================================================================
// BANK-GRADE PRISMA SERVICE
// Implements: Connection Pooling, Health Checks, Graceful Shutdown
// ============================================================================

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  [key: string]: any;

  constructor(private readonly configService?: ConfigService) {
    const isProduction = process.env.NODE_ENV === "production";

    super({
      log: isProduction
        ? [{ emit: "event", level: "error" }]
        : [
            { emit: "event", level: "query" },
            { emit: "event", level: "error" },
            { emit: "event", level: "info" },
            { emit: "event", level: "warn" },
          ],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Set up query logging in development
    if (!isProduction) {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).$on("query", (e: any) => {
        if (e.duration > 1000) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Log errors
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).$on("error", (e: any) => {
      this.logger.error(`Database error: ${e.message}`);
    });
  }

  /**
   * Onmoduleinit
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log("Database connected successfully");
    } catch (error: unknown) {
      this.logger.error("Failed to connect to database", error);
      throw error;
    }
  }

  /**
   * Onmoduledestroy
   */
  async onModuleDestroy(): Promise<void> {
    try {
    await this.$disconnect();
    this.isConnected = false;
    this.logger.log("Database disconnected");
  }

  /**
   * Health check for database connection
   */
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  /**
   * Ishealthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      // SECURITY: Ensure input is properly sanitized
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Execute with retry logic for transient failures
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delayMs = 100,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        lastError = error as Error;

        // Check if error is retryable (connection issues, deadlocks)
        const isRetryable = this.isRetryableError(error);

        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }

        this.logger.warn(
          `Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`,
        );

        await this.delay(delayMs * Math.pow(2, attempt - 1));
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  private _isRetryableError(error: unknown): boolean {
    if (error && typeof error === "object" && "code" in error) {
      // P1001: Can't reach database server
      // P1002: Database server timed out
      // P2024: Timed out fetching connection from pool
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      // P2034: Transaction failed due to write conflict or deadlock
      const retryableCodes = ["P1001", "P1002", "P2024", "P2034"];
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      return retryableCodes.includes((error as any).code);
    }
    return false;
  }

  /**
   * Delay helper
   */
  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clean database (development/testing only)
   */
  async cleanDatabase(): Promise<void> {
    try {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cannot clean database in production");
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }

    const models = Object.keys(this).filter(
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (key: any) =>
        !key.startsWith("_") && !key.startsWith("$") && key !== "logger",
    );

    await Promise.all(
      models.map(async (modelKey) => {
        const model = (this as Record<string, unknown>)[modelKey];
        if (
          model &&
          typeof (model as { deleteMany?: () => Promise<unknown> })
            .deleteMany === "function"
        ) {
          await (model as { deleteMany: () => Promise<unknown> }).deleteMany();
        }
      }),
    );
  }
}
