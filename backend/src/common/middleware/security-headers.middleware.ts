import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';



/**
 * Comprehensive Security Headers Middleware (HIGH-015)
 *
 * Implements OWASP recommended security headers:
 * - X-Frame-Options (Clickjacking protection)
 * - X-Content-Type-Options (MIME sniffing prevention)
 * - X-XSS-Protection (XSS filter)
 * - Strict-Transport-Security (HSTS)
 * - Content-Security-Policy (CSP)
 * - Referrer-Policy
 * - Permissions-Policy
 * - X-DNS-Prefetch-Control
 *
 * References:
 * - https://owasp.org/www-project-secure-headers/
 * - https://securityheaders.com/
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Prevent clickjacking attacks
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter (legacy browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Force HTTPS (only in production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
    }

    // Content Security Policy (CSP)
    // Strict policy - adjust based on your needs
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // NOTE: Remove unsafe-* in production - Tracked in backlog
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.* wss://*", // Adjust for your API domains
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ];
    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

    // Referrer Policy
    // Don't leak referrer to other domains
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (formerly Feature-Policy)
    // Disable potentially dangerous features
    const permissionsDirectives = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()', // Re-enable if you use Web Payment API
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ];
    res.setHeader('Permissions-Policy', permissionsDirectives.join(', '));

    // Disable DNS prefetching
    res.setHeader('X-DNS-Prefetch-Control', 'off');

    // Remove server header (don't expose server info)
    res.removeHeader('X-Powered-By');

    // Custom security header for API versioning
    res.setHeader('X-API-Version', '1.0.0');

    // Rate limit headers (if available)
    if (req['rateLimit']) {
      const rateLimit = req['rateLimit'];
      res.setHeader('X-RateLimit-Limit', rateLimit.limit);
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
      res.setHeader('X-RateLimit-Reset', rateLimit.reset);
    }

    next();
  }
}

/**
 * Security Headers Configuration
 * Can be customized per environment
 */
export interface SecurityHeadersConfig {
  enableHSTS: boolean;
  hstsMaxAge: number;
  hstsIncludeSubDomains: boolean;
  hstsPreload: boolean;
  cspDirectives: Record<string, string[]>;
  frameOptions: 'DENY' | 'SAMEORIGIN';
  referrerPolicy:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
}

/**
 * Configurable Security Headers Middleware
 */
@Injectable()
export class ConfigurableSecurityHeadersMiddleware implements NestMiddleware {
  constructor(private config: SecurityHeadersConfig) {}

  use(req: Request, res: Response, next: NextFunction) {
    // X-Frame-Options
    res.setHeader('X-Frame-Options', this.config.frameOptions);

    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // HSTS
    if (this.config.enableHSTS) {
      const hstsValue = [
        `max-age=${this.config.hstsMaxAge}`,
        this.config.hstsIncludeSubDomains ? 'includeSubDomains' : '',
        this.config.hstsPreload ? 'preload' : '',
      ]
        .filter(Boolean)
        .join('; ');
      res.setHeader('Strict-Transport-Security', hstsValue);
    }

    // CSP
    if (this.config.cspDirectives) {
      const csp = Object.entries(this.config.cspDirectives)
        .map(([directive, values]) => `${directive} ${values.join(' ')}`)
        .join('; ');
      res.setHeader('Content-Security-Policy', csp);
    }

    // Referrer-Policy
    res.setHeader('Referrer-Policy', this.config.referrerPolicy);

    next();
  }
}
