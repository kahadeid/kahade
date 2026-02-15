import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { DisputeController } from "./dispute.controller";
import { DisputeRepository } from "./dispute.repository";
import { DisputeService } from "./dispute.service";
import { TransactionModule } from "../transaction/transaction.module";

@Module({
  imports: [DatabaseModule, TransactionModule],
  controllers: [DisputeController],
  providers: [DisputeService, DisputeRepository],
  exports: [DisputeService],
})
export class DisputeModule {}
