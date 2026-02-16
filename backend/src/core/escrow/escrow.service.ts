import { ConfigService } from "@nestjs/config";
import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException, ConflictException } from "@nestjs/common";
import { EscrowHold, EscrowHoldStatus, Order, OrderStatus, LedgerAccountType } from "@prisma/client";
import { LedgerService } from "../ledger/ledger.service";
import { PrismaService } from "@infrastructure/database/prisma.service";
import { WalletService } from "../wallet/wallet.service";

// ============================================================================
// BANK-GRADE ESCROW SERVICE
// Implements: State Machine Validation, Atomic Fund Movements, Timeout Enforcement
// ============================================================================

// FIX #86: Use Symbol to prevent system actor spoofing
const SYSTEM_ACTOR = Symbol('INTERNAL_SYSTEM_ACTOR');

export interface SystemActor {
  type: typeof SYSTEM_ACTOR;
  reason: string;
}

export class InvalidStateTransitionError extends BadRequestException {
  constructor(currentState: string, targetState: string) {
    super({
      code: "INVALID_STATE_TRANSITION",
      message: `Cannot transition from ${currentState} to ${targetState}`,
      currentState,
      targetState,
    });
  }
}

export class UnauthorizedTransitionError extends ForbiddenException {
  constructor(actorId: string, action: string) {
    super({
      code: "UNAUTHORIZED_TRANSITION",
      message: `User ${actorId} is not authorized to perform ${action}`,
    });
  }
}

export class EscrowLockTimeoutError extends ConflictException {
  constructor(escrowId: string) {
    super({
      code: "ESCROW_LOCK_TIMEOUT",
      message: `Failed to acquire lock on escrow ${escrowId} after multiple retries. Please try again.`,
    });
  }
}

// ============================================================================
// STATE MACHINE DEFINITIONS
// ============================================================================

/**
 * BANK-GRADE: Escrow State Machine
 * Defines all valid state transitions
 */
const ESCROW_STATE_MACHINE: Record<EscrowHoldStatus, EscrowHoldStatus[]> = {
  [EscrowHoldStatus.ACTIVE]: [
    EscrowHoldStatus.RELEASED,
    EscrowHoldStatus.REFUNDED,
    EscrowHoldStatus.DISPUTED,
  ],
  [EscrowHoldStatus.HELD]: [
    EscrowHoldStatus.RELEASED,
    EscrowHoldStatus.REFUNDED,
    EscrowHoldStatus.DISPUTED,
  ],
  [EscrowHoldStatus.DISPUTED]: [
    EscrowHoldStatus.ADJUSTED,
    EscrowHoldStatus.RELEASED,
    EscrowHoldStatus.REFUNDED,
  ],
  [EscrowHoldStatus.RELEASED]: [], // Terminal state
  [EscrowHoldStatus.REFUNDED]: [], // Terminal state
  [EscrowHoldStatus.ADJUSTED]: [], // Terminal state (dispute resolution)
};

/**
 * BANK-GRADE: Order State Machine
 * Defines all valid state transitions
 */
const ORDER_STATE_MACHINE: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.WAITING_COUNTERPARTY]: [
    OrderStatus.PENDING_ACCEPT,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PENDING_ACCEPT]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [
    OrderStatus.COMPLETED,
    OrderStatus.REFUNDED,
    OrderStatus.DISPUTED,
  ],
  [OrderStatus.COMPLETED]: [], // Terminal state
  [OrderStatus.CANCELLED]: [], // Terminal state
  [OrderStatus.REFUNDED]: [], // Terminal state
  [OrderStatus.DISPUTED]: [OrderStatus.COMPLETED, OrderStatus.REFUNDED], // After dispute resolution
};

export interface CreateEscrowOptions {
  orderId: string;
  buyerUserId: string;
  sellerUserId?: string;
  amountMinor: bigint;
  timeoutHours?: number;
  idempotencyKey: string;
}

export interface ReleaseEscrowOptions {
  escrowId: string;
  actorId: string | SystemActor;
  platformFeeMinor: bigint;
  idempotencyKey: string;
}

export interface RefundEscrowOptions {
  escrowId: string;
  actorId: string | SystemActor;
  reason: string;
  idempotencyKey: string;
}

export interface ResolveDisputeOptions {
  escrowId: string;
  resolverId: string;
  buyerRefundMinor: bigint;
  sellerAmountMinor: bigint;
  platformFeeMinor: bigint;
  resolution: "BUYER_WINS" | "SELLER_WINS" | "SPLIT";
  notes: string;
  idempotencyKey: string;
}

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);
  private readonly DEFAULT_TIMEOUT_HOURS = 72; // 3 days
  // FIX REL-001: Configuration for lock retry mechanism
  private readonly LOCK_MAX_RETRIES = 3;
  private readonly LOCK_RETRY_DELAY_MS = 200;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly walletService: WalletService,
    private readonly ledgerService: LedgerService,
  ) {}

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * FIX #86: Create system actor marker (internal use only)
   */
  private createSystemActor(reason: string): SystemActor {
    return {
      type: SYSTEM_ACTOR,
      reason,
    };
  }

  /**
   * FIX #86: Check if actor is system
   */
  private isSystemActor(actor: string | SystemActor): actor is SystemActor {
    return typeof actor === 'object' && actor.type === SYSTEM_ACTOR;
  }

  /**
   * FIX REL-001: Acquire pessimistic lock with retry logic
   * Removes NOWAIT to allow waiting for lock, adds exponential backoff
   */
  private async acquireEscrowLockWithRetry<T>(
    escrowId: string,
    operation: (escrow: EscrowHold & { order: Order; buyerWallet: any; sellerWallet: any | null }) => Promise<T>,
    tx: any,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.LOCK_MAX_RETRIES; attempt++) {
      try {
        // FIX REL-001: Remove NOWAIT, use default wait behavior with statement timeout
        // This allows the query to wait for lock instead of failing immediately
        // SECURITY: Ensure input is properly sanitized
        const escrowRows = await tx.$queryRaw<any[]>`
          SELECT * FROM "EscrowHold"
          WHERE id = ${escrowId}::uuid
          FOR UPDATE
        `;

        if (!escrowRows || escrowRows.length === 0) {
          throw new NotFoundException('Escrow not found');
        }

        // Get full escrow with relations
        const escrow = await tx.escrowHold.findUnique({
          where: { id: escrowId },
          include: { order: true, buyerWallet: true, sellerWallet: true },
        });

        if (!escrow) {
          throw new NotFoundException('Escrow not found');
        }

        // Execute the operation with locked escrow
        return await operation(escrow);

      } catch (error: any) {
        lastError = error;

        // If it's a lock timeout or deadlock, retry with exponential backoff
        if (
          error.code === '40P01' || // deadlock_detected
          error.code === '55P03'    // lock_not_available
        ) {
          if (attempt < this.LOCK_MAX_RETRIES - 1) {
            const delay = this.LOCK_RETRY_DELAY_MS * Math.pow(2, attempt);
            this.logger.warn(
              `Lock contention on escrow ${escrowId}, retrying in ${delay}ms (attempt ${attempt + 1}/${this.LOCK_MAX_RETRIES})`,
            );
            await this.delay(delay);
            continue;
          }
        }

        // For other errors, throw immediately
        throw error;
      }
    }

    // If all retries exhausted
    throw new EscrowLockTimeoutError(escrowId);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================================================
  // STATE MACHINE VALIDATION
  // ============================================================================

  /**
   * BANK-GRADE: Validate escrow state transition
   */
  validateEscrowTransition(
    currentStatus: EscrowHoldStatus,
    targetStatus: EscrowHoldStatus,
  ): boolean {
    const allowedTransitions = ESCROW_STATE_MACHINE[currentStatus];
    if (!allowedTransitions.includes(targetStatus)) {
      throw new InvalidStateTransitionError(currentStatus, targetStatus);
    }
    return true;
  }

  /**
   * BANK-GRADE: Validate order state transition
   */
  validateOrderTransition(
    currentStatus: OrderStatus,
    targetStatus: OrderStatus,
  ): boolean {
    const allowedTransitions = ORDER_STATE_MACHINE[currentStatus];
    if (!allowedTransitions.includes(targetStatus)) {
      throw new InvalidStateTransitionError(currentStatus, targetStatus);
    }
    return true;
  }

  /**
   * FIX #85: Correctly validate actor permissions
   * BANK-GRADE: Validate actor can perform transition
   */
  validateActorPermission(
    escrow: EscrowHold & { order: Order },
    actorId: string,
    action: string,
  ): boolean {
    const order = escrow.order;

    // Determine buyer and seller IDs based on order initiator role
    const buyerId = order.initiatorRole === "BUYER"
      ? order.initiatorId
      : order.counterpartyId;

    const sellerId = order.initiatorRole === "SELLER"
      ? order.initiatorId
      : order.counterpartyId;

    switch (action) {
      case "RELEASE":
        // FIX #85: Only buyer can release (confirm delivery)
        if (actorId !== buyerId) {
          throw new UnauthorizedTransitionError(actorId, action);
        }
        break;

      case "REFUND":
        // Only seller can initiate refund
        if (actorId !== sellerId) {
          throw new UnauthorizedTransitionError(actorId, action);
        }
        break;

      case "DISPUTE":
        // Both parties can dispute
        if (actorId !== order.initiatorId && actorId !== order.counterpartyId) {
          throw new UnauthorizedTransitionError(actorId, action);
        }
        break;

      case "RESOLVE":
        // Only admin can resolve disputes
        // This should be checked at controller level with admin guard
        break;

      default:
        throw new BadRequestException(`Unknown action: ${action}`);
    }

    return true;
  }

  // ============================================================================
  // ESCROW OPERATIONS
  // ============================================================================

  /**
   * BANK-GRADE: Create escrow hold
   */
  async createEscrow(options: CreateEscrowOptions): Promise<EscrowHold> {
    try {
      const {
        orderId,
        buyerUserId,
        sellerUserId,
        amountMinor,
        timeoutHours = this.DEFAULT_TIMEOUT_HOURS,
        idempotencyKey,
      } = options;

      // Check idempotency
      const existing = await this.prisma.escrowHold.findFirst({
        where: { orderId },
      });

      if (existing) {
        this.logger.warn(`Escrow already exists for order ${orderId}`);
        return existing;
      }

      // Get buyer wallet
      const buyerWallet = await this.prisma.wallet.findUnique({
        where: { userId: buyerUserId },
      });

      if (!buyerWallet) {
        throw new NotFoundException("Buyer wallet not found");
      }

      // Get seller wallet if provided
      let sellerWallet: { id: string } | null = null;
      if (sellerUserId) {
        sellerWallet = await this.prisma.wallet.findUnique({
          where: { userId: sellerUserId },
        });
      }

      // Calculate timeout
      const timeoutAt = new Date(Date.now() + timeoutHours * 60 * 60 * 1000);

      // Create escrow in transaction
      const escrow = await this.prisma.$transaction(async (tx: any) => {
        // Lock buyer's balance
        await this.walletService.lockBalance({
          userId: buyerUserId,
          amount: amountMinor,
          reason: `Escrow hold for order ${orderId}`,
          initiatedBy: 'system',
        });

        // Create escrow record
        const newEscrow = await tx.escrowHold.create({
          data: {
            orderId,
            buyerWalletId: buyerWallet.id,
            sellerWalletId: sellerWallet?.id,
            amountMinor,
            status: EscrowHoldStatus.ACTIVE,
            timeoutAt,
          },
        });

        // Get or create accounts for ledger
        const buyerAccount = await this.ledgerService.getOrCreateUserAccount(
          buyerWallet.id,
          LedgerAccountType.ASSET,
          "IDR",
          tx,
        );

        const escrowAccount = await this.ledgerService.getOrCreatePlatformAccount(
          "ESCROW_HOLDING",
          LedgerAccountType.LIABILITY,
          "IDR",
          tx,
        );

        // Record in ledger
        await this.ledgerService.recordEscrowHold(
          buyerAccount.id,
          escrowAccount.id,
          amountMinor,
          newEscrow.id,
          orderId,
          idempotencyKey,
          tx,
        );

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.PAID,
            autoReleaseAt: timeoutAt,
          },
        });

        return newEscrow;
      });

      this.logger.log(
        `Created escrow ${escrow.id} for order ${orderId}, amount: ${amountMinor}`,
      );

      return escrow;
    } catch (error) {
      this.logger.error(`Error in createEscrow: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * FIX #87 + REL-001: Implement pessimistic locking with retry logic
   * BANK-GRADE: Release escrow to seller
   */
  async releaseEscrow(options: ReleaseEscrowOptions): Promise<EscrowHold> {
    const { escrowId, actorId, platformFeeMinor, idempotencyKey } = options;

    // FIX REL-001: Execute in transaction with pessimistic locking and retry
    const updatedEscrow = await this.prisma.$transaction(async (tx: any) => {
      return await this.acquireEscrowLockWithRetry(
        escrowId,
        async (escrow) => {
          // FIX #87: Validate state INSIDE transaction with fresh data
          if (escrow.status !== EscrowHoldStatus.ACTIVE) {
            throw new BadRequestException(
              `Escrow already processed: ${escrow.status}`,
            );
          }

          // Validate state transition
          this.validateEscrowTransition(escrow.status, EscrowHoldStatus.RELEASED);

          // FIX #86: Validate actor permission (skip for system)
          if (!this.isSystemActor(actorId)) {
            this.validateActorPermission(escrow, actorId as string, "RELEASE");
          }

          if (!escrow.sellerWallet) {
            throw new BadRequestException("Seller wallet not set");
          }

          // Store seller wallet reference after null check for type safety
          const sellerWallet = escrow.sellerWallet;
          const sellerAmount = escrow.amountMinor - platformFeeMinor;

          // Get accounts
          const escrowAccount = await this.ledgerService.getOrCreatePlatformAccount(
            "ESCROW_HOLDING",
            LedgerAccountType.LIABILITY,
            "IDR",
            tx,
          );

          const sellerAccount = await this.ledgerService.getOrCreateUserAccount(
            sellerWallet.id,
            LedgerAccountType.ASSET,
            "IDR",
            tx,
          );

          const platformFeeAccount =
            await this.ledgerService.getOrCreatePlatformAccount(
              "PLATFORM_FEES",
              LedgerAccountType.REVENUE,
              "IDR",
              tx,
            );

          // Record in ledger
          await this.ledgerService.recordEscrowRelease(
            escrowAccount.id,
            sellerAccount.id,
            platformFeeAccount.id,
            escrow.amountMinor,
            platformFeeMinor,
            escrow.id,
            escrow.orderId,
            idempotencyKey,
            tx,
          );

          // Transfer locked balance from buyer to seller
          await this.walletService.transferLockedBalance(
            escrow.buyerWallet.userId,
            sellerWallet.userId,
            sellerAmount,
            `Escrow release for order ${escrow.orderId}`,
            tx,
          );

          // Deduct platform fee from buyer's locked balance
          if (platformFeeMinor > 0n) {
            await tx.wallet.update({
              where: { id: escrow.buyerWallet.id },
              data: {
                balanceMinor: { decrement: platformFeeMinor },
                lockedMinor: { decrement: platformFeeMinor },
              },
            });
          }

          // Update escrow status
          const updated = await tx.escrowHold.update({
            where: { id: escrowId },
            data: {
              status: EscrowHoldStatus.RELEASED,
              resolvedAt: new Date(),
            },
          });

          // Update order status
          await tx.order.update({
            where: { id: escrow.orderId },
            data: {
              status: OrderStatus.COMPLETED,
              completedAt: new Date(),
            },
          });

          return updated;
        },
        tx,
      );
    });

    this.logger.log(
      `Released escrow ${escrowId}`,
    );

    return updatedEscrow;
  }

  /**
   * FIX #87 + REL-001: Implement pessimistic locking with retry logic
   * BANK-GRADE: Refund escrow to buyer
   */
  async refundEscrow(options: RefundEscrowOptions): Promise<EscrowHold> {
    const { escrowId, actorId, reason, idempotencyKey } = options;

    // FIX REL-001: Execute in transaction with pessimistic locking and retry
    const updatedEscrow = await this.prisma.$transaction(async (tx: any) => {
      return await this.acquireEscrowLockWithRetry(
        escrowId,
        async (escrow) => {
          // FIX #87: Validate state INSIDE transaction with fresh data
          if (escrow.status !== EscrowHoldStatus.ACTIVE) {
            throw new BadRequestException(
              `Escrow already processed: ${escrow.status}`,
            );
          }

          // Validate state transition
          this.validateEscrowTransition(escrow.status, EscrowHoldStatus.REFUNDED);

          // FIX #86: Validate actor permission (skip for system timeout)
          if (!this.isSystemActor(actorId)) {
            this.validateActorPermission(escrow, actorId as string, "REFUND");
          }

          // Get accounts
          const escrowAccount = await this.ledgerService.getOrCreatePlatformAccount(
            "ESCROW_HOLDING",
            LedgerAccountType.LIABILITY,
            "IDR",
            tx,
          );

          const buyerAccount = await this.ledgerService.getOrCreateUserAccount(
            escrow.buyerWallet.id,
            LedgerAccountType.ASSET,
            "IDR",
            tx,
          );

          // Record in ledger
          await this.ledgerService.recordEscrowRefund(
            escrowAccount.id,
            buyerAccount.id,
            escrow.amountMinor,
            escrow.id,
            escrow.orderId,
            idempotencyKey,
            tx,
          );

          // Unlock buyer's balance
          await this.walletService.unlockBalance(
            escrow.buyerWallet.userId,
            escrow.amountMinor,
            `Escrow refund for order ${escrow.orderId}: ${reason}`,
            tx,
          );

          // Update escrow status
          const updated = await tx.escrowHold.update({
            where: { id: escrowId },
            data: {
              status: EscrowHoldStatus.REFUNDED,
              resolvedAt: new Date(),
            },
          });

          // Update order status
          await tx.order.update({
            where: { id: escrow.orderId },
            data: {
              status: OrderStatus.REFUNDED,
              cancelledAt: new Date(),
            },
          });

          return updated;
        },
        tx,
      );
    });

    this.logger.log(
      `Refunded escrow ${escrowId} to buyer, reason: ${reason}`,
    );

    return updatedEscrow;
  }

  /**
   * BANK-GRADE: Initiate dispute
   */
  async initiateDispute(
    escrowId: string,
    actorId: string,
    reason: string,
  ): Promise<EscrowHold> {
    const escrow = await this.prisma.escrowHold.findUnique({
      where: { id: escrowId },
      include: { order: true },
    });

    if (!escrow) {
      throw new NotFoundException("Escrow not found");
    }

    // Validate state transition
    this.validateEscrowTransition(escrow.status, EscrowHoldStatus.DISPUTED);

    // Validate actor permission
    this.validateActorPermission(escrow, actorId, "DISPUTE");

    // Update escrow and order status
    const [updatedEscrow] = await this.prisma.$transaction([
      this.prisma.escrowHold.update({
        where: { id: escrowId },
        data: { status: EscrowHoldStatus.DISPUTED },
      }),
      this.prisma.order.update({
        where: { id: escrow.orderId },
        data: { status: OrderStatus.DISPUTED },
      }),
      this.prisma.dispute.create({
        data: {
          orderId: escrow.orderId,
          openedBy: actorId,
          reason,
          description: reason,
          status: "OPEN",
        },
      }),
    ]);

    this.logger.log(
      `Dispute initiated for escrow ${escrowId} by ${actorId}: ${reason}`,
    );

    return updatedEscrow;
  }

  /**
   * BANK-GRADE: Resolve dispute (admin only)
   */
  async resolveDispute(options: ResolveDisputeOptions): Promise<EscrowHold> {
    try {
      const {
        escrowId,
        resolverId,
        buyerRefundMinor,
        sellerAmountMinor,
        platformFeeMinor,
        resolution,
        notes,
        idempotencyKey,
      } = options;

      const escrow = await this.prisma.escrowHold.findUnique({
        where: { id: escrowId },
        include: { order: true, buyerWallet: true, sellerWallet: true },
      });

      if (!escrow) {
        throw new NotFoundException("Escrow not found");
      }

      // Validate state transition
      this.validateEscrowTransition(
        escrow.status,
        resolution as any,
      );

      // Validate amounts
      const totalDistribution =
        buyerRefundMinor + sellerAmountMinor + platformFeeMinor;
      if (totalDistribution !== escrow.amountMinor) {
        throw new BadRequestException(
          `Distribution total (${totalDistribution}) must equal escrow amount (${escrow.amountMinor})`,
        );
      }

      if (!escrow.sellerWallet && sellerAmountMinor > 0n) {
        throw new BadRequestException(
          "Seller wallet not set but seller amount > 0",
        );
      }

      // Execute resolution in transaction
      const updatedEscrow = await this.prisma.$transaction(async (tx: any) => {
        // Get accounts
        const escrowAccount = await this.ledgerService.getOrCreatePlatformAccount(
          "ESCROW_HOLDING",
          LedgerAccountType.LIABILITY,
          "IDR",
          tx,
        );

        const buyerAccount = await this.ledgerService.getOrCreateUserAccount(
          escrow.buyerWallet.id,
          LedgerAccountType.ASSET,
          "IDR",
          tx,
        );

        const sellerAccount = escrow.sellerWallet
          ? await this.ledgerService.getOrCreateUserAccount(
              escrow.sellerWallet.id,
              LedgerAccountType.ASSET,
              "IDR",
              tx,
            )
          : null;

        const platformFeeAccount =
          await this.ledgerService.getOrCreatePlatformAccount(
            "PLATFORM_FEES",
            LedgerAccountType.REVENUE,
            "IDR",
            tx,
          );

        // Get dispute
        const dispute = await tx.dispute.findFirst({
          where: { orderId: escrow.orderId },
        });

        // Record in ledger
        await this.ledgerService.recordDisputeResolution(
          escrowAccount.id,
          buyerAccount.id,
          sellerAccount?.id ?? buyerAccount.id, // Fallback to buyer if no seller
          platformFeeAccount.id,
          buyerRefundMinor,
          sellerAmountMinor,
          platformFeeMinor,
          dispute?.id ?? escrow.id,
          escrow.orderId,
          idempotencyKey,
          tx,
        );

        // Distribute funds
        // First, unlock all from buyer
        await tx.wallet.update({
          where: { id: escrow.buyerWallet.id },
          data: {
            lockedMinor: { decrement: escrow.amountMinor },
            balanceMinor: { decrement: escrow.amountMinor - buyerRefundMinor },
          },
        });

        // Credit seller if applicable
        if (sellerAmountMinor > 0n && escrow.sellerWallet) {
          await tx.wallet.update({
            where: { id: escrow.sellerWallet.id },
            data: {
              balanceMinor: { increment: sellerAmountMinor },
            },
          });
        }

        // Update escrow status
        const updated = await tx.escrowHold.update({
          where: { id: escrowId },
          data: {
            status: resolution as any,
            resolvedAt: new Date(),
          },
        });

        // Update order status
        await tx.order.update({
          where: { id: escrow.orderId },
          data: {
            status: OrderStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        // Update dispute
        if (dispute) {
          await tx.dispute.update({
            where: { id: dispute.id },
            data: {
              status: "CLOSED",
              arbitratorId: resolverId,
              decidedAt: new Date(),
              resolutionNotes: notes,
            },
          });
        }

        return updated;
      });

      this.logger.log(
        `Resolved dispute for escrow ${escrowId}: buyer=${buyerRefundMinor}, seller=${sellerAmountMinor}, fee=${platformFeeMinor}`,
      );

      return updatedEscrow;
    } catch (error) {
      this.logger.error(`Error in resolveDispute: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * FIX #86: Use internal system actor instead of string
   * BANK-GRADE: Auto-release expired escrows (cron job)
   */
  async processExpiredEscrows(): Promise<number> {
    try {
      const now = new Date();

      const expiredEscrows = await this.prisma.escrowHold.findMany({
        where: {
          status: EscrowHoldStatus.ACTIVE,
          timeoutAt: { lte: now },
        },
        include: { order: true },
      });

      let processedCount = 0;

      for (const escrow of expiredEscrows) {
        try {
          // FIX #86: Use internal system actor marker
          const systemActor = this.createSystemActor('auto-release-timeout');

          // Auto-release to seller (default behavior for timeout)
          await this.releaseEscrow({
            escrowId: escrow.id,
            actorId: systemActor,
            platformFeeMinor: escrow.order.platformFeeMinor,
            idempotencyKey: `auto-release-${escrow.id}-${Date.now()}`,
          });
          processedCount++;
          this.logger.log(`Auto-released expired escrow ${escrow.id}`);
        } catch (error: unknown) {
          this.logger.error(
            `Failed to auto-release escrow ${escrow.id}: ${(error as Error).message}`,
          );
        }
      }

      return processedCount;
    } catch (error) {
      this.logger.error(`Error in processExpiredEscrows: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * Healthcheck
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      this.logger.debug("Health check called");
      return { status: "ok" };
    } catch (error) {
      this.logger.error(`Error in healthCheck: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
