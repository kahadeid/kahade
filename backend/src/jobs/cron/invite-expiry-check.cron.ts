import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";

/**
 * Invite Expiry Check Cron Job
 * Expires old pending referral codes. Runs daily.
 */
@Injectable()
export class InviteExpiryCheckCron {
  private readonly logger = new Logger(InviteExpiryCheckCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async run() {
    this.logger.log("Checking invite expirations...");
    try {
      // Use referralCode instead of referralInvite
      const result = await this.prisma.referralCode.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          isActive: true,
        },
        data: { isActive: false },
      });
      this.logger.log(`Expired ${result.count} referral codes`);
    } catch (error: unknown) {
      this.logger.error(
        `Invite expiry check failed: ${(error as Error).message}`,
      );
    }
  }
}
