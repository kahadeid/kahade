import { Injectable, Logger, BadRequestException, NotFoundException } from "@nestjs/common";

import { Prisma } from "@prisma/client";
import { PrismaService } from "@infrastructure/database/prisma.service";
import { validate as isValidUUID } from 'uuid';

/**
 * Ledger Lock Service
 *
 * Implements pessimistic locking for concurrent ledger operations.
 * Prevents double-spending and ensures data consistency.
 */
@Injectable()
export class LedgerLockService {
  private readonly logger = new Logger(LedgerLockService.name);
  private readonly LOCK_TIMEOUT_MS = 5000; // 5 seconds

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate UUID format to prevent SQL injection
   */
  private validateUUID(id: string, fieldName: string = 'ID'): void {
    if (!isValidUUID(id)) {
      throw new BadRequestException(`Invalid ${fieldName} format`);
    }
  }

  /**
   * Execute ledger operation with wallet lock
   *
   * Acquires pessimistic lock on wallet row before performing operation.
   * Prevents concurrent modifications to the same wallet.
   */
  async withWalletLock<T>(
    walletId: string,
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    // Validate UUID before raw SQL query to prevent SQL injection
    this.validateUUID(walletId, 'Wallet ID');

    return await this.prisma.$transaction(
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (tx: any) => {
        const wallet = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM wallets
          WHERE id = ${walletId}::uuid
          FOR UPDATE
        `;

        if (!wallet || wallet.length === 0) {
          throw new NotFoundException(`Wallet ${walletId} not found`);
        }

        // Execute operation within locked context
        return await operation(tx);
      },
      {
        timeout: this.LOCK_TIMEOUT_MS,
      },
    );
  }

  /**
   * Execute ledger operation with multiple wallet locks
   *
   * Acquires locks in deterministic order (by wallet ID) to prevent deadlocks.
   */
  async withMultipleWalletLocks<T>(
    walletIds: string[],
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    // Validate all UUIDs before processing
    for (const walletId of walletIds) {
      this.validateUUID(walletId, 'Wallet ID');
    }

    // Sort wallet IDs to ensure consistent lock order (prevent deadlocks)
    const sortedWalletIds = [...walletIds].sort();

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await this.prisma.$transaction(
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (tx: any) => {
        // Acquire FOR UPDATE locks on all wallets with ::uuid type cast
        for (const walletId of sortedWalletIds) {
          // SECURITY: Ensure input is properly sanitized
          const wallet = await tx.$queryRaw<Array<{ id: string }>>`
            SELECT id FROM wallets
            WHERE id = ${walletId}::uuid
            FOR UPDATE
          `;

          if (!wallet || wallet.length === 0) {
            throw new NotFoundException(`Wallet ${walletId} not found`);
          }
        }

        // Execute operation within locked context
        return await operation(tx);
      },
      {
        timeout: this.LOCK_TIMEOUT_MS,
      },
    );
  }

  /**
   * Create double-entry ledger transaction with automatic validation
   */
  async createDoubleEntry(
    tx: Prisma.TransactionClient,
    journalData: {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: string;
      description: string;
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata?: any;
    },
    entries: Array<{
      walletId: string;
      type: "DEBIT" | "CREDIT";
      amountMinor: bigint;
      balanceAfterMinor: bigint;
    }>,
  ): Promise<string> {
    // Validate all wallet IDs
    for (const entry of entries) {
      this.validateUUID(entry.walletId, 'Wallet ID');
    }

    // Validate double-entry invariant: sum must be zero
    let sum = 0n;
    for (const entry of entries) {
      if (entry.type === "DEBIT") {
        sum += entry.amountMinor;
      } else {
        sum -= entry.amountMinor;
      }
    }

    if (sum !== 0n) {
      throw new Error(
        `Double-entry invariant violated: sum is ${sum}, expected 0`,
      );
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    }

    // Create journal
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const journal = await (tx as any).ledgerJournal.create({
      data: {
        type: journalData.type,
        description: journalData.description,
        metadata: journalData.metadata,
        totalAmountMinor: entries.reduce(
          (acc, e) => acc + (e.type === "DEBIT" ? e.amountMinor : 0n),
          0n,
        ),
      },
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    });

    // Create entries
    for (const entry of entries) {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any).ledgerEntry.create({
        data: {
          journalId: journal.id,
          walletId: entry.walletId,
          type: entry.type,
          amountMinor: entry.amountMinor,
          balanceAfterMinor: entry.balanceAfterMinor,
        },
      });
    }

    this.logger.debug(
      `Created ledger journal ${journal.id} with ${entries.length} entries`,
    );

    return journal.id;
  }

  /**
   * Validate ledger integrity for a wallet
   */
  async validateWalletLedger(walletId: string): Promise<{
    try {
    isValid: boolean;
    expectedBalance: bigint;
    actualBalance: bigint;
    discrepancy: bigint;
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }> {
    // Validate UUID
    this.validateUUID(walletId, 'Wallet ID');

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!wallet) {
      throw new NotFoundException(`Wallet ${walletId} not found`);
    }

    // Calculate expected balance from ledger entries
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = await (this.prisma as any).ledgerEntry.findMany({
      where: { walletId },
    });

    let expectedBalance = 0n;
    for (const entry of entries) {
      if (entry.type === "CREDIT") {
        expectedBalance += entry.amountMinor;
      } else {
        expectedBalance -= entry.amountMinor;
      }
    }

    const actualBalance = wallet.balanceMinor;
    const discrepancy = actualBalance - expectedBalance;

    return {
      isValid: discrepancy === 0n,
      expectedBalance,
      actualBalance,
      discrepancy,
    };
  }
}
