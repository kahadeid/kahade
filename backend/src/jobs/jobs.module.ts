import { BullModule } from "@nestjs/bull";
import { Module, Logger } from "@nestjs/common";

import { EmailModule } from "@integrations/email/email.module";
import { EmailProcessor } from "./email.processor";
import { EscrowModule } from "@core/escrow/escrow.module";
import { NotificationModule } from "@core/notification/notification.module";
import { NotificationProcessor } from "./notification.processor";
import { QUEUE_NAMES } from "@common/constants";

const useRedis = process.env.REDIS_ENABLED === "true";

/**
 * Jobs Module
 *
 * Handles background job processing:
 * - Email queue processing
 * - Notification queue processing
 *
 * Note: ScheduleModule.forRoot() is registered in CronJobsModule.
 * AutoReleaseEscrowCron is registered in CronJobsModule.
 * Queue processors require Redis to be enabled (REDIS_ENABLED=true).
 */
@Module({
  imports: [
    // Bull queues (only if Redis is enabled)
    ...(useRedis
      ? [
          BullModule.registerQueue(
            { name: QUEUE_NAMES.EMAIL },
            { name: QUEUE_NAMES.NOTIFICATION },
          ),
        ]
      : []),
    EmailModule,
    NotificationModule,
    EscrowModule,
  ],
  providers: [
    // Queue processors (only if Redis is enabled)
    ...(useRedis ? [EmailProcessor, NotificationProcessor] : []),
  ],
  exports: [...(useRedis ? [BullModule] : [])],
})
export class JobsModule {
  constructor() {
    Logger.log("Jobs module initialized", "JobsModule");
    if (!useRedis) {
      Logger.warn(
        "Queue processors disabled (REDIS_ENABLED != true)",
        "JobsModule",
      );
    }
  }
}
