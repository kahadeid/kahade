import { Logger } from '@nestjs/common';


/**
 * Circuit Breaker Pattern (HIGH-019)
 *
 * Prevents cascading failures when calling external services.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, reject requests immediately
 * - HALF_OPEN: Testing if service recovered
 *
 * Benefits:
 * - Fail fast instead of waiting for timeout
 * - Automatic recovery
 * - Prevents resource exhaustion
 * - Improves user experience
 */

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitBreakerConfig {
  // Number of failures before opening circuit
  failureThreshold: number;
  // Number of successes to close circuit from half-open
  successThreshold: number;
  // Timeout for requests (ms)
  timeout: number;
  // Time to wait before attempting recovery (ms)
  resetTimeout: number;
  // Name for logging
  name?: string;
}

interface CircuitBreakerMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rejectedRequests: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;
  private resetTimer?: NodeJS.Timeout;
  private readonly logger: Logger;
  private metrics: CircuitBreakerMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    rejectedRequests: 0,
  };

  constructor(private config: CircuitBreakerConfig) {
    this.logger = new Logger(
      `CircuitBreaker:${config.name || 'unnamed'}`,
    );
  }

  /**
   * Execute function with circuit breaker protection
   *
   * @param fn Function to execute
   * @param fallback Fallback function if circuit is open
   * @returns Result from fn or fallback
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T> | T,
  ): Promise<T> {
    this.metrics.totalRequests++;

    // If circuit is OPEN, fail fast
    if (this.state === CircuitState.OPEN) {
      this.metrics.rejectedRequests++;
      this.logger.warn('Circuit is OPEN, rejecting request');

      if (fallback) {
        return await Promise.resolve(fallback());
      }

      throw new Error('Circuit breaker is OPEN');
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn);

      // Success!
      this.onSuccess();
      return result;
    } catch (error) {
      // Failure
      this.onFailure(error);

      if (fallback) {
        return await Promise.resolve(fallback());
      }

      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Handle successful request
   */
  private _onSuccess() {
    this.metrics.successfulRequests++;
    this.metrics.lastSuccessTime = new Date();
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      // Enough successes to close circuit
      if (this.successCount >= this.config.successThreshold) {
        this.closeCircuit();
      }
    }
  }

  /**
   * Handle failed request
   */
  private _onFailure(error: Error) {
    this.metrics.failedRequests++;
    this.metrics.lastFailureTime = new Date();
    this.lastFailureTime = new Date();
    this.failureCount++;

    this.logger.error(
      `Request failed (${this.failureCount}/${this.config.failureThreshold}):`,
      error.message,
    );

    // Open circuit if threshold exceeded
    if (this.failureCount >= this.config.failureThreshold) {
      this.openCircuit();
    }
  }

  /**
   * Open circuit (stop all requests)
   */
  private _openCircuit() {
    this.state = CircuitState.OPEN;
    this.logger.warn(
      `Circuit OPENED after ${this.failureCount} failures`,
    );

    // Set timer to attempt recovery
    this.resetTimer = setTimeout(() => {
      this.attemptReset();
    }, this.config.resetTimeout);
  }

  /**
   * Close circuit (normal operation)
   */
  private _closeCircuit() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.logger.log('Circuit CLOSED, normal operation resumed');
  }

  /**
   * Attempt to recover from open state
   */
  private _attemptReset() {
    this.state = CircuitState.HALF_OPEN;
    this.successCount = 0;
    this.logger.log(
      'Circuit HALF-OPEN, testing if service recovered...',
    );
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  /**
   * Force open circuit (for testing or manual intervention)
   */
  forceOpen() {
    this.openCircuit();
  }

  /**
   * Force close circuit (for testing or manual intervention)
   */
  forceClose() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    this.closeCircuit();
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
  }
}

/**
 * Circuit Breaker Factory
 */
export class CircuitBreakerFactory {
  private static breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create circuit breaker
   */
  static getOrCreate(
    name: string,
    config: Partial<CircuitBreakerConfig> = {},
  ): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 30000,
        resetTimeout: 60000,
        name,
        ...config,
      };

      this.breakers.set(name, new CircuitBreaker(defaultConfig));
    }

    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breakers (for monitoring)
   */
  static getAll(): Map<string, CircuitBreaker> {
    return this.breakers;
  }
}
