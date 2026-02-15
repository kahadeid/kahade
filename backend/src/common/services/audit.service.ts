import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository, AuditLogEntry } from '@security/audit/audit-log.repository';



/**
 * Common Audit Service
 *
 * Proxy service used by interceptors to log audit events.
 * Delegates to AuditLogRepository for actual storage.
 *
 * This service is injectable in interceptors that don't have
 * access to the core AuditService.
 */

export interface AuditLogParams {
  action: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  /**
   * Log an audit event
   */
  async log(params: AuditLogParams): Promise<void> {
    try {
      const entry: AuditLogEntry = {
        action: params.action,
        performedBy: params.userId ?? null,
        entityType: params.entityType ?? 'SYSTEM',
        entityId: params.entityId ?? null,
        details: params.details ?? {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        correlationId: params.correlationId,
      };

      await this.auditLogRepository.create(entry);
    } catch (error) {
      // Audit logging should never break the main flow
      this.logger.error('Failed to create audit log entry', error);
    }
  }
}
