import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";

import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { WebhookValidatorService } from "@integrations/webhook/webhook-validator.service";

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService, WebhookValidatorService],
  exports: [PaymentService],
})
export class PaymentModule {}
