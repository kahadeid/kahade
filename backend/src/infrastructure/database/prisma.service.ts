import { ConfigService } from "@nestjs/config";

import { PrismaClient } from "@prisma/client";
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";

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

    if (!isProduction) {
      (this as any).$on("query", (e: any) => {
        if (e.duration > 1000) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }

    (this as any).$on("error", (e: any) => {
      this.logger.error(`Database error: ${e.message}`);
    });
  }

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

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.isConnected = false;
      this.logger.log("Database disconnected");
    } catch (error: any) {
      this.logger.error(`Error disconnecting: ${error.message}`, error.stack);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

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

  private isRetryableError(error: unknown): boolean {
    if (error && typeof error === "object" && "code" in error) {
      const retryableCodes = ["P1001", "P1002", "P2024", "P2034"];
      return retryableCodes.includes((error as any).code);
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cannot clean database in production");
    }

    const models = Object.keys(this).filter(
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
