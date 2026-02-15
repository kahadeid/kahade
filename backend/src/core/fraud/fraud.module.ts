import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { FraudController } from "./fraud.controller";
import { FraudDetectionService } from "./fraud-detection.service";
import { RiskAssessmentService } from "./risk-assessment.service";

@Module({
  imports: [DatabaseModule],
  controllers: [FraudController],
  providers: [FraudDetectionService, RiskAssessmentService],
  exports: [FraudDetectionService, RiskAssessmentService],
})
export class FraudModule {}
