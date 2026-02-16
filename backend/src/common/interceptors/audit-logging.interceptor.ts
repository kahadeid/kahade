import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

interface RequestContext {
  method: string;
  url: string;
  user?: any;
  ip: string;
}

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    const requestContext: RequestContext = {
      method: request.method,
      url: request.url,
      user: (request as any).user,
      ip: request.ip || 'unknown',
    };

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logAuditEntry(requestContext, true, duration, undefined, response);
      }),
      catchError((error: Error) => {
        const duration = Date.now() - startTime;
        this.logAuditEntry(requestContext, false, duration, error, response);
        return throwError(() => error);
      }),
    );
  }

  private logAuditEntry(
    context: RequestContext,
    success: boolean,
    duration: number,
    error: Error | undefined,
    response: Response,
  ): void {
    const { method, url, user, ip } = context;
    const statusCode = response.statusCode;

    const logData = {
      timestamp: new Date().toISOString(),
      method,
      url,
      statusCode,
      success,
      duration,
      userId: user?.id,
      ip,
      error: error?.message,
    };

    if (success) {
      this.logger.log(`${method} ${url} - ${statusCode} - ${duration}ms`);
    } else {
      this.logger.error(`${method} ${url} - ${statusCode} - ${duration}ms - ${error?.message}`);
    }

    this.logger.debug(JSON.stringify(logData));
  }
}
