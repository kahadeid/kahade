import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { PromoController } from "./promo.controller";
import { PromoRepository } from "./promo.repository";
import { PromoService } from "./promo.service";
import { VoucherRepository } from "./voucher.repository";

@Module({
  imports: [DatabaseModule],
  controllers: [PromoController],
  providers: [PromoService, PromoRepository, VoucherRepository],
  exports: [PromoService],
})
export class PromoModule {}
