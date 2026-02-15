import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";

@Injectable()
export class ReferralExpiryCheckCron {
  private readonly logger = new Logger(ReferralExpiryCheckCron.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async run() {
    this.logger.log("Checking referral expirations...");
    try {
      const result = await this.prisma.referralCode.updateMany({
        where: { expiresAt: { lt: new Date() }, isActive: true },
        data: { isActive: false },
      });
      this.logger.log("Expired " + result.count + " referral codes");
    } catch (error: unknown) {
      this.logger.error(
        "Referral expiry check failed: " + (error as Error).message,
      );
    }
  }
}
