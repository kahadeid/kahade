import { Module } from "@nestjs/common";

import { BadgeController } from "./badge.controller";
import { BadgeService } from "./badge.service";
import { DatabaseModule } from "@infrastructure/database/database.module";
import { ReputationService } from "./reputation.service";

@Module({
  imports: [DatabaseModule],
  controllers: [BadgeController],
  providers: [BadgeService, ReputationService],
  exports: [BadgeService, ReputationService],
})
export class BadgeModule {}
