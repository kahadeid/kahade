import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { AutoReleaseEscrowCron } from "./auto-release-escrow.cron";
import { BackupSchedulerCron } from "./backup-scheduler.cron";
import { DatabaseModule } from "@infrastructure/database/database.module";
import { DisputeDeadlineCheckCron } from "./dispute-deadline-check.cron";
import { DisputeModule } from "@core/dispute/dispute.module";
import { EscrowModule } from "@core/escrow/escrow.module";
import { InviteExpiryCheckCron } from "./invite-expiry-check.cron";
import { KycExpiryCheckCron } from "./kyc-expiry-check.cron";
import { LedgerIntegrityCheckCron } from "./ledger-integrity-check.cron";
import { LedgerModule } from "@core/ledger/ledger.module";
import { MetricsAggregationCron } from "./metrics-aggregation.cron";
import { NotificationModule } from "@core/notification/notification.module";
import { PaymentReminderCron } from "./payment-reminder.cron";
import { ReferralExpiryCheckCron } from "./referral-expiry-check.cron";
import { SessionCleanupCron } from "./session-cleanup.cron";
import { VoucherExpiryCheckCron } from "./voucher-expiry-check.cron";
import { WalletModule } from "@core/wallet/wallet.module";
import { WalletReconciliationCron } from "./wallet-reconciliation.cron";

// Cron Jobs

/**
 * Cron Jobs Module
 *
 * Contains all scheduled tasks:
 * - Auto-release escrow (daily)
 * - Session cleanup (hourly)
 * - Wallet reconciliation (daily at 3 AM)
 * - Dispute deadline check (hourly)
 * - Payment reminders (daily)
 * - KYC expiry check (daily)
 * - Voucher expiry check (daily)
 * - Referral expiry check (daily)
 * - Ledger integrity check (daily)
 * - Metrics aggregation (hourly)
 * - Backup scheduler (daily)
 * - Invite expiry check (hourly)
 *
 * This module owns ScheduleModule.forRoot() – do not register it elsewhere.
 */
@Module({
  imports: [
    // ScheduleModule registered here (single point of registration)
    ScheduleModule.forRoot(),
    DatabaseModule,
    EscrowModule,
    WalletModule,
    DisputeModule,
    NotificationModule,
    LedgerModule,
  ],
  providers: [
    AutoReleaseEscrowCron,
    SessionCleanupCron,
    WalletReconciliationCron,
    DisputeDeadlineCheckCron,
    PaymentReminderCron,
    KycExpiryCheckCron,
    VoucherExpiryCheckCron,
    ReferralExpiryCheckCron,
    LedgerIntegrityCheckCron,
    MetricsAggregationCron,
    BackupSchedulerCron,
    InviteExpiryCheckCron,
  ],
  exports: [
    AutoReleaseEscrowCron,
    SessionCleanupCron,
    WalletReconciliationCron,
    DisputeDeadlineCheckCron,
  ],
})
export class CronJobsModule {}
