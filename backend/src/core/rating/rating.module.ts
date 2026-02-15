import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { RatingController } from "./rating.controller";
import { RatingRepository } from "./rating.repository";

@Module({
  imports: [DatabaseModule],
  controllers: [RatingController],
  providers: [RatingRepository],
  exports: [RatingRepository],
})
export class RatingModule {}
