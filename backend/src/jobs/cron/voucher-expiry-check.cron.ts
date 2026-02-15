import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";
import { VoucherStatus } from "@prisma/client";

/**
 * Voucher Expiry Check Cron Job
 * Expires old vouchers. Runs daily.
 */
@Injectable()
export class VoucherExpiryCheckCron {
  private readonly logger = new Logger(VoucherExpiryCheckCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async run() {
    this.logger.log("Checking voucher expirations...");
    try {
      // Use validUntil instead of expiresAt, and status instead of isActive
      const result = await this.prisma.voucher.updateMany({
        where: {
          validUntil: { lt: new Date() },
          status: VoucherStatus.ACTIVE,
        },
        data: { status: VoucherStatus.EXPIRED },
      });
      this.logger.log(`Expired ${result.count} vouchers`);
    } catch (error: unknown) {
      this.logger.error(
        `Voucher expiry check failed: ${(error as Error).message}`,
      );
    }
  }
}
