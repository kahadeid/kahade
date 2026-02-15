import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';



/**
 * Security Event Logger (HIGH-007)
 *
 * Logs security-related events for monitoring and forensics:
 * - Failed login attempts
 * - Unauthorized access attempts
 * - Suspicious activities
 * - Account lockouts
 * - MFA events
 *
 * Events are stored in AuditLog table with specific action types
 */
@Injectable()
export class SecurityEventLogger {
  private readonly logger = new Logger(SecurityEventLogger.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log failed login attempt
   */
  async logFailedLogin(
    email: string,
    ipAddress: string,
    userAgent: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'FAILED_LOGIN',
          performedBy: null, // No user ID since login failed
          entityType: 'AUTH',
          entityId: null,
          details: {
            email,
            reason,
            timestamp: new Date().toISOString(),
          },
          ipAddress,
          userAgent,
        },
      });

      this.logger.warn(
        `Failed login attempt for ${email} from ${ipAddress}: ${reason}`,
      );
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * Log successful login
   */
  async logSuccessfulLogin(
    userId: string,
    email: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'SUCCESSFUL_LOGIN',
          performedBy: userId,
          entityType: 'AUTH',
          entityId: userId,
          details: {
            email,
            timestamp: new Date().toISOString(),
          },
          ipAddress,
          userAgent,
        },
      });

      this.logger.log(`Successful login for ${email} from ${ipAddress}`);
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * Log unauthorized access attempt
   */
  async logUnauthorizedAccess(
    userId: string | null,
    resource: string,
    action: string,
    ipAddress: string,
    userAgent: string,
    reason?: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'UNAUTHORIZED_ACCESS',
          performedBy: userId,
          entityType: 'SECURITY',
          entityId: null,
          details: {
            resource,
            attemptedAction: action,
            reason: reason || 'Insufficient permissions',
            timestamp: new Date().toISOString(),
          },
          ipAddress,
          userAgent,
        },
      });

      this.logger.error(
        `Unauthorized access attempt by user ${userId || 'anonymous'} to ${resource}:${action} from ${ipAddress}`,
      );
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * Log account lockout due to multiple failed attempts
   */
  async logAccountLockout(
    email: string,
    ipAddress: string,
    attemptCount: number,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'ACCOUNT_LOCKOUT',
          performedBy: null,
          entityType: 'SECURITY',
          entityId: null,
          details: {
            email,
            attemptCount,
            reason: 'Multiple failed login attempts',
            timestamp: new Date().toISOString(),
          },
          ipAddress,
          userAgent: null,
        },
      });

      this.logger.error(
        `Account lockout for ${email} after ${attemptCount} failed attempts from ${ipAddress}`,
      );
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    userId: string | null,
    activityType: string,
    details: Record<string, any>,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'SUSPICIOUS_ACTIVITY',
          performedBy: userId,
          entityType: 'SECURITY',
          entityId: null,
          details: {
            activityType,
            ...details,
            timestamp: new Date().toISOString(),
          },
          ipAddress,
          userAgent,
        },
      });

      this.logger.warn(
        `Suspicious activity detected: ${activityType} by user ${userId || 'anonymous'} from ${ipAddress}`,
      );
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * Log MFA enrollment
   */
  async logMfaEnrollment(
    userId: string,
    method: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'MFA_ENROLLED',
          performedBy: userId,
          entityType: 'SECURITY',
          entityId: userId,
          details: {
            method,
            timestamp: new Date().toISOString(),
          },
          ipAddress,
          userAgent,
        },
      });

      this.logger.log(`MFA enrolled for user ${userId} using ${method}`);
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * Log MFA verification attempt
   */
  async logMfaAttempt(
    userId: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: success ? 'MFA_SUCCESS' : 'MFA_FAILED',
          performedBy: userId,
          entityType: 'AUTH',
          entityId: userId,
          details: {
            success,
            timestamp: new Date().toISOString(),
          },
          ipAddress,
          userAgent,
        },
      });

      if (!success) {
        this.logger.warn(`Failed MFA attempt for user ${userId} from ${ipAddress}`);
      }
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * Log password change
   */
  async logPasswordChange(
    userId: string,
    changeType: 'user_initiated' | 'admin_reset' | 'forgot_password',
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'PASSWORD_CHANGED',
          performedBy: userId,
          entityType: 'SECURITY',
          entityId: userId,
          details: {
            changeType,
            timestamp: new Date().toISOString(),
          },
          ipAddress,
          userAgent,
        },
      });

      this.logger.log(`Password changed for user ${userId}: ${changeType}`);
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * Log permission elevation
   */
  async logPermissionElevation(
    userId: string,
    fromRole: string,
    toRole: string,
    performedBy: string,
    ipAddress: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'PERMISSION_ELEVATION',
          performedBy,
          entityType: 'SECURITY',
          entityId: userId,
          details: {
            fromRole,
            toRole,
            targetUserId: userId,
            timestamp: new Date().toISOString(),
          },
          ipAddress,
          userAgent: null,
        },
      });

      this.logger.warn(
        `Permission elevated for user ${userId}: ${fromRole} -> ${toRole} by ${performedBy}`,
      );
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }
}
