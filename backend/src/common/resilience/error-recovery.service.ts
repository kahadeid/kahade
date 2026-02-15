import { Injectable, Logger } from '@nestjs/common';


/**
 * Error Recovery Patterns (MEDIUM-006)
 *
 * Patterns:
 * - Automatic retry with exponential backoff
 * - Circuit breaker
 * - Fallback mechanisms
 * - Dead letter queue
 * - Error aggregation
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

@Injectable()
export class ErrorRecoveryService {
  private readonly logger = new Logger(ErrorRecoveryService.name);
  private circuitBreakers = new Map<string, CircuitBreaker>();

  /**
   * Retry with exponential backoff
   */
  async retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2,
      retryableErrors = [],
    } = options;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: Error) {
        lastError = error;

        // Check if error is retryable
        if (
          retryableErrors.length > 0 &&
          !retryableErrors.includes(error.code || error.name)
        ) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxAttempts) {
          break;
        }

        this.logger.warn(
          `Attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms...`,
          { error: error.message },
        );

        await this.sleep(delay);

        // Exponential backoff
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Execute with circuit breaker
   */
  async withCircuitBreaker<T>(
    name: string,
    operation: () => Promise<T>,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
    } = {},
  ): Promise<T> {
    let breaker = this.circuitBreakers.get(name);

    if (!breaker) {
      breaker = new CircuitBreaker(
        name,
        options.failureThreshold || 5,
        options.resetTimeout || 60000,
      );
      this.circuitBreakers.set(name, breaker);
    }

    if (breaker.isOpen()) {
      throw new Error(`Circuit breaker '${name}' is open`);
    }

    try {
      const result = await operation();
      breaker.recordSuccess();
      return result;
    } catch (error) {
      breaker.recordFailure();
      throw error;
    }
  }

  /**
   * Execute with fallback
   */
  async withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T> | T,
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      this.logger.warn('Primary operation failed, using fallback', {
        error: (error as Error).message,
      });
      return await fallback();
    }
  }

  /**
   * Execute with timeout
   */
  async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return Promise.race([
      operation(),
      this.timeout(timeoutMs),
    ]) as Promise<T>;
  }

  /**
   * Aggregate similar errors
   */
  private errorAggregator = new Map<
    string,
    { count: number; lastSeen: Date }
  >();

  aggregateError(error: Error): void {
    const key = `${error.name}:${error.message}`;
    const existing = this.errorAggregator.get(key);

    if (existing) {
      existing.count++;
      existing.lastSeen = new Date();
    } else {
      this.errorAggregator.set(key, { count: 1, lastSeen: new Date() });
    }

    // Log aggregated errors every 100 occurrences
    const current = this.errorAggregator.get(key)!;
    if (current.count % 100 === 0) {
      this.logger.error(
        `Error aggregation: ${key} occurred ${current.count} times`,
      );
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(name: string) {
    const breaker = this.circuitBreakers.get(name);
    return breaker ? breaker.getStatus() : null;
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(name: string): void {
    const breaker = this.circuitBreakers.get(name);
    if (breaker) {
      breaker.reset();
    }
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private _timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), ms),
    );
  }
}

/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;

  constructor(
    private name: string,
    private failureThreshold: number,
    private resetTimeout: number,
  ) {}

  isOpen(): boolean {
    if (this.state === 'OPEN') {
      // Check if we should try half-open
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime.getTime() > this.resetTimeout
      ) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.successCount++;

    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

/**
 * Usage examples:
 *
 * // Retry with exponential backoff
 * const result = await errorRecovery.retry(
 *   () => externalApi.call(),
 *   {
 *     maxAttempts: 3,
 *     initialDelay: 1000,
 *     retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
 *   }
 * );
 *
 * // Circuit breaker
 * const data = await errorRecovery.withCircuitBreaker(
 *   'external-api',
 *   () => externalApi.getData(),
 *   { failureThreshold: 5, resetTimeout: 60000 }
 * );
 *
 * // Fallback
 * const user = await errorRecovery.withFallback(
 *   () => database.getUser(id),
 *   () => cache.getUser(id) || defaultUser
 * );
 *
 * // Timeout
 * const result = await errorRecovery.withTimeout(
 *   () => slowOperation(),
 *   5000 // 5 seconds
 * );
 */
