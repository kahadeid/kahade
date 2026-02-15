import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { DeliveryController } from "./delivery.controller";
import { DeliveryRepository } from "./delivery.repository";

@Module({
  imports: [DatabaseModule],
  controllers: [DeliveryController],
  providers: [DeliveryRepository],
  exports: [DeliveryRepository],
})
export class DeliveryModule {}
