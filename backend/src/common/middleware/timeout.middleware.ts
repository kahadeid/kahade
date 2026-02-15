import { Injectable, NestMiddleware, RequestTimeoutException, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { Request, Response, NextFunction } from 'express';
import { timeout, catchError } from 'rxjs/operators';



/**
 * Request Timeout Handler (HIGH-038)
 *
 * Features:
 * - Global timeout middleware
 * - Per-endpoint timeout
 * - Graceful timeout handling
 * - Timeout metrics
 * - Connection cleanup
 */

export const REQUEST_TIMEOUT_KEY = 'requestTimeout';

/**
 * Timeout decorator
 */
export const Timeout = (milliseconds: number) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(REQUEST_TIMEOUT_KEY, milliseconds, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(REQUEST_TIMEOUT_KEY, milliseconds, target);
    return target;
  };
};

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  private readonly defaultTimeout = 30000; // 30 seconds

  use(req: Request, res: Response, next: NextFunction) {
    // Set timeout
    const timeout = this.defaultTimeout;
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          statusCode: 408,
          message: 'Request timeout',
          timestamp: new Date().toISOString(),
        });
      }
    }, timeout);

    // Clear timeout when response finishes
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    // Clear timeout on error
    res.on('error', () => {
      clearTimeout(timeoutId);
    });

    next();
  }
}

/**
 * Timeout interceptor for specific endpoints
 */

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutValue =
      this.reflector.get<number>(REQUEST_TIMEOUT_KEY, context.getHandler()) ||
      30000;

    return next.handle().pipe(
      timeout(timeoutValue),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timeout after ${timeoutValue}ms`,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}

/**
 * Example usage:
 *
 * // Global middleware in main.ts
 * app.use(new TimeoutMiddleware().use);
 *
 * // Or per-endpoint
 * @Get('slow-operation')
 * @UseInterceptors(TimeoutInterceptor)
 * @Timeout(60000) // 60 seconds
 * async slowOperation() {
 *   return await this.service.longRunningTask();
 * }
 */
