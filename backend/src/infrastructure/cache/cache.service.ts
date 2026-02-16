import { Injectable, Logger } from '@nestjs/common';


// Import { Redis } from 'ioredis';

/**
 * Caching Strategy with Redis (HIGH-022)
 *
 * Implements:
 * - Cache-aside pattern
 * - Distributed cache
 * - TTL management
 * - Cache invalidation
 * - Cache warming
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string; // Cache namespace for grouping
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  // Private redis: Redis;
  private memoryCache = new Map<string, { value: any; expiry: number }>();
  private readonly defaultTTL = 300; // 5 minutes

  constructor() {
    // NOTE: Initialize Redis when available - Tracked in backlog
    // This.redis = new Redis({
    //   host: process.env.REDIS_HOST,
    //   port: parseInt(process.env.REDIS_PORT || '6379'),
    //   password: process.env.REDIS_PASSWORD,
    // });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const fullKey = this.buildKey(key, options?.namespace);

    try {

      // Memory cache fallback
      const cached = this.memoryCache.get(fullKey);
      if (!cached) return null;

      // Check expiry
      if (Date.now() > cached.expiry) {
        this.memoryCache.delete(fullKey);
        return null;
      }

      return cached.value as T;
    } catch (error) {
      this.logger.error(`Cache get error for key ${fullKey}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(
    key: string,
    value: any,
    options?: CacheOptions,
  ): Promise<void> {
    const fullKey = this.buildKey(key, options?.namespace);
    const ttl = options?.ttl || this.defaultTTL;

    try {
      // NOTE: Use Redis when available - Tracked in backlog
      // Await this.redis.setex(fullKey, ttl, JSON.stringify(value));

      // Memory cache fallback
      this.memoryCache.set(fullKey, {
        value,
        expiry: Date.now() + ttl * 1000,
      });
    } catch (error) {
      this.logger.error(`Cache set error for key ${fullKey}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.namespace);

    try {
      // NOTE: Use Redis when available - Tracked in backlog
      // Await this.redis.del(fullKey);

      // Memory cache fallback
      this.memoryCache.delete(fullKey);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${fullKey}:`, error);
    }
  }

  /**
   * Delete all keys in namespace
   */
  async invalidateNamespace(namespace: string): Promise<void> {
    try {

      // Memory cache fallback
      const prefix = `${namespace}:`;
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      this.logger.error(
        `Cache invalidate namespace error for ${namespace}:`,
        error,
      );
    }
  }

  /**
   * Cache-aside pattern helper
   * Gets from cache, or fetches and caches if not found
   */
  async wrap<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const value = await fetchFn();

    // Cache the result
    await this.set(key, value, options);

    return value;
  }

  /**
   * Build full cache key with namespace
   */
  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
    };
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
    // NOTE: Use Redis when available - Tracked in backlog
    // Await this.redis.flushdb();

    // Memory cache fallback
    this.memoryCache.clear();
  }
}

/**
 * Cache decorator for methods
 */
export function Cacheable(options?: CacheOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheService: CacheService = this.cacheService;
      if (!cacheService) {
        // No cache service, execute normally
        return originalMethod.apply(this, args);
      }

      // Generate cache key from method name and arguments
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      // Use cache-aside pattern
      return cacheService.wrap(
        cacheKey,
        () => originalMethod.apply(this, args),
        options,
      );
    };

    return descriptor;
  };
}
