import { Module, Global } from '@nestjs/common';
import { AuditLogRepository } from './audit-log.repository';
import { DatabaseModule } from '@infrastructure/database/database.module';



/**
 * Audit Module (Security)
 *
 * Provides audit logging capabilities for security monitoring.
 * Re-exports AuditLogRepository for use across the application.
 *
 * NOTE: The core AuditService (for admin audit actions) lives in
 *       core/audit/audit.module.ts. This module handles security
 *       audit log storage via AuditLogRepository.
 */
@Global()
@Module({
  imports: [DatabaseModule],
  providers: [AuditLogRepository],
  exports: [AuditLogRepository],
})
export class AuditModule {}
