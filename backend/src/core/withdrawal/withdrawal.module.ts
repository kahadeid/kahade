import { Module, forwardRef } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { LedgerModule } from "../ledger/ledger.module";
import { WalletModule } from "../wallet/wallet.module";
import { WithdrawalController } from "./withdrawal.controller";
import { WithdrawalGuardService } from "./withdrawal-guard.service";
import { WithdrawalRepository } from "./withdrawal.repository";
import { WithdrawalService } from "./withdrawal.service";

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => WalletModule),
    forwardRef(() => LedgerModule),
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService, WithdrawalGuardService, WithdrawalRepository],
  exports: [WithdrawalService, WithdrawalGuardService],
})
export class WithdrawalModule {}
