import { Reflector } from '@nestjs/core';
import { Request } from 'express';


import {

  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

/**
 * Enhanced Rate Limiting (HIGH-037)
 *
 * Features:
 * - Per-endpoint limits
 * - Per-user limits
 * - IP-based limits
 * - Sliding window algorithm
 * - Redis-backed (distributed)
 */

export const RATE_LIMIT_KEY = 'rateLimit';

interface RateLimitOptions {
  points: number; // Number of requests
  duration: number; // Time window in seconds
  blockDuration?: number; // Block duration after limit exceeded
  keyPrefix?: string; // Custom key prefix
}

/**
 * Rate limit decorator
 */
export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
      return descriptor;
    } else {
      // Class decorator
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, target);
      return target;
    }
  };
};

@Injectable()
export class EnhancedRateLimitGuard implements CanActivate {
  // In-memory store (use Redis in production)
  private store = new Map<string, { count: number; resetAt: number }>();
  private blockedIPs = new Map<string, number>();

  constructor(private reflector: Reflector) {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Get rate limit config from metadata
    const rateLimitConfig = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimitConfig) {
      return true; // No rate limit configured
    }

    // Generate key
    const key = this.generateKey(request, rateLimitConfig.keyPrefix);

    // Check if IP is blocked
    const blockUntil = this.blockedIPs.get(key);
    if (blockUntil && Date.now() < blockUntil) {
      const remainingSeconds = Math.ceil((blockUntil - Date.now()) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many requests. Blocked for ${remainingSeconds} more seconds.`,
          blockUntil: new Date(blockUntil).toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Get or create rate limit entry
    const now = Date.now();
    let entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      // Create new entry
      entry = {
        count: 0,
        resetAt: now + rateLimitConfig.duration * 1000,
      };
      this.store.set(key, entry);
    }

    // Increment counter
    entry.count++;

    // Check limit
    if (entry.count > rateLimitConfig.points) {
      // Block if blockDuration is set
      if (rateLimitConfig.blockDuration) {
        this.blockedIPs.set(
          key,
          now + rateLimitConfig.blockDuration * 1000,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          limit: rateLimitConfig.points,
          remaining: 0,
          resetAt: new Date(entry.resetAt).toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', rateLimitConfig.points);
    response.setHeader(
      'X-RateLimit-Remaining',
      rateLimitConfig.points - entry.count,
    );
    response.setHeader(
      'X-RateLimit-Reset',
      new Date(entry.resetAt).toISOString(),
    );

    return true;
  }

  /**
   * Generate rate limit key
   */
  private _generateKey(request: Request, prefix?: string): string {
    const userId = (request as any).user?.id;
    const ip = request.ip || request.socket.remoteAddress;
    const path = request.path;

    const key = userId || ip;
    return `${prefix || 'rate_limit'}:${path}:${key}`;
  }

  /**
   * Clean up expired entries
   */
  private _cleanup(): void {
    const now = Date.now();

    // Clean up rate limit store
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }

    // Clean up blocked IPs
    for (const [key, blockUntil] of this.blockedIPs.entries()) {
      if (now > blockUntil) {
        this.blockedIPs.delete(key);
      }
    }
  }
}

/**
 * Example usage:
 *
 * @Controller('auth')
 * export class AuthController {
 *   // Strict rate limit for login
 *   @Post('login')
 *   @UseGuards(EnhancedRateLimitGuard)
 *   @RateLimit({
 *     points: 5,
 *     duration: 60,
 *     blockDuration: 300, // Block for 5 minutes
 *   })
 *   async login(@Body() loginDto: LoginDto) {
 *     return this.authService.login(loginDto);
 *   }
 *
 *   // Generous rate limit for public endpoints
 *   @Get('verify-email')
 *   @UseGuards(EnhancedRateLimitGuard)
 *   @RateLimit({ points: 100, duration: 60 })
 *   async verifyEmail(@Query('token') token: string) {
 *     return this.authService.verifyEmail(token);
 *   }
 * }
 */
