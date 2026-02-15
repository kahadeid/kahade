import { Module, forwardRef } from "@nestjs/common";

import { CacheModule } from "@infrastructure/cache/cache.module";
import { DatabaseModule } from "@infrastructure/database/database.module";
import { PaymentController } from "./payment.controller";
import { PaymentModule as PaymentIntegrationModule } from "@integrations/payment/payment.module";
import { PaymentRepository } from "./payment.repository";

@Module({
  imports: [
    DatabaseModule,
    CacheModule,  // ✅ ADDED - Required for CacheService DI
    forwardRef(() => PaymentIntegrationModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentRepository],
  exports: [PaymentRepository],
})
export class CorePaymentModule {}
