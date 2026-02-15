import { Module, forwardRef } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { EscrowModule } from "../escrow/escrow.module";
import { NotificationModule } from "../notification/notification.module";
import { OrderController } from "./order.controller";
import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";
import { WalletModule } from "../wallet/wallet.module";

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => EscrowModule),
    forwardRef(() => WalletModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}
