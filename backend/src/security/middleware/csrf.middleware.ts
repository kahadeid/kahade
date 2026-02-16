import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';


import * as crypto from 'crypto';


@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CsrfMiddleware.name);
  private readonly CSRF_COOKIE_NAME = 'XSRF-TOKEN';
  private readonly CSRF_HEADER_NAME = 'x-csrf-token';
  private readonly PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

  /**
   * Paths excluded from CSRF protection.
   * Covers both un-versioned and versioned API paths:
   * - Webhooks are external callbacks (payment gateways) — no cookie/header available
   * - Health & metrics are internal monitoring — no browser session
   *
   * Uses prefix matching, so /api/v1/webhooks is covered by '/api/v1/webhooks'
   * and '/api/webhooks' (AppController unversioned route).
   */
  private readonly EXCLUDED_PATHS = [
    // Webhooks (both versioned and unversioned)
    '/api/v1/webhooks',
    '/api/webhooks',
    // Health endpoints
    '/api/v1/health',
    '/api/health',
    // Metrics (internal only, already IP-restricted at nginx)
    '/api/v1/metrics',
    '/api/metrics',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for excluded paths
    if (this.isExcludedPath(req.path, req.originalUrl)) {
      return next();
    }

    // Skip CSRF for non-protected methods
    if (!this.PROTECTED_METHODS.includes(req.method)) {
      // Ensure token exists for GET requests
      this.ensureCsrfToken(req, res);
      return next();
    }

    // Validate CSRF token
    const cookieToken = req.cookies?.[this.CSRF_COOKIE_NAME];
    const headerToken = req.headers[this.CSRF_HEADER_NAME] as string;

    if (!cookieToken || !headerToken) {
      this.logger.warn(`CSRF token missing for ${req.method} ${req.path}`);
      throw new ForbiddenException('CSRF token missing');
    }

    if (!this.validateToken(cookieToken, headerToken)) {
      this.logger.warn(`CSRF token mismatch for ${req.method} ${req.path}`);
      throw new ForbiddenException('CSRF token invalid');
    }

    // Rotate token on successful validation
    this.rotateToken(req, res, cookieToken);

    return next();
  }

  private isExcludedPath(path: string, originalUrl: string): boolean {
    return this.EXCLUDED_PATHS.some(
      excluded => path.startsWith(excluded) || originalUrl.startsWith(excluded)
    );
  }

  private ensureCsrfToken(req: Request, res: Response): void {
    if (!req.cookies?.[this.CSRF_COOKIE_NAME]) {
      const token = this.generateToken();
      res.cookie(this.CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Must be readable by JS for header injection
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private validateToken(cookieToken: string, headerToken: string): boolean {
    try {
      // Constant-time comparison to prevent timing attacks
      const cookieBuf = Buffer.from(cookieToken);
      const headerBuf = Buffer.from(headerToken);

      if (cookieBuf.length !== headerBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(cookieBuf, headerBuf);
    } catch {
      return false;
    }
  }

  private rotateToken(req: Request, res: Response, _oldToken: string): void {
    // Rotate CSRF token after each successful mutating request
    const newToken = this.generateToken();
    res.cookie(this.CSRF_COOKIE_NAME, newToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    // Store rotated token in request for potential use by subsequent middleware
    (req as Request & { newCsrfToken?: string }).newCsrfToken = newToken;
  }
}
