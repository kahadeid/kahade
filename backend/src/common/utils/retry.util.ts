import { Logger } from '@nestjs/common';


/**
 * Retry Mechanism with Exponential Backoff (HIGH-023)
 *
 * Features:
 * - Configurable max attempts
 * - Exponential backoff
 * - Jitter to prevent thundering herd
 * - Conditional retry (only for retryable errors)
 * - Integration with circuit breaker
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number; // ms
  maxDelay?: number; // ms
  factor?: number; // Backoff multiplier
  jitter?: boolean; // Add random jitter
  retryIf?: (error: Error) => boolean; // Condition for retry
  onRetry?: (attempt: number, error: Error) => void; // Callback
}

export class RetryUtil {
  private static readonly logger = new Logger(RetryUtil.name);

  /**
   * Execute function with retry logic
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 30000,
      factor = 2,
      jitter = true,
      retryIf = () => true,
      onRetry,
    } = options;

    let lastError: any;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Check if we should retry this error
        if (!retryIf(error)) {
          this.logger.debug(
            `Error not retryable, aborting: ${error.message}`,
          );
          throw error;
        }

        // Last attempt, don't wait
        if (attempt === maxAttempts) {
          this.logger.error(
            `Max retry attempts (${maxAttempts}) reached`,
            error,
          );
          throw error;
        }

        // Calculate delay with exponential backoff
        const waitTime = this.calculateDelay(delay, maxDelay, jitter);

        this.logger.warn(
          `Retry attempt ${attempt}/${maxAttempts} after ${waitTime}ms. Error: ${error.message}`,
        );

        // Call onRetry callback if provided
        if (onRetry) {
          onRetry(attempt, error);
        }

        // Wait before retry
        await this.sleep(waitTime);

        // Increase delay for next attempt
        delay = Math.min(delay * factor, maxDelay);
      }
    }

    throw lastError;
  }

  /**
   * Calculate delay with jitter
   */
  private static calculateDelay(
    delay: number,
    maxDelay: number,
    jitter: boolean,
  ): number {
    let waitTime = Math.min(delay, maxDelay);

    if (jitter) {
      // Add random jitter (0-25% of delay)
      const jitterAmount = Math.random() * 0.25 * waitTime;
      waitTime += jitterAmount;
    }

    return Math.floor(waitTime);
  }

  /**
   * Sleep helper
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable (network errors, timeouts, 5xx)
   */
  static isRetryableError(error: Error): boolean {
    // Network errors
    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND'
    ) {
      return true;
    }

    // HTTP 5xx errors (server errors)
    if (error.response?.status >= 500 && error.response?.status < 600) {
      return true;
    }

    // HTTP 429 (too many requests)
    if (error.response?.status === 429) {
      return true;
    }

    // Default: don't retry
    return false;
  }
}

/**
 * Retry decorator for methods
 */
export function Retry(options?: RetryOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return RetryUtil.retry(
        () => originalMethod.apply(this, args),
        options,
      );
    };

    return descriptor;
  };
}

/**
 * Example usage:
 *
 * @Retry({
 *   maxAttempts: 3,
 *   initialDelay: 1000,
 *   retryIf: RetryUtil.isRetryableError,
 * })
 * async callExternalAPI() {
 *   return await axios.get('https://api.example.com');
 * }
 */
