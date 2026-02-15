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
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    return next.handle().pipe(
      tap(async () => {
        if (user) {
          await this.auditService.log({
            action: `${method} ${url}`,
            userId: user.id,
            entityType: 'HTTP_REQUEST',
            entityId: user.id,
            details: {
              method,
              url,
              statusCode: 200,
            },
            ipAddress: ip,
            userAgent: headers['user-agent'],
          });
        }
      }),
    );
  }
}
