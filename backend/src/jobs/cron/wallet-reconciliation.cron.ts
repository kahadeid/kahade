import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";

/**
 * Wallet Reconciliation Cron Job
 * Verifies wallet balances match ledger totals. Runs daily at 3 AM.
 */
@Injectable()
export class WalletReconciliationCron {
  private readonly logger = new Logger(WalletReconciliationCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async run() {
    this.logger.log("Starting wallet reconciliation...");

    try {
      const wallets = await this.prisma.wallet.findMany({
        select: { id: true, userId: true, balanceMinor: true },
      });

      let discrepancies = 0;

      for (const wallet of wallets) {
        // Get ledger entries with account info for this wallet
        const entries = await this.prisma.ledgerEntry.findMany({
          where: {
            account: { walletId: wallet.id },
          },
          include: {
            account: { select: { type: true } },
          },
        });

        // Calculate total from ledger entries
        // Assets increase with positive amounts, Liabilities/Equity decrease
        let totalBalance = BigInt(0);
        for (const entry of entries) {
          // For wallet accounts (ASSET type), positive = increase balance
          if (entry.account.type === "ASSET") {
            totalBalance += entry.amountMinor;
          } else {
            totalBalance -= entry.amountMinor;
          }
        }

        const storedBalance = wallet.balanceMinor;

        if (totalBalance !== storedBalance) {
          discrepancies++;
          this.logger.error(
            `Balance discrepancy for wallet ${wallet.id}: stored=${storedBalance}, ledger=${totalBalance}`,
          );
        }
      }

      this.logger.log(
        `Wallet reconciliation completed: ${wallets.length} wallets, ${discrepancies} discrepancies`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Wallet reconciliation failed: ${(error as Error).message}`,
      );
    }
  }
}
