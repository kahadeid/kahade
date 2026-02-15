import { Logger, LogLevel } from '@nestjs/common';
import { inspect } from 'util';



/**
 * Structured Logger Utility
 *
 * Professional logging replacement for console.log.
 * Use this instead of console.log/warn/error throughout the application.
 *
 * ❌ BAD:
 * *
 * ✅ GOOD:
 * this.logger.log('User created', { userId: user.id });
 *
 * Features:
 * - Structured logging with context
 * - Log levels (debug, log, warn, error)
 * - Automatic timestamp
 * - Stack trace for errors
 * - JSON formatting option
 */

/**
 * Create Logger Instance
 *
 * Usage in Services/Controllers:
 * ```typescript
 * export class UserService {
 *   private readonly logger = createLogger(UserService.name);
 *
 *   async createUser(data: CreateUserDto) {
 *     this.logger.log('Creating user', { email: data.email });
 *     // ...
 *   }
 * }
 * ```
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Log Levels
 */
export enum LogLevels {
  DEBUG = 'debug',
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error',
  VERBOSE = 'verbose',
}

/**
 * Structured Log Entry
 */
export interface LogEntry {
  level: LogLevels;
  context: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  stack?: string;
}

/**
 * Enhanced Logger Class
 *
 * Extends NestJS Logger with additional features.
 */
export class EnhancedLogger extends Logger {
  constructor(context: string, private readonly options?: {
    enableJson?: boolean;
    enableTimestamp?: boolean;
  }) {
    super(context);
  }

  /**
   * Log with structured data
   */
  logWithData(message: string, data?: Record<string, any>): void {
    if (this.options?.enableJson) {
      this.log(this.formatJson('log', message, data));
    } else {
      this.log(message, this.formatData(data));
    }
  }

  /**
   * Warn with structured data
   */
  warnWithData(message: string, data?: Record<string, any>): void {
    if (this.options?.enableJson) {
      this.warn(this.formatJson('warn', message, data));
    } else {
      this.warn(message, this.formatData(data));
    }
  }

  /**
   * Error with structured data
   */
  errorWithData(
    message: string,
    error?: Error,
    data?: Record<string, any>,
  ): void {
    if (this.options?.enableJson) {
      this.error(
        this.formatJson('error', message, {
          ...data,
          error: error?.message,
          stack: error?.stack,
        }),
      );
    } else {
      this.error(
        message,
        error?.stack || '',
        this.formatData(data),
      );
    }
  }

  /**
   * Debug with structured data
   */
  debugWithData(message: string, data?: Record<string, any>): void {
    if (this.options?.enableJson) {
      this.debug(this.formatJson('debug', message, data));
    } else {
      this.debug(message, this.formatData(data));
    }
  }

  /**
   * Format data for logging
   */
  private _formatData(data?: Record<string, any>): string {
    if (!data) return '';
    return inspect(data, { depth: 3, colors: true });
  }

  /**
   * Format as JSON for structured logging
   */
  private _formatJson(
    level: string,
    message: string,
    data?: Record<string, any>,
  ): string {
    const entry: LogEntry = {
      level: level as LogLevels,
      context: this.context || 'Application',
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(entry);
  }
}

/**
 * Performance Logger
 *
 * Logs execution time of operations.
 *
 * Usage:
 * ```typescript
 * const perfLog = startPerfLog('Database query');
 * await this.prisma.user.findMany();
 * perfLog.end(this.logger);
 * ```
 */
export interface PerfLog {
  operation: string;
  startTime: number;
  end: (logger: Logger, data?: Record<string, any>) => void;
}

export function startPerfLog(operation: string): PerfLog {
  const startTime = Date.now();

  return {
    operation,
    startTime,
    end: (logger: Logger, data?: Record<string, any>) => {
      const duration = Date.now() - startTime;
      logger.debug(`${operation} completed in ${duration}ms`, data || {});

      // Warn if operation is slow
      if (duration > 1000) {
        logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
      }
    },
  };
}

/**
 * Performance Decorator
 *
 * Automatically logs method execution time.
 *
 * Usage:
 * ```typescript
 * @LogPerformance()
 * async expensiveOperation() {
 *   // Method execution time will be logged
 * }
 * ```
 */
export function LogPerformance(options?: {
  slowThreshold?: number; // ms
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger(target.constructor.name);
    const slowThreshold = options?.slowThreshold || 1000;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        if (duration > slowThreshold) {
          logger.warn(
            `Slow operation: ${propertyKey} took ${duration}ms`,
            { threshold: slowThreshold },
          );
        } else {
          logger.debug(`${propertyKey} completed in ${duration}ms`);
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(
          `${propertyKey} failed after ${duration}ms`,
          error.stack,
        );
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Log Sanitizer
 *
 * Removes sensitive data before logging.
 */
export class LogSanitizer {
  private static readonly SENSITIVE_FIELDS = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'privateKey',
    'creditCard',
    'cvv',
    'ssn',
    'pin',
  ];

  /**
   * Sanitize object for logging
   */
  static sanitize<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item)) as any;
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (this.SENSITIVE_FIELDS.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

/**
 * Request Logger
 *
 * Logs HTTP requests with sanitized data.
 */
export function logRequest(
  logger: Logger,
  method: string,
  path: string,
  body?: any,
  query?: any,
): void {
  logger.log(`${method} ${path}`, {
    body: body ? LogSanitizer.sanitize(body) : undefined,
    query: query ? LogSanitizer.sanitize(query) : undefined,
  });
}

/**
 * Response Logger
 */
export function logResponse(
  logger: Logger,
  method: string,
  path: string,
  statusCode: number,
  duration: number,
): void {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';

  logger[level](`${method} ${path} ${statusCode} - ${duration}ms`);
}

/**
 * MIGRATION GUIDE:
 *
 * Replace console statements:
 *
 * ❌ * ✅ this.logger.log('message')
 *
 * ❌ * ✅ this.logger.log('message', { data })
 *
 * ❌ * ✅ this.logger.warn('warning')
 *
 * ❌ * ✅ this.logger.error('error', error.stack)
 *
 * ❌ * ✅ this.logger.debug('debug')
 *
 * In class constructor:
 * private readonly logger = new Logger(ClassName.name);
 *
 * For structured logging:
 * private readonly logger = new EnhancedLogger(ClassName.name, { enableJson: true });
 */

/**
 * ESLint Rule to enforce:
 *
 * Add to .eslintrc.js:
 * ```javascript
 * rules: {
 *   'no-console': ['error', { allow: [] }],
 * }
 * ```
 *
 * This will make console.log usage a linting error.
 */
