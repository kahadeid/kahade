import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { PushNotificationController } from "./push-notification.controller";
import { PushNotificationService } from "./push-notification.service";

@Module({
  imports: [DatabaseModule],
  controllers: [PushNotificationController],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
