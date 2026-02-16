import { CreateDepositDto } from './dto/create-deposit.dto';
import { DepositStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { nanoid } from 'nanoid';


import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';

/**
 * Deposit Service (HIGH-002)
 *
 * Implements deposit/top-up functionality that was NotImplementedException
 *
 * Features:
 * - Idempotency support
 * - Payment gateway integration structure
 * - Automatic wallet crediting
 * - Status tracking
 */
@Injectable()
export class WalletDepositService {
  private readonly logger = new Logger(WalletDepositService.name);

  constructor(
    private prisma: PrismaService,
    // Inject payment gateway service here when implemented
    // Private paymentGateway: PaymentGatewayService,
  ) {}

  /**
   * Create a new deposit request
   */
  async createDeposit(
    userId: string,
    dto: CreateDepositDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Validate amount
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Convert to minor units (cents)
    const amountMinor = BigInt(Math.round(dto.amount * 100));

    // Generate idempotency key if not provided
    const idempotencyKey = dto.idempotencyKey || nanoid(32);

    return await this.prisma.$transaction(
      async (tx) => {
        // Check idempotency - prevent duplicate deposits
        const existing = await tx.deposit.findUnique({
          where: { idempotencyKey },
        });

        if (existing) {
          this.logger.warn(
            `Duplicate deposit attempt: idempotencyKey=${idempotencyKey}`,
          );
          return existing;
        }

        // Get user's wallet
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new NotFoundException('Wallet not found');
        }

        // Create deposit record
        const deposit = await tx.deposit.create({
          data: {
            walletId: wallet.id,
            amountMinor,
            currency: dto.currency || 'IDR',
            status: DepositStatus.PENDING,
            paymentMethod: dto.paymentMethod,
            idempotencyKey,
            notes: dto.notes,
            // Payment gateway fields (to be filled by gateway callback)
            paymentUrl: null,
            paymentReference: nanoid(21), // Unique reference for this deposit
            paidAt: null,
          },
        });

        // For now, generate a mock payment URL
        const paymentUrl = `${process.env.FRONTEND_URL}/payment/${deposit.paymentReference}`;

        // Update deposit with payment URL
        const updatedDeposit = await tx.deposit.update({
          where: { id: deposit.id },
          data: { paymentUrl },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            action: 'DEPOSIT_CREATED',
            performedBy: userId,
            entityType: 'DEPOSIT',
            entityId: deposit.id,
            details: {
              amount: dto.amount,
              amountMinor: amountMinor.toString(),
              currency: dto.currency,
              paymentMethod: dto.paymentMethod,
              paymentReference: deposit.paymentReference,
            },
            ipAddress,
            userAgent,
          },
        });

        this.logger.log(
          `Deposit created: id=${deposit.id}, user=${userId}, amount=${dto.amount}`,
        );

        return updatedDeposit;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 10000,
      },
    );
  }

  /**
   * Process payment callback (webhook from payment gateway)
   * This is called by payment gateway when payment is successful
   */
  async processPaymentCallback(
    paymentReference: string,
    paymentData: {
      status: 'SUCCESS' | 'FAILED';
      paidAmount: number;
      transactionId: string;
      paidAt: Date;
    },
  ) {
    return await this.prisma.$transaction(
      async (tx) => {
        // Find deposit by payment reference
        const deposit = await tx.deposit.findFirst({
          where: { paymentReference },
          include: { wallet: true },
        });

        if (!deposit) {
          throw new NotFoundException('Deposit not found');
        }

        if (deposit.status !== DepositStatus.PENDING) {
          this.logger.warn(
            `Deposit already processed: id=${deposit.id}, status=${deposit.status}`,
          );
          return deposit;
        }

        // Validate amount matches
        const expectedAmount = Number(deposit.amountMinor) / 100;
        if (Math.abs(expectedAmount - paymentData.paidAmount) > 0.01) {
          // Amount mismatch - mark as failed
          await tx.deposit.update({
            where: { id: deposit.id },
            data: {
              status: DepositStatus.FAILED,
              failureReason: `Amount mismatch: expected ${expectedAmount}, got ${paymentData.paidAmount}`,
            },
          });

          throw new BadRequestException('Payment amount mismatch');
        }

        if (paymentData.status === 'SUCCESS') {
          const wallets = await tx.$queryRaw<any[]>`
            SELECT * FROM "Wallet"
            WHERE "id" = ${deposit.walletId}::uuid
            FOR UPDATE
          `;

          if (!wallets || wallets.length === 0) {
            throw new NotFoundException('Wallet not found');
          }

          const wallet = wallets[0];
          const newBalance = wallet.balanceMinor + deposit.amountMinor;

          await tx.wallet.update({
            where: { id: deposit.walletId },
            data: {
              balanceMinor: newBalance,
              updatedAt: new Date(),
            },
          });

          // Update deposit status
          await tx.deposit.update({
            where: { id: deposit.id },
            data: {
              status: DepositStatus.COMPLETED,
              paidAt: paymentData.paidAt,
              gatewayTransactionId: paymentData.transactionId,
            },
          });

          // Create audit log
          await tx.auditLog.create({
            data: {
              action: 'DEPOSIT_COMPLETED',
              performedBy: deposit.wallet.userId,
              entityType: 'DEPOSIT',
              entityId: deposit.id,
              details: {
                before: { balanceMinor: wallet.balanceMinor.toString() },
                after: { balanceMinor: newBalance.toString() },
                amount: deposit.amountMinor.toString(),
                transactionId: paymentData.transactionId,
              },
            },
          });

          this.logger.log(
            `Deposit completed: id=${deposit.id}, amount=${deposit.amountMinor}`,
          );
        } else {
          // Payment failed
          await tx.deposit.update({
            where: { id: deposit.id },
            data: {
              status: DepositStatus.FAILED,
              failureReason: 'Payment failed',
            },
          });

          this.logger.warn(`Deposit failed: id=${deposit.id}`);
        }

        return tx.deposit.findUnique({ where: { id: deposit.id } });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000,
      },
    );
  }

  /**
   * Get deposit status
   */
  async getDepositStatus(userId: string, depositId: string) {
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
}
