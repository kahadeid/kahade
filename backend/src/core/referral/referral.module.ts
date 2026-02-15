import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { ReferralController } from "./referral.controller";
import { ReferralRepository } from "./referral.repository";

@Module({
  imports: [DatabaseModule],
  controllers: [ReferralController],
  providers: [ReferralRepository],
  exports: [ReferralRepository],
})
export class ReferralModule {}
