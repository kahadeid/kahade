import { Observable } from 'rxjs';
import { Response } from 'express';
import { tap } from 'rxjs/operators';


import * as crypto from 'crypto';

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

/**
 * HTTP Response Caching Interceptor
 * Adds ETag and Cache-Control headers for client-side caching
 *
 * Benefits:
 * - Reduced bandwidth
 * - Faster responses
 * - Lower server load
 * - Standard HTTP caching
 *
 * @see Issue #72 H-015: Missing API Response Caching
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap((data) => {
        // Only cache GET requests
        if (request.method !== 'GET') {
          return;
        }

        // Generate ETag from response data
        const etag = this.generateETag(data);

        // Check if client has cached version
        const clientEtag = request.headers['if-none-match'];
        if (clientEtag === etag) {
          // Return 304 Not Modified
          response.status(304);
          return;
        }

        // Set caching headers
        response.setHeader('ETag', etag);
        response.setHeader('Cache-Control', this.getCacheControl(request.url));
      }),
    );
  }

  private generateETag(data: unknown): string {
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(data));
    return `"${hash.digest('hex')}"`;
  }

  private getCacheControl(url: string): string {
    // Public data - cache for 5 minutes
    if (url.includes('/public')) {
      return 'public, max-age=300';
    }

    // Static content - cache for 1 hour
    if (url.includes('/static') || url.includes('/assets')) {
      return 'public, max-age=3600';
    }

    // User-specific data - private cache for 1 minute
    if (url.includes('/users/me') || url.includes('/profile')) {
      return 'private, max-age=60';
    }

    // Default - no cache for sensitive data
    return 'no-store, must-revalidate';
  }
}
