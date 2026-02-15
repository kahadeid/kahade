import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';



/**
 * Advanced Caching Strategies (MEDIUM-004)
 *
 * Patterns:
 * - Cache-Aside (Lazy Loading)
 * - Write-Through
 * - Write-Behind
 * - Refresh-Ahead
 * - Time-based expiration
 * - LRU eviction
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  refresh?: boolean; // Refresh on get
  tags?: string[]; // Cache tags for invalidation
}

@Injectable()
export class AdvancedCacheService {
  private readonly logger = new Logger(AdvancedCacheService.name);
  private redis: Redis;
  private hitCount = 0;
  private missCount = 0;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
  }

  /**
   * Cache-Aside Pattern (Lazy Loading)
   * Get from cache, load from DB if missing
   */
  async cacheAside<T>(
    key: string,
    loader: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.hitCount++;
      return cached;
    }

    this.missCount++;

    // Load from source
    const data = await loader();

    // Store in cache
    await this.set(key, data, options.ttl);

    return data;
  }

  /**
   * Write-Through Pattern
   * Write to cache and DB simultaneously
   */
  async writeThrough<T>(
    key: string,
    data: T,
    writer: (data: T) => Promise<void>,
    ttl?: number,
  ): Promise<void> {
    // Write to both cache and DB
    await Promise.all([this.set(key, data, ttl), writer(data)]);
  }

  /**
   * Write-Behind Pattern (Async Write)
   * Write to cache immediately, DB asynchronously
   */
  async writeBehind<T>(
    key: string,
    data: T,
    writer: (data: T) => Promise<void>,
    ttl?: number,
  ): Promise<void> {
    // Write to cache immediately
    await this.set(key, data, ttl);

    // Write to DB asynchronously (don't wait)
    writer(data).catch((error) => {
      this.logger.error(`Write-behind failed for ${key}:`, error);
    });
  }

  /**
   * Refresh-Ahead Pattern
   * Proactively refresh cache before expiration
   */
  async refreshAhead<T>(
    key: string,
    loader: () => Promise<T>,
    ttl: number = 3600,
    refreshThreshold: number = 0.8, // Refresh at 80% TTL
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      // Check if we should refresh
      const remainingTtl = await this.redis.ttl(key);
      const shouldRefresh = remainingTtl < ttl * (1 - refreshThreshold);

      if (shouldRefresh) {
        // Refresh asynchronously
        loader()
          .then((data) => this.set(key, data, ttl))
          .catch((error) => {
            this.logger.error(`Refresh-ahead failed for ${key}:`, error);
          });
      }

      return cached;
    }

    // Cache miss, load and store
    const data = await loader();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Get from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Cache get failed for ${key}:`, error);
      return null;
    }
  }

  /**
   * Set to cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Cache set failed for ${key}:`, error);
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<void> {
    try {
    await this.redis.del(key);
  }

  /**
   * Delete by pattern
   */
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  /**
   * Deletebypattern
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }
  }

  /**
   * Invalidate by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    try {
    for (const tag of tags) {
      await this.deleteByPattern(`*:tag:${tag}:*`);
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0;

    return {
      hits: this.hitCount,
      misses: this.missCount,
      total,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }
}

/**
 * Usage examples:
 *
 * // Cache-Aside (most common)
 * const user = await cacheService.cacheAside(
 *   `user:${id}`,
 *   () => prisma.user.findUnique({ where: { id } }),
 *   { ttl: 3600 }
 * );
 *
 * // Write-Through (consistency important)
 * await cacheService.writeThrough(
 *   `user:${user.id}`,
 *   user,
 *   async (data) => {
 *     await prisma.user.update({ where: { id: data.id }, data });
 *   },
 *   3600
 * );
 *
 * // Write-Behind (performance critical)
 * await cacheService.writeBehind(
 *   `counter:${id}`,
 *   newCount,
 *   async (count) => {
 *     await prisma.counter.update({ where: { id }, data: { count } });
 *   }
 * );
 *
 * // Refresh-Ahead (popular data)
 * const popularUser = await cacheService.refreshAhead(
 *   `popular-user:${id}`,
 *   () => prisma.user.findUnique({ where: { id } }),
 *   3600,
 *   0.8 // Refresh at 80% TTL
 * );
 *
 * // Invalidation
 * await cacheService.delete(`user:${id}`);
 * await cacheService.deleteByPattern('user:*');
 * await cacheService.invalidateByTags(['users', 'profiles']);
 */
