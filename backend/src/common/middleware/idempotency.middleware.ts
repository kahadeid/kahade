import { CacheService } from '@infrastructure/cache/cache.service';
import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';


import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';

/**
 * Idempotency Middleware (HIGH-024)
 *
 * Prevents duplicate requests using idempotency keys.
 *
 * Usage:
 * Client sends header: Idempotency-Key: <unique-key>
 *
 * Benefits:
 * - Prevents duplicate charges/transfers
 * - Safe retries for clients
 * - Network failure protection
 * - Race condition prevention
 *
 * How it works:
 * 1. Client sends idempotency key with request
 * 2. Server checks if key already processed
 * 3. If yes, return cached response
 * 4. If no, process request and cache response
 */

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  private readonly IDEMPOTENCY_HEADER = 'idempotency-key';
  private readonly CACHE_TTL = 24 * 60 * 60; // 24 hours
  private readonly CACHE_NAMESPACE = 'idempotency';

  constructor(private cacheService: CacheService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only apply to mutating methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    // Get idempotency key from header
    const idempotencyKey = req.headers[
      this.IDEMPOTENCY_HEADER
    ] as string;

    // If no key provided, skip (make it optional)
    if (!idempotencyKey) {
      return next();
    }

    // Validate key format
    if (!this.isValidKey(idempotencyKey)) {
      throw new BadRequestException(
        'Invalid idempotency key format. Must be 16-128 characters.',
      );
    }

    // Build cache key
    const cacheKey = this.buildCacheKey(req, idempotencyKey);

    // Check if request already processed
    const cachedResponse = await this.cacheService.get(cacheKey, {
      namespace: this.CACHE_NAMESPACE,
    }) as { statusCode: number; body: unknown } | null;

    if (cachedResponse) {
      // Return cached response
      return res
        .status(cachedResponse.statusCode)
        .set('X-Idempotent-Replayed', 'true')
        .json(cachedResponse.body);
    }

    // Intercept response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      // Cache the response
      this.cacheService
        .set(
          cacheKey,
          {
            statusCode: res.statusCode,
            body,
            timestamp: new Date().toISOString(),
          },
          {
            namespace: this.CACHE_NAMESPACE,
            ttl: this.CACHE_TTL,
          },
        )
        .catch((err) => {
          // Don't fail the request if caching fails
          });

      return originalJson(body);
    };

    next();
  }

  /**
   * Validate idempotency key format
   */
  private isValidKey(key: string): boolean {
    // Key must be 16-128 characters
    if (key.length < 16 || key.length > 128) {
      return false;
    }

    // Key should be alphanumeric with hyphens/underscores
    return /^[a-zA-Z0-9_-]+$/.test(key);
  }

  /**
   * Build cache key from request and idempotency key
   */
  private buildCacheKey(req: Request, idempotencyKey: string): string {
    // Include method and path to make key unique per endpoint
    return `${req.method}:${req.path}:${idempotencyKey}`;
  }
}

/**
 * Generate idempotency key (for clients)
 */
export function generateIdempotencyKey(): string {
  return nanoid(32);
}

/**
 * Example client usage:
 *
 * const idempotencyKey = generateIdempotencyKey();
 *
 * axios.post('/api/wallet/deposit', data, {
 *   headers: {
 *     'Idempotency-Key': idempotencyKey,
 *   },
 * });
 *
 * // Safe to retry with same key
 * axios.post('/api/wallet/deposit', data, {
 *   headers: {
 *     'Idempotency-Key': idempotencyKey, // Same key!
 *   },
 * });
 */
