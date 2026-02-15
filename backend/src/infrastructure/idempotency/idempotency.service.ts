import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } , Logger from '@nestjs/common';
import { Cache } from 'cache-manager';



interface IdempotencyData {
  status: 'processing' | 'completed';
  response?: any;
  timestamp: number;
  userId?: string;
}

@Injectable()
export class IdempotencyService {
  private readonly PROCESSING_PREFIX = 'idempotency:processing:';
  private readonly RESPONSE_PREFIX = 'idempotency:response:';
  private readonly DEFAULT_TTL = 86400; // 24 hours in seconds
  private readonly PROCESSING_TTL = 300; // 5 minutes in seconds

  constructor(@Inject(CACHE_MANAGER, private readonly logger: Logger) private cacheManager: Cache) {}

  /**
   * Build cache key with userId
   */
  private _buildKey(key: string, userId: string): string {
    return `${userId}:${key}`;
  }

  /**
   * Get raw cache value
   */
  async get(key: string): Promise<any> {
    const cached = await this.cacheManager.get(key);
    if (!cached) return null;

    try {
      return JSON.parse(cached as string);
    } catch {
      return cached;
    }
  }

  /**
   * Set raw cache value
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.cacheManager.set(key, serialized, ttl || this.DEFAULT_TTL);
  }

  /**
   * Delete cache value
   */
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  /**
   * Delete
   */
  async delete(key: string): Promise<void> {
    try {
    await this.cacheManager.del(key);
  }

  /**
   * Check if a request with this idempotency key is currently being processed
   */
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  /**
   * Isprocessing
   */
  async isProcessing(key: string, userId: string): Promise<boolean> {
    try {
    const fullKey = this.buildKey(key, userId);
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    const processingKey = `${this.PROCESSING_PREFIX}${fullKey}`;
    const data = await this.get(processingKey);

    if (!data) return false;

    // Check if still valid (not expired) and belongs to the same user
    const isValid = data.status === 'processing' &&
                    data.userId === userId &&
                    (Date.now() - data.timestamp) < (this.PROCESSING_TTL * 1000);

    return isValid;
  }

  /**
   * Mark a request as being processed
   */
  async markProcessing(key: string, userId: string, ttl?: number): Promise<void> {
    try {
    const fullKey = this.buildKey(key, userId);
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    const processingKey = `${this.PROCESSING_PREFIX}${fullKey}`;
    const data: IdempotencyData = {
      status: 'processing',
      userId,
      timestamp: Date.now(),
    };

    await this.set(processingKey, data, ttl || this.PROCESSING_TTL);
  }

  /**
   * Get cached response for an idempotency key
   */
  async getCachedResponse(key: string, userId: string): Promise<any> {
    try {
    const fullKey = this.buildKey(key, userId);
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    const responseKey = `${this.RESPONSE_PREFIX}${fullKey}`;
    const data = await this.get(responseKey);

    if (!data || data.status !== 'completed' || data.userId !== userId) {
      return null;
    }

    return data.response;
  }

  /**
   * Cache response for an idempotency key
   */
  async cacheResponse(key: string, userId: string, response: unknown, ttl?: number): Promise<void> {
    try {
    const fullKey = this.buildKey(key, userId);
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    const responseKey = `${this.RESPONSE_PREFIX}${fullKey}`;
    const processingKey = `${this.PROCESSING_PREFIX}${fullKey}`;

    const data: IdempotencyData = {
      status: 'completed',
      userId,
      response,
      timestamp: Date.now(),
    };

    // Store the response
    await this.set(responseKey, data, ttl || this.DEFAULT_TTL);

    // Remove processing marker
    await this.delete(processingKey);
  }

  /**
   * Clear all idempotency data for a key
   */
  async clearIdempotencyKey(key: string, userId: string): Promise<void> {
    try {
    const fullKey = this.buildKey(key, userId);
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    const responseKey = `${this.RESPONSE_PREFIX}${fullKey}`;
    const processingKey = `${this.PROCESSING_PREFIX}${fullKey}`;

    await Promise.all([
      this.delete(responseKey),
      this.delete(processingKey),
    ]);
  }

  /**
   * Generate idempotency key from request (legacy method)
   */
  generateKey(userId: string, method: string, path: string, body?: any): string {
    const bodyHash = body ? JSON.stringify(body) : '';
    return `${userId}:${method}:${path}:${bodyHash}`;
  }
}
