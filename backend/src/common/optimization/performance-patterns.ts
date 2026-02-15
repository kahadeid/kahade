import { Injectable } from '@nestjs/common';


/**
 * Performance Optimization Patterns (MEDIUM-015)
 */

@Injectable()
export class PerformancePatterns {
  /**
   * Lazy Loading Pattern
   * Only load data when needed
   */
  private cache = new Map<string, any>();

  async lazyLoad<T>(key: string, loader: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const data = await loader();
    this.cache.set(key, data);
    return data;
  }

  /**
   * Memoization Pattern
   * Cache function results
   */
  memoize<T extends (...args: unknown[]) => any>(fn: T): T {
    const cache = new Map<string, ReturnType<T>>();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  /**
   * Debounce Pattern
   * Delay execution until after calls have stopped
   */
  debounce<T extends (...args: unknown[]) => any>(
    fn: T,
    delay: number,
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle Pattern
   * Limit execution frequency
   */
  throttle<T extends (...args: unknown[]) => any>(
    fn: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Batch Processing Pattern
   * Process items in chunks
   */
  async processBatch<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 10,
  ): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }
    return results;
  }

  /**
   * Parallel Processing Pattern
   * Execute tasks concurrently with limit
   */
  async processParallel<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrency: number = 5,
  ): Promise<R[]> {
    const results: R[] = [];
    const executing: Promise<void>[] = [];

    for (const item of items) {
      const promise = processor(item).then((result) => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex((p) => p === promise),
          1,
        );
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Object Pool Pattern
   * Reuse expensive objects
   */
  createObjectPool<T>(factory: () => T, maxSize: number = 10) {
    const pool: T[] = [];

    return {
      acquire: (): T => {
        return pool.pop() || factory();
      },
      release: (obj: T): void => {
        if (pool.length < maxSize) {
          pool.push(obj);
        }
      },
      size: () => pool.length,
    };
  }

  /**
   * Stream Processing Pattern
   * Process large datasets without loading all into memory
   */
  async* streamProcess<T>(
    source: AsyncIterable<T>,
    transformer: (item: T) => T,
  ): AsyncGenerator<T> {
    for await (const item of source) {
      yield transformer(item);
    }
  }
}

/**
 * Usage examples:
 *
 * // Memoization
 * const expensiveCalc = patterns.memoize((n: number) => {
 *   // expensive calculation
 *   return n * n;
 * });
 *
 * // Debounce (search input)
 * const search = patterns.debounce((query: string) => {
 *   return api.search(query);
 * }, 300);
 *
 * // Throttle (scroll event)
 * const handleScroll = patterns.throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 *
 * // Batch processing
 * await patterns.processBatch(
 *   users,
 *   (batch) => prisma.user.createMany({ data: batch }),
 *   100
 * );
 *
 * // Parallel processing
 * const results = await patterns.processParallel(
 *   urls,
 *   (url) => fetch(url),
 *   5 // max 5 concurrent requests
 * );
 */
