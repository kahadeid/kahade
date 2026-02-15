import { Logger } from '@nestjs/common';


/**
 * Error Handling Decorator
 *
 * Automatically catches and logs errors in service methods.
 * Prevents silent failures and empty catch blocks.
 *
 * Usage:
 * ```typescript
 * @CatchErrors('ClassName.methodName')
 * async myMethod() {
 *   // Your code here
 * }
 * ```
 */
export function CatchErrors(context?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger(context || target.constructor.name);

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        // Log error with full context
        logger.error(
          `Error in ${propertyKey}`,
          {
            error: error.message,
            stack: error.stack,
            method: propertyKey,
            args: JSON.stringify(args, null, 2).substring(0, 500), // Limit arg logging
            timestamp: new Date().toISOString(),
          },
        );

        // Re-throw to allow proper error handling up the chain
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Try-Catch Wrapper Utility
 *
 * Wraps async operations with proper error handling and logging.
 * Use this for inline error handling instead of empty catch blocks.
 *
 * Usage:
 * ```typescript
 * const result = await tryCatch(
 *   () => someAsyncOperation(),
 *   'Operation description',
 *   this.logger
 * );
 * ```
 */
export async function tryCatch<T>(
  operation: () => Promise<T>,
  operationName: string,
  logger: Logger,
  options: {
    rethrow?: boolean;
    defaultValue?: T;
    onError?: (error: Error) => void;
  } = {},
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    logger.error(`${operationName} failed`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Custom error handler
    if (options.onError) {
      options.onError(error);
    }

    // Re-throw if specified
    if (options.rethrow !== false) {
      throw error;
    }

    // Return default value if specified
    return options.defaultValue;
  }
}

/**
 * Safe Promise All
 *
 * Like Promise.all but logs failures and continues with successful results.
 *
 * Usage:
 * ```typescript
 * const results = await safePromiseAll(
 *   [promise1, promise2, promise3],
 *   'Batch operation',
 *   this.logger
 * );
 * ```
 */
export async function safePromiseAll<T>(
  promises: Promise<T>[],
  operationName: string,
  logger: Logger,
): Promise<Array<T | null>> {
  const results = await Promise.allSettled(promises);

  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const failureCount = results.filter(r => r.status === 'rejected').length;

  if (failureCount > 0) {
    logger.warn(`${operationName}: ${successCount} succeeded, ${failureCount} failed`, {
      failures: results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason?.message || 'Unknown error'),
    });
  }

  return results.map(result =>
    result.status === 'fulfilled' ? result.value : null,
  );
}

/**
 * Retry with Exponential Backoff
 *
 * Retries failed operations with exponential backoff and logging.
 *
 * Usage:
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => unstableOperation(),
 *   { maxRetries: 3, baseDelay: 1000 },
 *   'Unstable operation',
 *   this.logger
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  },
  operationName: string,
  logger: Logger,
): Promise<T> {
  const maxRetries = options.maxRetries || 3;
  const baseDelay = options.baseDelay || 1000;
  const maxDelay = options.maxDelay || 10000;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        logger.error(`${operationName} failed after ${maxRetries} retries`, {
          error: error.message,
          attempts: attempt + 1,
        });
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      logger.warn(`${operationName} failed, retrying in ${delay}ms`, {
        error: error.message,
        attempt: attempt + 1,
        maxRetries,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
