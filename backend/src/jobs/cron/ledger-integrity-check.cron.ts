import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";

/**
 * Ledger Integrity Check Cron Job
 * Verifies double-entry ledger integrity. Runs daily at 2 AM.
 */
@Injectable()
export class LedgerIntegrityCheckCron {
  private readonly logger = new Logger(LedgerIntegrityCheckCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async run() {
    this.logger.log("Checking ledger integrity...");
    try {
      // Use ledgerJournal instead of journalEntry
      const journals = await this.prisma.ledgerJournal.findMany({
        include: { entries: true },
      });

      let errors = 0;
      for (const journal of journals) {
        const totalDebit = journal.entries
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((e: any) => e.side === "DEBIT")
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          .reduce((sum: number, e: any) => sum + Number(e.amountMinor), 0);
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalCredit = journal.entries
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((e: any) => e.side === "CREDIT")
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          .reduce((sum: number, e: any) => sum + Number(e.amountMinor), 0);
        if (Math.abs(totalDebit - totalCredit) > 0) errors++;
      }

      this.logger.log(
        `Ledger check: ${journals.length} journals, ${errors} errors`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Ledger integrity check failed: ${(error as Error).message}`,
      );
    }
  }
}
