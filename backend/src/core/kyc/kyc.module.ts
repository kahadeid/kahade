import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { KycController } from "./kyc.controller";
import { KycRepository } from "./kyc.repository";

@Module({
  imports: [DatabaseModule],
  controllers: [KycController],
  providers: [KycRepository],
  exports: [KycRepository],
})
export class KycModule {}
