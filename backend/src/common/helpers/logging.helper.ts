import { Logger } from '@nestjs/common';


/**
 * Logging Helpers (LOW-006)
 */

export class LoggingHelper {
  private static readonly logger = new Logger('LoggingHelper');

  /**
   * Log performance metrics
   */
  static logPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    const log = {
      operation,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    if (duration > 1000) {
      this.logger.warn(`Slow operation: ${JSON.stringify(log)}`);
    } else {
      this.logger.log(`Performance: ${JSON.stringify(log)}`);
    }
  }

  /**
   * Log audit trail
   */
  static logAudit(
    action: string,
    userId: string,
    resource: string,
    metadata?: Record<string, any>,
  ): void {
    const log = {
      action,
      userId,
      resource,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    this.logger.log(`Audit: ${JSON.stringify(log)}`);
  }

  /**
   * Log security event
   */
  static logSecurity(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>,
  ): void {
    const log = {
      event,
      severity,
      timestamp: new Date().toISOString(),
      ...details,
    };

    if (severity === 'critical' || severity === 'high') {
      this.logger.error(`Security: ${JSON.stringify(log)}`);
    } else {
      this.logger.warn(`Security: ${JSON.stringify(log)}`);
    }
  }

  /**
   * Log error with context
   */
  static logError(
    error: Error,
    context: string,
    metadata?: Record<string, any>,
  ): void {
    const log = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    this.logger.error(`Error: ${JSON.stringify(log)}`);
  }

  /**
   * Measure execution time
   */
  static measureTime<T>(
    operation: string,
    fn: () => T | Promise<T>,
  ): T | Promise<T> {
    const start = Date.now();

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result.then((value) => {
          this.logPerformance(operation, Date.now() - start);
          return value;
        });
      }

      this.logPerformance(operation, Date.now() - start);
      return result;
    } catch (error) {
      this.logError(error as Error, operation);
      throw error;
    }
  }
}
