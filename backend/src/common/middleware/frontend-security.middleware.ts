import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';


import * as xss from 'xss';


/**
 * Frontend Security Hardening (HIGH-046)
 *
 * Security headers for frontend protection:
 * - CSP (Content Security Policy)
 * - XSS Protection
 * - CSRF Protection
 * - Secure Cookies
 * - Content-Type Validation
 */

@Injectable()
export class FrontendSecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.kahade.id wss://api.kahade.id",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    );

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (formerly Feature Policy)
    res.setHeader(
      'Permissions-Policy',
      [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=(self)',
      ].join(', '),
    );

    // HSTS (Strict-Transport-Security)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
    }

    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');

    next();
  }
}

/**
 * CSRF Protection Middleware
 */
@Injectable()
export class CsrfProtectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for API endpoints (use Bearer token instead)
    if (req.path.startsWith('/api/')) {
      return next();
    }

    // For form submissions, verify CSRF token
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const csrfToken = req.headers['x-csrf-token'] as string;
      const cookieToken = req.cookies?.['csrf-token'];

      if (!csrfToken || csrfToken !== cookieToken) {
        return res.status(403).json({
          statusCode: 403,
          message: 'Invalid CSRF token',
        });
      }
    }

    next();
  }
}

/**
 * Secure Cookie Configuration
 */
export const secureCookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
  domain: process.env.COOKIE_DOMAIN || undefined,
};

/**
 * Content-Type Validation Middleware
 */
@Injectable()
export class ContentTypeValidationMiddleware implements NestMiddleware {
  private allowedContentTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    // Only check for requests with body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];

      if (!contentType) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Content-Type header is required',
        });
      }

      // Check if content type is allowed
      const isAllowed = this.allowedContentTypes.some((allowed) =>
        contentType.includes(allowed),
      );

      if (!isAllowed) {
        return res.status(415).json({
          statusCode: 415,
          message: `Unsupported Content-Type: ${contentType}`,
        });
      }
    }

    next();
  }
}

/**
 * XSS Sanitization Middleware
 */

@Injectable()
export class XssSanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitize(req.body);
    }

    if (req.query) {
      req.query = this.sanitize(req.query);
    }

    if (req.params) {
      req.params = this.sanitize(req.params);
    }

    next();
  }

  private _sanitize(obj: any): any {
    if (typeof obj === 'string') {
      return xss(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const key in obj) {
        sanitized[key] = this.sanitize(obj[key]);
      }
      return sanitized;
    }

    return obj;
  }
}

/**
 * Usage in main.ts:
 *
 * import {
 *   FrontendSecurityMiddleware,
 *   CsrfProtectionMiddleware,
 *   ContentTypeValidationMiddleware,
 * } from './common/middleware/frontend-security.middleware';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *
 *   // Apply security middlewares
 *   app.use(new FrontendSecurityMiddleware().use);
 *   app.use(new ContentTypeValidationMiddleware().use);
 *
 *   // CSRF for non-API routes
 *   // app.use(new CsrfProtectionMiddleware().use);
 *
 *   await app.listen(3000);
 * }
 */
