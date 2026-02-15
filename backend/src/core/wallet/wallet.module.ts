import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { PaymentModule } from "@integrations/payment/payment.module";
import { WalletController } from "./wallet.controller";
import { WalletDepositService } from "./wallet.deposit.service";
import { WalletService } from "./wallet.service";
import { WalletWithdrawalService } from "./wallet.withdrawal.service";

@Module({
  imports: [DatabaseModule, PaymentModule],
  controllers: [WalletController],
  providers: [WalletService, WalletDepositService, WalletWithdrawalService],
  exports: [WalletService, WalletDepositService, WalletWithdrawalService],
})
export class WalletModule {}
