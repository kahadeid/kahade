import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';



/**
 * Cache Service (HIGH-017, HIGH-019)
 *
 * Provides centralized caching for:
 * - Query results (wallet balance, user data)
 * - Session data
 * - Rate limiting counters
 * - Hot data (frequently accessed)
 *
 * Strategies:
 * - Time-based expiration (TTL)
 * - Manual invalidation
 * - Cache warming
 * - Cache-aside pattern
 */

export enum CacheKey {
  USER_BY_ID = 'user:id',
  USER_BY_EMAIL = 'user:email',
  WALLET_BY_USER = 'wallet:user',
  WALLET_BY_ID = 'wallet:id',
  ESCROW_BY_ID = 'escrow:id',
  TRANSACTION_LIST = 'transaction:list',
  DEPOSIT_LIST = 'deposit:list',
  WITHDRAWAL_LIST = 'withdrawal:list',
  SESSION = 'session',
  RATE_LIMIT = 'rate_limit',
}

export enum CacheTTL {
  VERY_SHORT = 60, // 1 minute
  SHORT = 300, // 5 minutes
  MEDIUM = 900, // 15 minutes
  LONG = 3600, // 1 hour
  VERY_LONG = 86400, // 24 hours
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache HIT: ${key}`);
      } else {
        this.logger.debug(`Cache MISS: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = CacheTTL.SHORT,
  ): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl * 1000); // Convert to milliseconds
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      // This requires Redis store
      const store = this.cacheManager.store as any;
      if (store.keys) {
        const keys = await store.keys(pattern);
        await Promise.all(keys.map((key: string) => this.del(key)));
        this.logger.debug(`Cache DEL pattern: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      this.logger.error(`Cache DEL pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Get or set value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = CacheTTL.SHORT,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // Not in cache, fetch from source
    const value = await factory();

    // Store in cache for next time
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Invalidate user-related cache
   */
  async invalidateUser(userId: string): Promise<void> {
    try {
    await Promise.all([
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
      this.del(`${CacheKey.USER_BY_ID}:${userId}`),
      this.delPattern(`${CacheKey.WALLET_BY_USER}:${userId}*`),
      this.delPattern(`${CacheKey.TRANSACTION_LIST}:${userId}*`),
      this.delPattern(`${CacheKey.SESSION}:${userId}*`),
    ]);
    this.logger.log(`Invalidated cache for user ${userId}`);
  }

  /**
   * Invalidate wallet-related cache
   */
  async invalidateWallet(walletId: string, userId: string): Promise<void> {
    try {
    await Promise.all([
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
      this.del(`${CacheKey.WALLET_BY_ID}:${walletId}`),
      this.del(`${CacheKey.WALLET_BY_USER}:${userId}`),
      this.delPattern(`${CacheKey.TRANSACTION_LIST}:${walletId}*`),
    ]);
    this.logger.log(`Invalidated cache for wallet ${walletId}`);
  }

  /**
   * Warm up cache with hot data
   */
  async warmUpCache(data: { key: string; value: any; ttl?: number }[]): Promise<void> {
    try {
    await Promise.all(
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
      data.map(({ key, value, ttl }) => this.set(key, value, ttl)),
    );
    this.logger.log(`Warmed up cache with ${data.length} entries`);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      const store = this.cacheManager.store as any;
      if (store.keys) {
        const keys = await store.keys('*');
        return {
          totalKeys: keys.length,
          timestamp: new Date(),
        };
      }
      return { message: 'Stats not available for this cache store' };
    } catch (error) {
      this.logger.error('Cache stats error:', error);
      return { error: 'Failed to get cache stats' };
    }
  }

  /**
   * Clear all cache (use with caution!)
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.warn('Cache RESET - all keys cleared');
    } catch (error) {
      this.logger.error('Cache reset error:', error);
    }
  }
}
