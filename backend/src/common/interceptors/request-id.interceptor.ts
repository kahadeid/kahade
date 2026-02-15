import { Observable } from 'rxjs';
import { nanoid } from 'nanoid';
import { tap } from 'rxjs/operators';


import {

  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

/**
 * Request ID Interceptor (HIGH-012)
 *
 * Adds unique request ID to:
 * - Response headers
 * - Request object (for logging)
 * - All logs related to this request
 *
 * Benefits:
 * - Trace requests across logs
 * - Debug production issues
 * - Performance monitoring
 * - User support (give user request ID to investigate)
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get or generate request ID
    const requestId =
      (request.headers['x-request-id'] as string) ||
      `req_${nanoid(12)}`;

    // Add to request for logging
    request.requestId = requestId;

    // Add to response headers
    response.setHeader('X-Request-ID', requestId);

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        response.setHeader('X-Response-Time', `${duration}ms`);

        // Log slow requests
        if (duration > 1000) {
          }
      }),
    );
  }
}
