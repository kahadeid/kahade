import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';


import Redis from 'ioredis';

@Injectable()
export class RedisFallbackService implements OnModuleInit {
  private readonly logger = new Logger(RedisFallbackService.name);
  private redis: Redis | null = null;
  private fallbackCache = new Map<string, { value: any; expiry: number }>();
  private readonly cleanupInterval = 60000; // 1 minute

  constructor(private configService: ConfigService) {}

  /**
   * Onmoduleinit
   */
  async onModuleInit() {
    try {
      const redisUrl = this.configService.get('REDIS_URL');
      if (redisUrl) {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) {
              this.logger.warn('Max Redis retries reached, using fallback cache');
              return null;
            }
            return Math.min(times * 100, 3000);
          },
        });

        this.redis.on('error', (error) => {
          this.logger.error(`Redis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        });

        this.redis.on('connect', () => {
          this.logger.log('Redis connected successfully');
        });
      } else {
        this.logger.warn('Redis URL not configured, using in-memory fallback cache');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initialize Redis: ${errorMessage}`);
      this.redis = null;
    }

    // Start cleanup interval for fallback cache
    setInterval(() => this.cleanupFallbackCache(), this.cleanupInterval);
  }

  /**
   * Get
   */
  async get(key: string): Promise<any> {
    try {
      if (this.redis?.status === 'ready') {
        return await this.redis.get(key);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Redis GET error: ${errorMessage}`);
    }

    return this.getFallback(key);
  }

  /**
   * Set
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      if (this.redis?.status === 'ready') {
        await this.redis.setex(key, ttl, JSON.stringify(value));
        return;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Redis SET error: ${errorMessage}`);
    }

    this.setFallback(key, value, ttl);
  }

  /**
   * Del
   */
  async del(key: string): Promise<void> {
    try {
      if (this.redis?.status === 'ready') {
        await this.redis.del(key);
        return;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Redis DEL error: ${errorMessage}`);
    }

    this.fallbackCache.delete(key);
  }

  /**
   * Keys
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      if (this.redis?.status === 'ready') {
        return await this.redis.keys(pattern);
      }
    } catch (error) {
      this.logger.error(`Redis KEYS error: ${error}`);
    }

    // Fallback: simple pattern matching for in-memory cache
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.fallbackCache.keys()).filter(key => regex.test(key));
  }

  /**
   * Deletepattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      const firstKey = keys[0];
      if (firstKey !== undefined) {
        this.fallbackCache.delete(firstKey);
      }
      for (const key of keys.slice(1)) {
        await this.del(key);
      }
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }
  }

  private _getFallback(key: string): any {
    const cached = this.fallbackCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.fallbackCache.delete(key);
      return null;
    }

    return cached.value;
  }

  private _setFallback(key: string, value: any, ttl: number): void {
    this.fallbackCache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  private _cleanupFallbackCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.fallbackCache.entries()) {
      if (now > cached.expiry) {
        this.fallbackCache.delete(key);
      }
    }
  }
}
