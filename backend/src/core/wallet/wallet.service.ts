import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { WithdrawalStatus, DepositStatus, Prisma, PaymentType, PaymentStatus, Currency } from '@prisma/client';

interface LockBalanceData {
  userId: string;
  amount: bigint;
  reason: string;
  referenceId?: string;
  initiatedBy: string;
  ipAddress?: string;
  userAgent?: string;
}

interface BalanceResult {
  balanceMinor: string;
  balance: string;
  currency: string;
}

interface DetailedBalanceResult {
  balanceMinor: string;
  balance: string;
  lockedMinor: string;
  locked: string;
  availableMinor: string;
  available: string;
  currency: string;
}

type WalletRecord = {
  id: string;
  userId: string;
  balanceMinor: bigint;
  lockedMinor: bigint | null;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private readonly MINOR_UNIT_DIVISOR = new Decimal(100);

  constructor(private prisma: PrismaService) {}

  /**
   * Get user's wallet balance
   */
  async getBalance(userId: string): Promise<BalanceResult> {
    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const balanceMinor = wallet.balanceMinor.toString();
      const balance = new Decimal(balanceMinor)
        .div(this.MINOR_UNIT_DIVISOR)
        .toFixed(2);

      return {
        balanceMinor,
        balance,
        currency: wallet.currency,
      };
    } catch (error) {
      this.logger.error(`Error in getBalance: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * Get detailed wallet balance including locked amount
   */
  async getBalanceDetailed(userId: string): Promise<DetailedBalanceResult> {
    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const balanceMinor = wallet.balanceMinor.toString();
      const lockedMinor = (wallet.lockedMinor || 0n).toString();
      const availableMinor = (wallet.balanceMinor - (wallet.lockedMinor || 0n)).toString();

      return {
        balanceMinor,
        balance: new Decimal(balanceMinor).div(this.MINOR_UNIT_DIVISOR).toFixed(2),
        lockedMinor,
        locked: new Decimal(lockedMinor).div(this.MINOR_UNIT_DIVISOR).toFixed(2),
        availableMinor,
        available: new Decimal(availableMinor).div(this.MINOR_UNIT_DIVISOR).toFixed(2),
        currency: wallet.currency,
      };
    } catch (error) {
      this.logger.error(`Error in getBalanceDetailed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactions(userId: string, options: { page?: number; limit?: number; type?: string }) {
    const { page = 1, limit = 20 } = options;

    if (page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const skip = (page - 1) * limit;
    const halfLimit = Math.floor(limit / 2);

    const [deposits, withdrawals, totalDeposits, totalWithdrawals] = await Promise.all([
      this.prisma.deposit.findMany({
        where: { walletId: wallet.id },
        skip,
        take: halfLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.withdrawal.findMany({
        where: { walletId: wallet.id },
        skip,
        take: halfLimit,
        orderBy: { requestedAt: 'desc' },
      }),
      this.prisma.deposit.count({ where: { walletId: wallet.id } }),
      this.prisma.withdrawal.count({ where: { walletId: wallet.id } }),
    ]);

    const transactions = [
      ...deposits.map(d => ({
        id: d.id,
        type: 'DEPOSIT' as const,
        amountMinor: d.amountMinor.toString(),
        amount: new Decimal(d.amountMinor.toString()).div(this.MINOR_UNIT_DIVISOR).toFixed(2),
        currency: d.currency,
        description: 'Deposit',
        status: d.status,
        createdAt: d.createdAt,
      })),
      ...withdrawals.map(w => ({
        id: w.id,
        type: 'WITHDRAWAL' as const,
        amountMinor: w.amountMinor.toString(),
        amount: new Decimal(w.amountMinor.toString()).div(this.MINOR_UNIT_DIVISOR).toFixed(2),
        currency: w.currency,
        description: 'Withdrawal',
        status: w.status,
        createdAt: w.requestedAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);

    const total = totalDeposits + totalWithdrawals;

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lock balance for escrow or pending transactions
   */
  async lockBalance(data: LockBalanceData): Promise<{ success: boolean }> {
    return await this.prisma.$transaction(async (tx) => {
      try {
        const wallets = await tx.$queryRaw<WalletRecord[]>`
          SELECT * FROM "Wallet"
          WHERE "userId" = ${data.userId}::uuid
          FOR UPDATE NOWAIT
        `;

        if (!wallets || wallets.length === 0) {
          throw new NotFoundException('Wallet not found');
        }

        const wallet = wallets[0];
        const lockedMinor = wallet.lockedMinor || 0n;
        const availableMinor = wallet.balanceMinor - lockedMinor;

        if (availableMinor < data.amount) {
          this.logger.warn(`Insufficient balance for user ${data.userId}: available=${availableMinor}, requested=${data.amount}`);
          throw new BadRequestException('Insufficient available balance');
        }

        await tx.wallet.update({
          where: { userId: data.userId },
          data: {
            lockedMinor: lockedMinor + data.amount,
            updatedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            action: 'BALANCE_LOCK',
            performedBy: data.initiatedBy,
            entityType: 'WALLET',
            entityId: wallet.id,
            details: {
              before: { lockedMinor: lockedMinor.toString() },
              after: { lockedMinor: (lockedMinor + data.amount).toString() },
              amount: data.amount.toString(),
              reason: data.reason,
              referenceId: data.referenceId,
            },
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
          },
        });

        this.logger.log(`Balance locked for user ${data.userId}: amount=${data.amount}, reason=${data.reason}`);
        return { success: true };
      } catch (error) {
        this.logger.error(`Failed to lock balance for user ${data.userId}:`, error);
        throw error;
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 5000,
    });
  }

  /**
   * Unlock previously locked balance
   */
  async unlockBalance(
    userId: string,
    amountMinor: bigint,
    reason: string,
    tx?: any
  ): Promise<{ success: boolean }> {
    const execute = async (client: any) => {
      const wallets = await client.$queryRaw<WalletRecord[]>`
        SELECT * FROM "Wallet"
        WHERE "userId" = ${userId}::uuid
        FOR UPDATE NOWAIT
      `;

      if (!wallets || wallets.length === 0) {
        throw new NotFoundException('Wallet not found');
      }

      const wallet = wallets[0];
      const lockedMinor = wallet.lockedMinor || 0n;

      if (lockedMinor < amountMinor) {
        this.logger.warn(`Insufficient locked balance for user ${userId}: locked=${lockedMinor}, requested=${amountMinor}`);
        throw new BadRequestException('Insufficient locked balance');
      }

      const newLockedMinor = lockedMinor - amountMinor;

      await client.wallet.update({
        where: { userId },
        data: {
          lockedMinor: newLockedMinor,
          updatedAt: new Date(),
        },
      });

      await client.auditLog.create({
        data: {
          action: 'BALANCE_UNLOCK',
          performedBy: 'system',
          entityType: 'WALLET',
          entityId: wallet.id,
          details: {
            before: { lockedMinor: lockedMinor.toString() },
            after: { lockedMinor: newLockedMinor.toString() },
            amount: amountMinor.toString(),
            reason,
          },
        },
      });

      this.logger.log(`Balance unlocked for user ${userId}: amount=${amountMinor}, reason=${reason}`);
      return { success: true };
    };

    if (tx) {
      return execute(tx);
    }

    return await this.prisma.$transaction(async (txn) => execute(txn), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 5000,
    });
  }

  /**
   * Transfer locked balance from one user to another
   */
  async transferLockedBalance(
    fromUserId: string,
    toUserId: string,
    amountMinor: bigint,
    reason: string,
    tx?: any
  ): Promise<{ success: boolean }> {
    const execute = async (client: any) => {
      const [userId1, userId2] = [fromUserId, toUserId].sort();

      const wallets = await client.$queryRaw<WalletRecord[]>`
        SELECT * FROM "Wallet"
        WHERE "userId" IN (${userId1}::uuid, ${userId2}::uuid)
        ORDER BY "userId"
        FOR UPDATE NOWAIT
      `;

      if (!wallets || wallets.length !== 2) {
        throw new NotFoundException('One or both wallets not found');
      }

      const fromWallet = wallets.find((w: WalletRecord) => w.userId === fromUserId);
      const toWallet = wallets.find((w: WalletRecord) => w.userId === toUserId);

      if (!fromWallet || !toWallet) {
        throw new NotFoundException('Wallet not found');
      }

      const fromLockedMinor = fromWallet.lockedMinor || 0n;

      if (fromLockedMinor < amountMinor) {
        this.logger.warn(`Insufficient locked balance for transfer: from=${fromUserId}, amount=${amountMinor}`);
        throw new BadRequestException('Insufficient locked balance');
      }

      await client.wallet.update({
        where: { userId: fromUserId },
        data: {
          lockedMinor: fromLockedMinor - amountMinor,
          balanceMinor: fromWallet.balanceMinor - amountMinor,
          updatedAt: new Date(),
        },
      });

      await client.wallet.update({
        where: { userId: toUserId },
        data: {
          balanceMinor: toWallet.balanceMinor + amountMinor,
          updatedAt: new Date(),
        },
      });

      await client.auditLog.createMany({
        data: [
          {
            action: 'BALANCE_TRANSFER_OUT',
            performedBy: 'system',
            entityType: 'WALLET',
            entityId: fromWallet.id,
            details: {
              before: {
                balanceMinor: fromWallet.balanceMinor.toString(),
                lockedMinor: fromLockedMinor.toString(),
              },
              after: {
                balanceMinor: (fromWallet.balanceMinor - amountMinor).toString(),
                lockedMinor: (fromLockedMinor - amountMinor).toString(),
              },
              amount: amountMinor.toString(),
              reason,
              toUserId,
            },
          },
          {
            action: 'BALANCE_TRANSFER_IN',
            performedBy: 'system',
            entityType: 'WALLET',
            entityId: toWallet.id,
            details: {
              before: { balanceMinor: toWallet.balanceMinor.toString() },
              after: { balanceMinor: (toWallet.balanceMinor + amountMinor).toString() },
              amount: amountMinor.toString(),
              reason,
              fromUserId,
            },
          },
        ],
      });

      this.logger.log(`Balance transferred: from=${fromUserId}, to=${toUserId}, amount=${amountMinor}`);
      return { success: true };
    };

    if (tx) {
      return execute(tx);
    }

    return await this.prisma.$transaction(async (txn) => execute(txn), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 5000,
    });
  }

  async getWithdrawals(userId: string, status?: string, page: number = 1, limit: number = 20) {
    if (page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const where: Prisma.WithdrawalWhereInput = { walletId: wallet.id };

    if (status) {
      const upperStatus = status.toUpperCase();
      if (Object.values(WithdrawalStatus).includes(upperStatus as WithdrawalStatus)) {
        where.status = upperStatus as WithdrawalStatus;
      }
    }

    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { requestedAt: 'desc' },
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    return {
      data: withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async cancelPendingWithdrawal(
    userId: string,
    withdrawalId: string,
    initiatedBy: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const withdrawal = await tx.withdrawal.findFirst({
        where: {
          id: withdrawalId,
          walletId: wallet.id,
          status: WithdrawalStatus.PENDING,
        },
      });

      if (!withdrawal) {
        throw new NotFoundException('Pending withdrawal not found');
      }

      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.REJECTED,
          rejectionReason: 'Cancelled by user',
          processedAt: new Date(),
        },
      });

      const wallets = await tx.$queryRaw<WalletRecord[]>`
        SELECT * FROM "Wallet"
        WHERE "userId" = ${userId}::uuid
        FOR UPDATE
      `;

      if (wallets && wallets.length > 0) {
        const currentWallet = wallets[0];
        const lockedMinor = currentWallet.lockedMinor || 0n;

        await tx.wallet.update({
          where: { userId },
          data: {
            lockedMinor: lockedMinor - withdrawal.amountMinor,
            updatedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            action: 'WITHDRAWAL_CANCELLED',
            performedBy: initiatedBy,
            entityType: 'WITHDRAWAL',
            entityId: withdrawalId,
            details: {
              status: { before: WithdrawalStatus.PENDING, after: WithdrawalStatus.REJECTED },
              reason: 'Cancelled by user',
              amount: withdrawal.amountMinor.toString(),
            },
            ipAddress,
            userAgent,
          },
        });
      }

      this.logger.log(`Withdrawal cancelled: id=${withdrawalId}, user=${userId}`);
      return { message: 'Withdrawal cancelled successfully' };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      timeout: 5000,
    });
  }

  async getSupportedBanks() {
    return [
      { code: 'BCA', name: 'Bank Central Asia' },
      { code: 'BNI', name: 'Bank Negara Indonesia' },
      { code: 'BRI', name: 'Bank Rakyat Indonesia' },
      { code: 'MANDIRI', name: 'Bank Mandiri' },
      { code: 'CIMB', name: 'CIMB Niaga' },
      { code: 'PERMATA', name: 'Bank Permata' },
      { code: 'DANAMON', name: 'Bank Danamon' },
      { code: 'BSI', name: 'Bank Syariah Indonesia' },
    ];
  }

  async getWithdrawalHistory(userId: string, options: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = options;
    return this.getWithdrawals(userId, status, page, limit);
  }

  async getDepositHistory(userId: string, options: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = options;
    return this.getDeposits(userId, status, page, limit);
  }

  async getDeposits(userId: string, status?: string, page: number = 1, limit: number = 20) {
    if (page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const where: Prisma.DepositWhereInput = { walletId: wallet.id };

    if (status) {
      const upperStatus = status.toUpperCase();
      if (Object.values(DepositStatus).includes(upperStatus as DepositStatus)) {
        where.status = upperStatus as DepositStatus;
      }
    }

    const [deposits, total] = await Promise.all([
      this.prisma.deposit.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deposit.count({ where }),
    ]);

    return {
      data: deposits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDepositDetail(userId: string, depositId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const deposit = await this.prisma.deposit.findFirst({
      where: {
        id: depositId,
        walletId: wallet.id,
      },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    return deposit;
  }

  async getDepositById(id: string, userId: string) {
    return this.getDepositDetail(userId, id);
  }

  async getWithdrawalDetail(userId: string, withdrawalId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: {
        id: withdrawalId,
        walletId: wallet.id,
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    return withdrawal;
  }

  async topUp(
    userId: string,
    dto: { amount: number; paymentMethod?: string },
  ) {
    const MIN_AMOUNT = 10_000;
    const MAX_AMOUNT = 100_000_000;

    if (dto.amount < MIN_AMOUNT) {
      throw new BadRequestException(`Minimum top-up amount is ${MIN_AMOUNT} IDR`);
    }

    if (dto.amount > MAX_AMOUNT) {
      throw new BadRequestException(`Maximum top-up amount is ${MAX_AMOUNT} IDR`);
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: { user: { select: { email: true, username: true } } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const amountMinor = BigInt(Math.round(dto.amount * 100));

    return await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId,
          paymentType: PaymentType.DEPOSIT,
          currency: wallet.currency as Currency,
          amountMinor,
          status: PaymentStatus.PENDING,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const deposit = await tx.deposit.create({
        data: {
          walletId: wallet.id,
          paymentId: payment.id,
          currency: wallet.currency as Currency,
          amountMinor,
          status: DepositStatus.PENDING,
        },
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const paymentUrl = `${frontendUrl}/payment/${payment.id}`;

      return {
        depositId: deposit.id,
        paymentId: payment.id,
        amount: dto.amount,
        amountMinor: amountMinor.toString(),
        currency: wallet.currency,
        paymentUrl,
        status: deposit.status,
        expiresAt: payment.expiresAt,
      };
    });
  }

  async withdraw(
    userId: string,
    dto: { amount: number; bankAccountId: string },
    idempotencyKey?: string,
  ) {
    const MIN_AMOUNT = 50_000;
    const MAX_AMOUNT = 100_000_000;

    if (dto.amount < MIN_AMOUNT) {
      throw new BadRequestException(`Minimum withdrawal amount is ${MIN_AMOUNT} IDR`);
    }

    if (dto.amount > MAX_AMOUNT) {
      throw new BadRequestException(`Maximum withdrawal amount is ${MAX_AMOUNT} IDR`);
    }

    if (idempotencyKey) {
      const existing = await this.prisma.withdrawal.findFirst({
        where: {
          userId,
          idempotencyKey,
        },
      });

      if (existing) {
        return existing;
      }
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const amountMinor = BigInt(Math.round(dto.amount * 100));
    const available = wallet.balanceMinor - (wallet.lockedMinor || 0n);

    if (available < amountMinor) {
      throw new BadRequestException('Insufficient balance');
    }

    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id: dto.bankAccountId, userId },
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return await this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          lockedMinor: (wallet.lockedMinor || 0n) + amountMinor,
        },
      });

      if (!updatedWallet) {
        throw new BadRequestException('Failed to lock balance');
      }

      const withdrawal = await tx.withdrawal.create({
        data: {
          walletId: wallet.id,
          userId,
          amountMinor,
          currency: wallet.currency as Currency,
          status: WithdrawalStatus.PENDING,
          bankAccountId: dto.bankAccountId,
          idempotencyKey,
        },
      });

      return withdrawal;
    });
  }
}
