import { SetMetadata } from '@nestjs/common';


/**
 * Cache Response Decorator
 * Mark endpoints for HTTP caching
 *
 * Usage:
 * ```typescript
 * @Get('public/info')
 * @CacheResponse({ ttl: 300, public: true })
 * getPublicInfo() {
 *   return { info: 'public data' };
 * }
 * ```
 */
export const CACHE_METADATA = 'cache:config';

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  public?: boolean; // Public or private cache
}

export const CacheResponse = (config: CacheConfig) =>
  SetMetadata(CACHE_METADATA, config);
