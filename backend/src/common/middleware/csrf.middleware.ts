import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';


import {

  Injectable,
  NestMiddleware,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

/**
 * CSRF Protection Middleware (HIGH-005)
 *
 * Protects against Cross-Site Request Forgery attacks.
 * Implements double-submit cookie pattern.
 *
 * How it works:
 * 1. Server generates CSRF token on session creation
 * 2. Token sent to client in cookie and response body
 * 3. Client must send token in header on state-changing requests
 * 4. Server validates token matches session token
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CsrfMiddleware.name);

  // Methods that don't modify state (safe methods)
  private readonly SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

  // Paths that should be excluded from CSRF protection
  private readonly EXCLUDED_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/health',
    '/api/webhooks', // Webhooks use different authentication
  ];

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for safe methods
    if (this.SAFE_METHODS.includes(req.method)) {
      return next();
    }

    // Skip CSRF for excluded paths
    if (this.isExcludedPath(req.path)) {
      return next();
    }

    // For POST/PUT/PATCH/DELETE, verify CSRF token
    const tokenFromHeader = req.headers['x-csrf-token'] as string;
    const tokenFromCookie = req.cookies?.['csrf-token'];

    // If no session yet (first request), generate token
    if (!tokenFromCookie) {
      this.generateToken(res);

      // For first request, if it's not authenticated, reject
      if (!req.headers.authorization) {
        this.logger.warn(
          `CSRF: Missing token for ${req.method} ${req.path} from ${req.ip}`,
        );
        throw new ForbiddenException(
          'CSRF token required. Please refresh and try again.',
        );
      }
    }

    // Validate token
    if (!tokenFromHeader || tokenFromHeader !== tokenFromCookie) {
      this.logger.warn(
        `CSRF: Invalid token for ${req.method} ${req.path} from ${req.ip}`,
        {
          headerToken: tokenFromHeader ? 'present' : 'missing',
          cookieToken: tokenFromCookie ? 'present' : 'missing',
          match: tokenFromHeader === tokenFromCookie,
        },
      );

      throw new ForbiddenException(
        'Invalid CSRF token. Please refresh and try again.',
      );
    }

    // Token is valid, proceed
    next();
  }

  /**
   * Generate new CSRF token
   */
  private _generateToken(res: Response): string {
    const token = randomBytes(32).toString('hex');

    // Set token in httpOnly cookie
    res.cookie('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Also expose token in response header for client to read
    res.setHeader('X-CSRF-Token', token);

    return token;
  }

  /**
   * Check if path is excluded from CSRF protection
   */
  private _isExcludedPath(path: string): boolean {
    return this.EXCLUDED_PATHS.some((excluded) =>
      path.startsWith(excluded),
    );
  }
}
