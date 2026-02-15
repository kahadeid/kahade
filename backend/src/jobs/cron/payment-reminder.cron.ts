import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";

@Injectable()
export class PaymentReminderCron {
  private readonly logger = new Logger(PaymentReminderCron.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async run() {
    this.logger.log("Sending payment reminders...");
    try {
      const pendingPayments = await this.prisma.payment.findMany({
        where: {
          status: "PENDING",
          createdAt: { lt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
        },
      });
      this.logger.log(
        "Found " + pendingPayments.length + " pending payments for reminder",
      );
    } catch (error: unknown) {
      this.logger.error("Payment reminder failed: " + (error as Error).message);
    }
  }
}
