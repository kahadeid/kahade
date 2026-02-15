import { AuditService } from '@common/services/audit.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


import {

  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    return next.handle().pipe(
      tap(async () => {
        await this.auditService.log({
          action: `${method} ${url}`,
          userId: user?.id,
          entityType: 'SECURITY_EVENT',
          details: {
            method,
            url,
          },
        });
      }),
    );
  }
}
