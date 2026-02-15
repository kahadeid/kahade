/**
 * Code Refactoring Utilities (MEDIUM-014)
 *
 * Helper functions for common refactoring patterns
 */

/**
 * Extract reusable logic from duplicated code
 */
export class RefactoringHelpers {
  /**
   * Retry operation with exponential backoff (extracted pattern)
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    initialDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await this.sleep(initialDelay * Math.pow(2, attempt - 1));
        }
      }
    }
    throw lastError!;
  }

  /**
   * Extract conditional logic to strategy pattern
   */
  static executeStrategy<T>(
    strategies: Record<string, () => T>,
    key: string,
    defaultStrategy?: () => T,
  ): T {
    const strategy = strategies[key] || defaultStrategy;
    if (!strategy) {
      throw new Error(`No strategy found for: ${key}`);
    }
    return strategy();
  }

  /**
   * Replace nested ifs with early returns
   */
  static validateOrThrow(
    conditions: Array<{ condition: boolean; error: Error }>,
  ): void {
    for (const { condition, error } of conditions) {
      if (!condition) {
        throw error;
      }
    }
  }

  /**
   * Extract common error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorHandler: (error: Error) => void,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      errorHandler(error as Error);
      throw error;
    }
  }

  /**
   * Group related data transformations
   */
  static pipeline<T>(...transformers: Array<(data: T) => T>): (data: T) => T {
    return (data: T) => transformers.reduce((acc, fn) => fn(acc), data);
  }

  /**
   * Replace magic numbers with constants
   */
  static readonly CONSTANTS = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    CACHE_TTL: 3600,
    MAX_RETRY_ATTEMPTS: 3,
    REQUEST_TIMEOUT: 5000,
  } as const;

  /**
   * Extract duplicated null checks
   */
  static getOrThrow<T>(value: T | null | undefined, errorMessage: string): T {
    if (value === null || value === undefined) {
      throw new Error(errorMessage);
    }
    return value;
  }

  /**
   * Extract array operations
   */
  static groupBy<T, K extends string | number>(
    items: T[],
    keyFn: (item: T) => K,
  ): Record<K, T[]> {
    return items.reduce((acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<K, T[]>);
  }

  /**
   * Extract promise handling
   */
  static async allSettledWithResults<T>(
    promises: Promise<T>[],
  ): Promise<{ successes: T[]; failures: Error[] }> {
    const results = await Promise.allSettled(promises);
    return {
      successes: results
        .filter((r) => r.status === 'fulfilled')
        .map((r: any) => r.value),
      failures: results
        .filter((r) => r.status === 'rejected')
        .map((r: any) => r.reason),
    };
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Before refactoring:
 *
 * if (user) {
 *   if (user.isActive) {
 *     if (user.hasPermission) {
 *       return doSomething();
 *     }
 *   }
 * }
 *
 * After refactoring:
 *
 * RefactoringHelpers.validateOrThrow([
 *   { condition: !!user, error: new Error('User not found') },
 *   { condition: user.isActive, error: new Error('User inactive') },
 *   { condition: user.hasPermission, error: new Error('No permission') },
 * ]);
 * return doSomething();
 */
