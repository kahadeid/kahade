import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { LedgerLockService } from "./ledger-lock.service";
import { LedgerRepository } from "./ledger.repository";
import { LedgerService } from "./ledger.service";

// Eslint-disable-next-line @typescript-eslint/no-unused-vars
// Eslint-disable-next-line @typescript-eslint/no-unused-vars

@Module({
  imports: [DatabaseModule],
  providers: [LedgerService, LedgerLockService, LedgerRepository],
  controllers: [],
  exports: [LedgerService, LedgerLockService, LedgerRepository],
})
export class LedgerModule {}
