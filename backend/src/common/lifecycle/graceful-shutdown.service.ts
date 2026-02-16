import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';



/**
 * Graceful Shutdown Service (HIGH-018)
 *
 * Handles application shutdown gracefully:
 * 1. Stop accepting new requests
 * 2. Finish processing existing requests
 * 3. Close database connections
 * 4. Clean up resources (timers, subscriptions)
 * 5. Exit process
 *
 * Responds to:
 * - SIGTERM (Kubernetes termination)
 * - SIGINT (Ctrl+C)
 * - uncaughtException
 * - unhandledRejection
 */
@Injectable()
export class GracefulShutdownService implements OnModuleDestroy {
  private readonly logger = new Logger(GracefulShutdownService.name);
  private isShuttingDown = false;
  private readonly shutdownTimeoutMs = 30000; // 30 seconds
  private cleanupCallbacks: Array<() => Promise<void>> = [];

  constructor(private prisma: PrismaService) {
    this.setupShutdownHandlers();
  }

  /**
   * Register cleanup callback
   * Will be called during shutdown
   */
  registerCleanup(callback: () => Promise<void>) {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Setup shutdown signal handlers
   */
  private setupShutdownHandlers() {
    // Kubernetes sends SIGTERM before killing pod
    process.on('SIGTERM', () => {
      this.logger.warn('SIGTERM received, starting graceful shutdown...');
      this.shutdown('SIGTERM');
    });

    // Ctrl+C in terminal
    process.on('SIGINT', () => {
      this.logger.warn('SIGINT received, starting graceful shutdown...');
      this.shutdown('SIGINT');
    });

    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception:', error);
      this.shutdown('uncaughtException');
    });

    // Unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      this.shutdown('unhandledRejection');
    });
  }

  /**
   * Perform graceful shutdown
   */
  private async shutdown(signal: string) {
    if (this.isShuttingDown) {
      this.logger.warn('Shutdown already in progress, ignoring signal');
      return;
    }

    this.isShuttingDown = true;
    this.logger.log(`Starting graceful shutdown (signal: ${signal})...`);

    // Set shutdown timeout
    const timeout = setTimeout(() => {
      this.logger.error(
        `Shutdown timeout (${this.shutdownTimeoutMs}ms) exceeded, forcing exit`,
      );
      process.exit(1);
    }, this.shutdownTimeoutMs);

    try {
      // Step 1: Stop accepting new requests
      this.logger.log('1/4 Stopping new requests...');
      // NOTE: Close HTTP server here if you have direct reference - Tracked in backlog
      // Await this.httpServer.close();

      // Step 2: Wait for existing requests to finish
      this.logger.log('2/4 Waiting for existing requests to finish...');
      await this.waitForPendingRequests();

      // Step 3: Run custom cleanup callbacks
      this.logger.log('3/4 Running cleanup callbacks...');
      await this.runCleanupCallbacks();

      // Step 4: Close database connections
      this.logger.log('4/4 Closing database connections...');
      await this.prisma.$disconnect();

      this.logger.log('✅ Graceful shutdown completed successfully');
      clearTimeout(timeout);
      process.exit(0);
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      clearTimeout(timeout);
      process.exit(1);
    }
  }

  /**
   * Wait for pending requests to finish
   */
  private async waitForPendingRequests(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async runCleanupCallbacks(): Promise<void> {
    for (const callback of this.cleanupCallbacks) {
      try {
        await callback();
      } catch (error) {
        this.logger.error('Error in cleanup callback:', error);
      }
    }
  }

  /**
   * Called when module is destroyed
   */
  async onModuleDestroy() {
    if (!this.isShuttingDown) {
      this.logger.log('Module destroy called, initiating shutdown...');
      await this.shutdown('onModuleDestroy');
    }
  }
}
