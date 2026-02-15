import { Module, forwardRef } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { EscrowController } from "./escrow.controller";
import { EscrowService } from "./escrow.service";
import { LedgerModule } from "../ledger/ledger.module";
import { WalletModule } from "../wallet/wallet.module";

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => WalletModule),
    forwardRef(() => LedgerModule),
  ],
  providers: [EscrowService],
  controllers: [EscrowController],
  exports: [EscrowService],
})
export class EscrowModule {}
