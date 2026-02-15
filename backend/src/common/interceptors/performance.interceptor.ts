import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';


import {

/**
 * Request/Response Interceptors (MEDIUM-016)
 */

  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

/**
 * Performance Interceptor
 * Logs request duration and detects slow requests
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly slowThreshold = 1000; // 1 second

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        if (duration > this.slowThreshold) {
          this.logger.warn(
            `Slow request: ${method} ${url} took ${duration}ms`,
          );
        } else {
          this.logger.log(`${method} ${url} completed in ${duration}ms`);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `Request failed: ${method} ${url} after ${duration}ms`,
          error.stack,
        );
        throw error;
      }),
    );
  }
}

/**
 * Transform Response Interceptor
 * Standardizes response format
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();

        // Add standard response wrapper
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}

/**
 * Cache Interceptor
 * Caches GET requests
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly ttl = 60000; // 1 minute

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = request.url;
    const cached = this.cache.get(cacheKey);

    // Return cached if valid
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return new Observable((observer) => {
        observer.next(cached.data);
        observer.complete();
      });
    }

    // Cache miss, fetch and store
    return next.handle().pipe(
      tap((data) => {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }),
    );
  }
}

/**
 * Usage in main.ts or module:
 *
 * app.useGlobalInterceptors(
 *   new PerformanceInterceptor(),
 *   new TransformResponseInterceptor(),
 *   new CacheInterceptor(),
 * );
 *
 * Or in controller:
 *
 * @UseInterceptors(PerformanceInterceptor)
 * @Controller('users')
 * export class UserController { ... }
 */
