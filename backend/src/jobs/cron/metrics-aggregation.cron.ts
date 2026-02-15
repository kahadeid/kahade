import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";

@Injectable()
export class MetricsAggregationCron {
  private readonly logger = new Logger(MetricsAggregationCron.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async run() {
    this.logger.log("Aggregating metrics...");
    try {
      const [users, orders] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.order.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
      ]);
      this.logger.log(
        "Metrics: " + users + " users, " + orders + " orders (24h)",
      );
    } catch (error: unknown) {
      this.logger.error(
        "Metrics aggregation failed: " + (error as Error).message,
      );
    }
  }
}
