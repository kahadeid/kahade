import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';



/**
 * Security Monitoring Service (HIGH-013)
 *
 * Monitors security events and provides alerting hooks.
 * Can be integrated with external monitoring systems like:
 * - Sentry
 * - DataDog
 * - New Relic
 * - Custom alerting systems
 */

export enum SecurityEventType {
  // Authentication
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',

  // Authorization
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // Data access
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
  BULK_DATA_EXPORT = 'BULK_DATA_EXPORT',

  // Financial
  LARGE_TRANSACTION = 'LARGE_TRANSACTION',
  SUSPICIOUS_TRANSACTION = 'SUSPICIOUS_TRANSACTION',
  WITHDRAWAL_LIMIT_EXCEEDED = 'WITHDRAWAL_LIMIT_EXCEEDED',

  // Security
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',

  // System
  ABNORMAL_ERROR_RATE = 'ABNORMAL_ERROR_RATE',
  SERVICE_DEGRADATION = 'SERVICE_DEGRADATION',
}

export enum SecurityEventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface SecurityEvent {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class SecurityMonitorService {
  private readonly logger = new Logger(SecurityMonitorService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log security event
   */
  async logEvent(event: SecurityEvent): Promise<void> {
    this.logger.warn(
      `[SECURITY] ${event.severity} - ${event.type}`,
      {
        ...event,
        userId: event.userId || 'anonymous',
      },
    );

    // Store in database
    await this.prisma.securityEvent.create({
      data: {
        type: event.type,
        severity: event.severity,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: event.details,
        timestamp: event.timestamp,
      },
    }).catch(err => {
      // Don't fail on logging errors
      this.logger.error('Failed to store security event:', err);
    });

    // Alert if critical
    if (event.severity === SecurityEventSeverity.CRITICAL) {
      await this.sendAlert(event);
    }
  }

  /**
   * Send alert for critical events
   * TODO: Integrate with alerting system (email, Slack, PagerDuty, etc.)
   */
  private async sendAlert(event: SecurityEvent): Promise<void> {
    this.logger.error(
      `[CRITICAL SECURITY ALERT] ${event.type}`,
      event.details,
    );

    // NOTE: Implement actual alerting - Tracked in backlog
    // Await this.slack.send(`🚨 Critical Security Alert: ${event.type}`);
    // Await this.email.sendSecurityAlert(event);
  }

  /**
   * Check for suspicious activity patterns
   */
  async checkSuspiciousActivity(userId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check failed login attempts
    const failedLogins = await this.prisma.securityEvent.count({
      where: {
        userId,
        type: SecurityEventType.LOGIN_FAILED,
        timestamp: { gte: oneHourAgo },
      },
    });

    if (failedLogins >= 5) {
      reasons.push('Multiple failed login attempts');
    }

    // Check rapid transactions
    const recentTransactions = await this.prisma.auditLog.count({
      where: {
        performedBy: userId,
        action: { contains: 'TRANSACTION' },
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentTransactions >= 20) {
      reasons.push('Unusually high transaction volume');
    }

    // Check access from multiple IPs
    const recentIPs = await this.prisma.securityEvent.groupBy({
      by: ['ipAddress'],
      where: {
        userId,
        timestamp: { gte: oneHourAgo },
      },
    });

    if (recentIPs.length >= 5) {
      reasons.push('Access from multiple IP addresses');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Get security metrics for dashboard
   */
  async getSecurityMetrics(hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [totalEvents, criticalEvents, eventsByType] = await Promise.all([
      this.prisma.securityEvent.count({
        where: { timestamp: { gte: since } },
      }),
      this.prisma.securityEvent.count({
        where: {
          timestamp: { gte: since },
          severity: SecurityEventSeverity.CRITICAL,
        },
      }),
      this.prisma.securityEvent.groupBy({
        by: ['type', 'severity'],
        where: { timestamp: { gte: since } },
        _count: true,
      }),
    ]);

    return {
      totalEvents,
      criticalEvents,
      eventsByType,
      period: `Last ${hours} hours`,
    };
  }
}
