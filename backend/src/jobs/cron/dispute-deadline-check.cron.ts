import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { DisputeStatus } from "@prisma/client";
import { PrismaService } from "@infrastructure/database/prisma.service";

/**
 * Dispute Deadline Check Cron Job
 * Monitors dispute deadlines and escalates overdue disputes.
 * Runs every hour.
 */
@Injectable()
export class DisputeDeadlineCheckCron {
  private readonly logger = new Logger(DisputeDeadlineCheckCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async run() {
    this.logger.log("Checking dispute deadlines...");

    try {
      const now = new Date();

      const overdueDisputes = await this.prisma.dispute.findMany({
        where: {
          status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] },
          responseDeadline: { lt: now },
        },
      });

      for (const dispute of overdueDisputes) {
        await this.prisma.dispute.update({
          where: { id: dispute.id },
          data: {
            status: DisputeStatus.ESCALATED,
            escalatedAt: now,
            // Note: escalationReason field doesn't exist in schema
            // Use adminNotes instead
            adminNotes: dispute.adminNotes
              ? `${dispute.adminNotes}\nAuto-escalated: Response deadline exceeded`
              : "Auto-escalated: Response deadline exceeded",
          },
        });
      }

      this.logger.log(
        `Dispute deadline check: ${overdueDisputes.length} escalated`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Dispute deadline check failed: ${(error as Error).message}`,
      );
    }
  }
}
