import { ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { applyDecorators } from '@nestjs/common';


/**
 * Rate Limiting Presets
 *
 * Predefined rate limits for common scenarios.
 * All limits are per user/IP within the specified time window.
 */

export interface RateLimitConfig {
  limit: number;  // Number of requests
  ttl: number;    // Time window in milliseconds
}

/**
 * Rate Limit Presets
 */
export const RateLimitPresets = {
  /**
   * Very Strict - For highly sensitive operations
   * 3 requests per hour
   */
  VERY_STRICT: { limit: 3, ttl: 3600000 },

  /**
   * Strict - For sensitive operations (auth, KYC, payments)
   * 5 requests per hour
   */
  STRICT: { limit: 5, ttl: 3600000 },

  /**
   * Moderate - For standard write operations
   * 20 requests per hour
   */
  MODERATE: { limit: 20, ttl: 3600000 },

  /**
   * Standard - For regular API endpoints
   * 100 requests per minute
   */
  STANDARD: { limit: 100, ttl: 60000 },

  /**
   * Relaxed - For read-heavy operations
   * 300 requests per minute
   */
  RELAXED: { limit: 300, ttl: 60000 },

  /**
   * Public - For public endpoints
   * 30 requests per minute
   */
  PUBLIC: { limit: 30, ttl: 60000 },
};

/**
 * Apply Rate Limit
 *
 * Comprehensive rate limiting decorator with documentation.
 *
 * Usage:
 * ```typescript
 * @ApplyRateLimit(RateLimitPresets.STRICT)
 * @Post('sensitive-operation')
 * async sensitiveOp() {}
 * ```
 */
export function ApplyRateLimit(
  config: RateLimitConfig,
  description?: string,
) {
  const limitDescription = description ||
    `Rate limited to ${config.limit} requests per ${config.ttl / 1000} seconds`;

  return applyDecorators(
    Throttle({ default: config }),
    ApiResponse({
      status: 429,
      description: `Too Many Requests - ${limitDescription}`,
    }),
  );
}

/**
 * Auth Operation Rate Limit
 * Strict: 5 per hour
 */
export function AuthRateLimit() {
  return ApplyRateLimit(
    RateLimitPresets.STRICT,
    'Authentication operations limited to 5 per hour',
  );
}

/**
 * Payment Operation Rate Limit
 * Strict: 5 per hour
 */
export function PaymentRateLimit() {
  return ApplyRateLimit(
    RateLimitPresets.STRICT,
    'Payment operations limited to 5 per hour',
  );
}

/**
 * Withdrawal Operation Rate Limit
 * Very Strict: 3 per hour
 */
export function WithdrawalRateLimit() {
  return ApplyRateLimit(
    RateLimitPresets.VERY_STRICT,
    'Withdrawal operations limited to 3 per hour',
  );
}

/**
 * KYC Operation Rate Limit
 * Very Strict: 3 per day (86400000 ms)
 */
export function KycRateLimit() {
  return ApplyRateLimit(
    { limit: 3, ttl: 86400000 },
    'KYC operations limited to 3 per day',
  );
}

/**
 * Profile Update Rate Limit
 * Moderate: 10 per hour
 */
export function ProfileUpdateRateLimit() {
  return ApplyRateLimit(
    { limit: 10, ttl: 3600000 },
    'Profile updates limited to 10 per hour',
  );
}

/**
 * Read Operation Rate Limit
 * Standard: 100 per minute
 */
export function ReadRateLimit() {
  return ApplyRateLimit(
    RateLimitPresets.STANDARD,
    'Read operations limited to 100 per minute',
  );
}

/**
 * Write Operation Rate Limit
 * Moderate: 20 per hour
 */
export function WriteRateLimit() {
  return ApplyRateLimit(
    RateLimitPresets.MODERATE,
    'Write operations limited to 20 per hour',
  );
}

/**
 * Public Endpoint Rate Limit
 * Public: 30 per minute
 */
export function PublicRateLimit() {
  return ApplyRateLimit(
    RateLimitPresets.PUBLIC,
    'Public endpoint limited to 30 requests per minute',
  );
}

/**
 * Search Operation Rate Limit
 * Relaxed: 300 per minute
 */
export function SearchRateLimit() {
  return ApplyRateLimit(
    RateLimitPresets.RELAXED,
    'Search operations limited to 300 per minute',
  );
}

/**
 * Transaction Creation Rate Limit
 * Moderate: 20 per hour
 */
export function TransactionRateLimit() {
  return ApplyRateLimit(
    RateLimitPresets.MODERATE,
    'Transaction creation limited to 20 per hour',
  );
}

/**
 * Custom Rate Limit
 *
 * For specific use cases not covered by presets.
 *
 * Usage:
 * ```typescript
 * @CustomRateLimit(10, 60000, 'Custom operation: 10 per minute')
 * ```
 */
export function CustomRateLimit(
  limit: number,
  ttl: number,
  description?: string,
) {
  return ApplyRateLimit({ limit, ttl }, description);
}

/**
 * Per-IP Rate Limit (for public endpoints)
 *
 * More lenient than authenticated endpoints.
 */
export function PerIpRateLimit(config: RateLimitConfig = RateLimitPresets.PUBLIC) {
  return ApplyRateLimit(
    config,
    `IP-based rate limit: ${config.limit} per ${config.ttl / 1000}s`,
  );
}

/**
 * Burst Rate Limit
 *
 * Allows short bursts but limits sustained usage.
 * Example: 10 per minute, but max 50 per hour
 */
export function BurstRateLimit() {
  // NestJS Throttler doesn't support burst out of box,
  // But we can document the pattern
  return ApplyRateLimit(
    { limit: 10, ttl: 60000 },
    'Burst limit: 10 per minute',
  );
}

/**
 * USAGE EXAMPLES:
 *
 * ```typescript
 * // 1. Using presets
 * @Post('login')
 * @AuthRateLimit()
 * async login() {}
 *
 * // 2. Using custom config
 * @Post('custom')
 * @ApplyRateLimit({ limit: 5, ttl: 60000 })
 * async customOp() {}
 *
 * // 3. Multiple endpoints with same limit
 * @Controller('transactions')
 * export class TransactionController {
 *   @Post()
 *   @TransactionRateLimit()
 *   async create() {}
 *
 *   @Put(':id')
 *   @TransactionRateLimit()
 *   async update() {}
 * }
 *
 * // 4. Public endpoint
 * @Get('public-data')
 * @Public()
 * @PublicRateLimit()
 * async getPublicData() {}
 * ```
 *
 * BEST PRACTICES:
 * - Always add rate limiting to write operations
 * - Use stricter limits for sensitive operations (auth, payment, withdrawal)
 * - Use moderate limits for standard operations
 * - Use relaxed limits for read operations
 * - Add rate limiting to public endpoints to prevent abuse
 * - Document rate limits in API documentation
 * - Monitor rate limit violations for potential abuse
 */
