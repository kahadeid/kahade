import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { MidtransWebhookController } from "./midtrans.webhook.controller";
import { XenditWebhookController } from "./xendit.webhook.controller";

/**
 * Webhook Module
 *
 * Handles incoming webhooks from payment providers:
 * - Midtrans: Payment notifications, recurring payments, payouts
 * - Xendit: Invoices, disbursements, virtual accounts, e-wallets
 *
 * Features:
 * - Signature verification (SHA512/HMAC)
 * - Idempotency handling
 * - Audit trail logging
 * - Automatic retry handling
 */
@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [MidtransWebhookController, XenditWebhookController],
  providers: [],
  exports: [],
})
export class WebhookModule {}
