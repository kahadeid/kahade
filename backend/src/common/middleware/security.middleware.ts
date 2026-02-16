import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';


import DOMPurify from 'isomorphic-dompurify';


@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize input
    if (req.body) {
      this.sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      this.sanitizeObject(req.query);
    }

    // Add security headers
    this.addSecurityHeaders(res);

    // Detect suspicious patterns
    this.detectSuspiciousPatterns(req);

    next();
  }

  private sanitizeObject(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = DOMPurify.sanitize(obj[key], { ALLOWED_TAGS: [] });
      } else if (typeof obj[key] === 'object') {
        this.sanitizeObject(obj[key]);
      }
    }
  }

  private addSecurityHeaders(res: Response): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }

  private detectSuspiciousPatterns(req: Request): void {
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
    ];

    const checkString = JSON.stringify(req.body) + JSON.stringify(req.query);

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(checkString)) {
        break;
      }
    }
  }
}
