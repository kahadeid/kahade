import { Observable } from 'rxjs';
import { Request } from 'express';
import { tap } from 'rxjs/operators';


import {

  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

/**
 * Request Logging Interceptor
 *
 * Logs all incoming requests and their response times.
 * Helps with monitoring and debugging.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.headers['user-agent'] || '';
    const user = (request as any).user;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const logMessage = `${method} ${url} ${responseTime}ms - IP: ${ip} - User: ${user?.id || 'anonymous'}`;

          if (responseTime > 1000) {
            this.logger.warn(`SLOW REQUEST: ${logMessage}`);
          } else {
            this.logger.log(logMessage);
          }
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} ${responseTime}ms - IP: ${ip} - User: ${user?.id || 'anonymous'} - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
