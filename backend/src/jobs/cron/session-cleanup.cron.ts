import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";

/**
 * Session Cleanup Cron Job
 * Cleans up expired sessions. Runs every hour.
 */
@Injectable()
export class SessionCleanupCron {
  private readonly logger = new Logger(SessionCleanupCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async run() {
    this.logger.log("Starting session cleanup...");

    try {
      const now = new Date();

      // Clean up expired sessions
      const expiredSessions = await this.prisma.session.deleteMany({
        where: {
          expiresAt: { lt: now },
        },
      });

      // Clean up revoked sessions older than 7 days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const revokedSessions = await this.prisma.session.deleteMany({
        where: {
          revokedAt: { not: null, lt: sevenDaysAgo },
        },
      });

      this.logger.log(
        `Session cleanup completed: ${expiredSessions.count} expired, ${revokedSessions.count} revoked sessions removed`,
      );
    } catch (error: unknown) {
      this.logger.error(`Session cleanup failed: ${(error as Error).message}`);
    }
  }
}
