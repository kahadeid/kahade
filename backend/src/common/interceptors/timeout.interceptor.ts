import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';


import {

  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';

/**
 * Timeout Interceptor (MED-007)
 *
 * Prevents requests from hanging indefinitely.
 * Default timeout: 30 seconds
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestTimeout = request.headers['x-request-timeout'];

    const timeoutValue = requestTimeout
      ? parseInt(requestTimeout, 10)
      : this.DEFAULT_TIMEOUT;

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
