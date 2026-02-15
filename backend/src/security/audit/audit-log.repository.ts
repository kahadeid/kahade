import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";

export interface AuditLogEntry {
  action: string;
  performedBy?: string | null;
  entityType: string;
  entityId?: string | null;
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
}

/**
 * Audit Log Repository
 *
 * Stores audit logs for compliance and security monitoring.
 * Supports querying by user, action, time range, etc.
 */
@Injectable()
export class AuditLogRepository {
  private readonly logger = new Logger(AuditLogRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new audit log entry
   */
  async create(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: entry.action,
          performedBy: entry.performedBy,
          entityType: entry.entityType,
          entityId: entry.entityId,
          details: entry.details || {},
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          correlationId: entry.correlationId,
        },
      });
    } catch (error: unknown) {
      // Don't throw - audit logging should not break the application
      this.logger.error(
        `Failed to create audit log: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find audit logs by user
   */
  async findByUser(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ) {
    const { page = 1, limit = 50, startDate, endDate } = options;
    const skip = (page - 1) * limit;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { performedBy: userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      // OPTIMIZATION: Consider adding select to limit fields
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: logs, total, page, limit };
  }

  /**
   * Find audit logs by action
   */
  async findByAction(
    action: string,
    options: {
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ) {
    const { page = 1, limit = 50, startDate, endDate } = options;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skip = (page - 1) * limit;

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { action: { contains: action } };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      // OPTIMIZATION: Consider adding select to limit fields
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: logs, total, page, limit };
  }

  /**
   * Find audit logs by entity
   */
  async findByEntity(
    entityType: string,
    entityId?: string,
    options: {
      page?: number;
      limit?: number;
    } = {},
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { entityType };
    if (entityId) where.entityId = entityId;

    const [logs, total] = await Promise.all([
      // OPTIMIZATION: Consider adding select to limit fields
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: logs, total, page, limit };
  }

  /**
   * Get audit statistics
   */
  async getStatistics(startDate: Date, endDate: Date) {
    const [totalLogs, uniqueUsers, topActions] = await Promise.all([
      this.prisma.auditLog.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.auditLog.groupBy({
        by: ["performedBy"],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          performedBy: { not: null },
        },
      }),
      this.prisma.auditLog.groupBy({
        by: ["action"],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { action: true },
        orderBy: { _count: { action: "desc" } },
        take: 10,
      }),
    ]);
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any

    return {
      totalLogs,
      uniqueUsers: uniqueUsers.length,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      topActions: topActions.map((a: any) => ({
        action: a.action,
        count: a._count.action,
      })),
    };
  }

  /**
   * Clean up old audit logs (for data retention)
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    this.logger.log(
      `Cleaned up ${result.count} audit logs older than ${retentionDays} days`,
    );
    return result.count;
  }
}
