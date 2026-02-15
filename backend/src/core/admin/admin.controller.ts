
import {
import {
import {
import { AdminReasonDto, SuspendUserDto } from "./dto/admin-action.dto";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { DisputeDecision } from "@prisma/client";
import { DisputeService } from "../dispute/dispute.service";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@infrastructure/database/prisma.service";
import { Roles } from "@common/decorators/roles.decorator";
import { RolesGuard } from "@common/guards/roles.guard";

  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from "@nestjs/swagger";
  AdminAdjustBalanceDto,
  AdminFreezeWalletDto,
  AdminUnfreezeWalletDto,
  AdminWalletAdjustmentType,
} from "./dto/admin-wallet.dto";

// ============================================================================
// ADMIN CONTROLLER - Production Ready
// ============================================================================

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("JWT-auth")
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly disputeService: DisputeService,
  ) {}

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  @Get("dashboard")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get admin dashboard statistics" })
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      activeTransactions,
      pendingWithdrawals,
      pendingDisputes,
      todayVolume,
      totalVolume,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: {
          deletedAt: null,
          lastLoginAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.count({ where: { deletedAt: null } }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.count({
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { status: { in: ["PAID", "DISPUTED"] }, deletedAt: null },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).withdrawal.count({
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { status: "PENDING" },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).dispute.count({ where: { status: "OPEN" } }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.aggregate({
        where: {
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: { in: ["PAID", "COMPLETED"] },
          paidAt: { gte: today },
        },
        _sum: { amountMinor: true },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.aggregate({
        where: {
          status: { in: ["PAID", "COMPLETED"] },
        },
        _sum: { amountMinor: true },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          initiator: { select: { id: true, username: true, email: true } },
          counterparty: { select: { id: true, username: true, email: true } },
        },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        activeUsers,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalTransactions,
        activeTransactions,
        pendingWithdrawals,
        pendingDisputes,
        todayVolume: Number(todayVolume._sum?.amountMinor || 0n) / 100,
        totalVolume: Number(totalVolume._sum?.amountMinor || 0n) / 100,
      },
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentTransactions: recentTransactions.map((t: any) => ({
        id: t.id,
        orderNumber: t.orderNumber,
        title: t.title,
        amount: Number(t.amountMinor) / 100,
        status: t.status,
        initiator: t.initiator,
        counterparty: t.counterparty,
        createdAt: t.createdAt,
      })),
    };
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  @Get("users")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get all users" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "kycStatus", required: false })
  @ApiQuery({ name: "page", required: false })
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ApiQuery({ name: "limit", required: false })
  async getUsers(
    @Query("status") status?: string,
    @Query("kycStatus") kycStatus?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { deletedAt: null };

    if (status === "active") {
      where.suspendedAt = null;
    } else if (status === "suspended") {
      where.suspendedAt = { not: null };
    }

    if (kycStatus) {
      where.kycStatus = kycStatus.toUpperCase();
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          kycStatus: true,
          isAdmin: true,
          suspendedAt: true,
          suspendedUntil: true,
          suspendReason: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get("users/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get user details" })
  async getUser(@Param("id") id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        kycSubmissions: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  @Patch("users/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Update user details" })
  async updateUser(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.isAdmin !== undefined) updateData.isAdmin = dto.isAdmin;
    if (dto.kycStatus !== undefined) updateData.kycStatus = dto.kycStatus;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException("No valid fields provided for update");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    await this.createAuditLog(adminId, "UPDATE", "User", id, updateData);

    return updatedUser;
  }

  @Post("users/:id/suspend")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Suspend user" })
  async suspendUser(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
    @Body() dto: SuspendUserDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (id === adminId) {
      throw new ForbiddenException("Cannot suspend yourself");
    }

    if (user.isAdmin) {
      throw new ForbiddenException("Cannot suspend admin users");
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        suspendedAt: new Date(),
        suspendReason: dto.reason,
      },
    });

    await this.createAuditLog(adminId, "UPDATE", "User", id, {
      action: "SUSPENDED",
      reason: dto.reason,
    });

    this.logger.log(`User ${id} suspended by admin ${adminId}`);

    return { message: "User suspended successfully" };
  }

  @Post("users/:id/activate")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Activate suspended user" })
  async activateUser(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
  ) {
    await this.activateUserById(id, adminId, "ACTIVATED");
    return { message: "User activated successfully" };
  }

  @Post("users/:id/unsuspend")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Unsuspend user (alias of activate)" })
  async unsuspendUser(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
  ) {
    await this.activateUserById(id, adminId, "UNSUSPENDED");
    return { message: "User unsuspended successfully" };
  }

  @Post("users/:id/kyc/approve")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Approve user KYC" })
  async approveKYC(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.update({
      where: { id },
      data: { kycStatus: "VERIFIED" },
    });

    await this.createAuditLog(adminId, "UPDATE", "User", id, {
      action: "KYC_APPROVED",
    });

    this.logger.log(`KYC approved for user ${id} by admin ${adminId}`);

    return { message: "KYC approved successfully" };
  }

  @Post("users/:id/kyc/reject")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Reject user KYC" })
  async rejectKYC(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
    @Body() dto: AdminReasonDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        kycStatus: "REJECTED",
      },
    });

    // Store rejection reason in the latest KYC submission
    await this.prisma.kYCSubmission.updateMany({
      where: { userId: id },
      data: { rejectionReason: dto.reason },
    });

    await this.createAuditLog(adminId, "UPDATE", "User", id, {
      action: "KYC_REJECTED",
      reason: dto.reason,
    });

    this.logger.log(`KYC rejected for user ${id} by admin ${adminId}`);

    return { message: "KYC rejected" };
  }

  // ============================================================================
  // TRANSACTION MANAGEMENT
  // ============================================================================

  @Get("transactions")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get all transactions" })
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getTransactions(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) {
    const skip = (page - 1) * limit;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { deletedAt: null };

    if (status) {
      where.status = status.toUpperCase();
    }

    const [transactions, total] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.findMany({
        where,
        include: {
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          initiator: { select: { id: true, username: true, email: true } },
          counterparty: { select: { id: true, username: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.count({ where }),
    ]);

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: transactions.map((t: any) => ({
        id: t.id,
        orderNumber: t.orderNumber,
        title: t.title,
        description: t.description,
        amount: Number(t.amountMinor) / 100,
        status: t.status,
        initiator: t.initiator,
        counterparty: t.counterparty,
        createdAt: t.createdAt,
        paidAt: t.paidAt,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        completedAt: t.completedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get("transactions/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get transaction details" })
  async getTransaction(@Param("id") id: string) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transaction = await (this.prisma as any).order.findUnique({
      where: { id },
      include: {
        initiator: { select: { id: true, username: true, email: true } },
        counterparty: { select: { id: true, username: true, email: true } },
        escrowHold: true,
        dispute: true,
        ratings: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...transaction,
      amount: Number(transaction.amountMinor) / 100,
      platformFee: Number(transaction.platformFeeMinor) / 100,
    };
  }

  @Post("transactions/:id/force-complete")
  @Roles("ADMIN")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ApiOperation({ summary: "Force complete transaction" })
  async forceCompleteTransaction(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
    @Body() dto: AdminReasonDto,
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transaction = await (this.prisma as any).order.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.prisma as any).order.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        adminNotes: dto.reason,
      },
    });

    await this.createAuditLog(adminId, "UPDATE", "Order", id, {
      action: "FORCE_COMPLETED",
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      reason: dto.reason,
    });

    this.logger.log(`Transaction ${id} force completed by admin ${adminId}`);

    return { message: "Transaction force completed" };
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Post("transactions/:id/force-cancel")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Force cancel transaction" })
  async forceCancelTransaction(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
    @Body() dto: AdminReasonDto,
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transaction = await (this.prisma as any).order.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.prisma as any).order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    await this.createAuditLog(adminId, "UPDATE", "Order", id, {
      action: "FORCE_CANCELLED",
      reason: dto.reason,
    });

    this.logger.log(`Transaction ${id} force cancelled by admin ${adminId}`);

    return { message: "Transaction force cancelled" };
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // ============================================================================
  // DISPUTE MANAGEMENT
  // ============================================================================

  @Get("disputes")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get all disputes" })
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "priority", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getDisputes(
    @Query("status") status?: string,
    @Query("priority") priority?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status.toUpperCase();
    }
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any

    const [disputes, total] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).dispute.findMany({
        where,
        include: {
          order: {
            include: {
              initiator: { select: { id: true, username: true, email: true } },
              counterparty: {
                select: { id: true, username: true, email: true },
              },
            },
          },
          openedBy: { select: { id: true, username: true, email: true } },
        },
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderBy: { openedAt: "desc" },
        skip,
        take: limit,
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).dispute.count({ where }),
    ]);

    return {
      data: disputes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get("disputes/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get dispute details" })
  async getDispute(@Param("id") id: string) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispute = await (this.prisma as any).dispute.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            initiator: { select: { id: true, username: true, email: true } },
            // Eslint-disable-next-line @typescript-eslint/no-explicit-any
            counterparty: { select: { id: true, username: true, email: true } },
          },
        },
        openedBy: { select: { id: true, username: true, email: true } },
        evidences: true,
      },
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }

    return dispute;
  }

  @Post("disputes/:id/review")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Start reviewing dispute" })
  async startReview(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispute = await (this.prisma as any).dispute.findUnique({
      where: { id },
    });

    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.prisma as any).dispute.update({
      where: { id },
      data: {
        status: "UNDER_ARBITRATION",
        assignedTo: adminId,
      },
    });

    await this.createAuditLog(adminId, "UPDATE", "Dispute", id, {
      action: "REVIEW_STARTED",
    });

    return { message: "Dispute review started" };
  }

  @Post("disputes/:id/resolve")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Resolve dispute" })
  async resolveDispute(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
    @Body()
    dto: {
      winner?: "buyer" | "seller" | "split";
      resolution?: string;
      decision?: DisputeDecision;
      resolutionNotes?: string;
      buyerRefundMinor?: string;
      sellerAmountMinor?: string;
    },
  ) {
    const resolutionNotes = dto.resolutionNotes || dto.resolution;

    if (!resolutionNotes) {
      throw new BadRequestException("Resolution details required");
    }

    let decision = dto.decision;

    if (!decision) {
      if (dto.winner === "buyer") {
        decision = DisputeDecision.REFUND_ALL_TO_BUYER;
      } else if (dto.winner === "seller") {
        decision = DisputeDecision.RELEASE_ALL_TO_SELLER;
      } else {
        decision = DisputeDecision.SPLIT_SETTLEMENT;
      }
    }

    await this.disputeService.resolve(id, adminId, {
      decision,
      resolutionNotes,
      buyerRefundMinor: dto.buyerRefundMinor,
      sellerAmountMinor: dto.sellerAmountMinor,
    });

    await this.createAuditLog(adminId, "UPDATE", "Dispute", id, {
      action: "RESOLVED",
      decision,
      resolutionNotes,
    });

    this.logger.log(`Dispute ${id} resolved by admin ${adminId}`);

    return { message: "Dispute resolved successfully" };
  }

  @Post("disputes/:id/assign")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Assign arbitrator to dispute" })
  async assignArbitrator(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body("arbitratorId") arbitratorId: string,
  ) {
    if (!arbitratorId) {
      throw new BadRequestException("Arbitrator ID is required");
    }

    await this.disputeService.assignArbitrator(id, adminId, arbitratorId);

    await this.createAuditLog(adminId, "UPDATE", "Dispute", id, {
      action: "ARBITRATOR_ASSIGNED",
      arbitratorId,
    });

    return { message: "Arbitrator assigned successfully" };
  }

  // ============================================================================
  // WITHDRAWAL MANAGEMENT
  // ============================================================================

  @Get("withdrawals/pending")
  @Roles("ADMIN")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ApiOperation({ summary: "Get pending withdrawals" })
  async getPendingWithdrawals() {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withdrawals = await (this.prisma as any).withdrawal.findMany({
      where: { status: "PENDING" },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                kycStatus: true,
              },
            },
          },
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        },
        bankAccount: {
          select: { id: true, bankName: true, accountNumberLast4: true },
        },
      },
      orderBy: { requestedAt: "asc" },
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return withdrawals.map((w: any) => ({
      id: w.id,
      amount: Number(w.amountMinor) / 100,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      bankAccount: w.bankAccount,
      status: w.status,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: w.wallet.user,
      requestedAt: w.requestedAt,
    }));
  }

  @Post("withdrawals/:id/approve")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Approve withdrawal" })
  async approveWithdrawal(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withdrawal = await (this.prisma as any).withdrawal.findUnique({
      where: { id },
    });

    if (!withdrawal) {
      throw new NotFoundException("Withdrawal not found");
    }

    if (withdrawal.status !== "PENDING") {
      throw new BadRequestException("Withdrawal is not pending");
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.$transaction(async (tx: any) => {
      // Update withdrawal status
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any).withdrawal.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      });
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any

      // Deduct from wallet (locked amount)
      await tx.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          balanceMinor: { decrement: withdrawal.amountMinor },
          lockedMinor: { decrement: withdrawal.amountMinor },
        },
      });
    });

    await this.createAuditLog(adminId, "UPDATE", "Withdrawal", id, {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      action: "APPROVED",
      amount: withdrawal.amountMinor.toString(),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    });

    this.logger.log(`Withdrawal ${id} approved by admin ${adminId}`);

    return { message: "Withdrawal approved" };
  }

  @Post("withdrawals/:id/reject")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Reject withdrawal" })
  async rejectWithdrawal(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
    @Body() dto: AdminReasonDto,
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withdrawal = await (this.prisma as any).withdrawal.findUnique({
      where: { id },
    });

    if (!withdrawal) {
      throw new NotFoundException("Withdrawal not found");
    }

    if (withdrawal.status !== "PENDING") {
      throw new BadRequestException("Withdrawal is not pending");
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.$transaction(async (tx: any) => {
      // Update withdrawal status
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any).withdrawal.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: dto.reason,
        },
      });

      // Unlock the amount
      await tx.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          lockedMinor: { decrement: withdrawal.amountMinor },
        },
      });
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    });

    await this.createAuditLog(adminId, "UPDATE", "Withdrawal", id, {
      action: "REJECTED",
      reason: dto.reason,
    });

    this.logger.log(`Withdrawal ${id} rejected by admin ${adminId}`);

    return { message: "Withdrawal rejected" };
  }

  // ============================================================================
  // WALLET MANAGEMENT (Admin Balance Adjustment & Freeze)
  // ============================================================================

  @Get("wallets")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get all wallets with user info" })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by status: active, frozen",
  })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getWallets(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skip = (page - 1) * limit;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { deletedAt: null };

    if (status === "frozen") {
      where.isFrozen = true;
    } else if (status === "active") {
      where.isFrozen = false;
    }

    const [wallets, total] = await Promise.all([
      this.prisma.wallet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              phone: true,
              kycStatus: true,
              suspendedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.wallet.count({ where }),
    ]);

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: wallets.map((w: any) => ({
        id: w.id,
        userId: w.userId,
        balance: Number(w.balanceMinor) / 100,
        locked: Number(w.lockedMinor) / 100,
        frozen: Number(w.frozenMinor || 0n) / 100,
        available:
          Number(w.balanceMinor - w.lockedMinor - (w.frozenMinor || 0n)) / 100,
        currency: w.currency,
        isFrozen: w.isFrozen || false,
        frozenAt: w.frozenAt,
        frozenReason: w.frozenReason,
        user: w.user,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    };
  }

  @Get("wallets/:userId")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get wallet details by user ID" })
  async getWalletByUserId(@Param("userId") userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            // Eslint-disable-next-line @typescript-eslint/no-explicit-any
            id: true,
            username: true,
            email: true,
            phone: true,
            kycStatus: true,
            // Eslint-disable-next-line @typescript-eslint/no-explicit-any
            suspendedAt: true,
          },
        },
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      },
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    });
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any

    if (!wallet) {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new NotFoundException("Wallet not found for this user");
    }

    // Get recent transactions (deposits & withdrawals)
    const [deposits, withdrawals] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).deposit.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).withdrawal.findMany({
        where: { walletId: wallet.id },
        orderBy: { requestedAt: "desc" },
        take: 10,
      }),
    ]);

    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: Number(wallet.balanceMinor) / 100,
      locked: Number(wallet.lockedMinor) / 100,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      frozen: Number((wallet as any).frozenMinor || 0n) / 100,
      available:
        Number(
          wallet.balanceMinor -
            wallet.lockedMinor -
            // Eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((wallet as any).frozenMinor || 0n),
        ) / 100,
      currency: wallet.currency,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      isFrozen: (wallet as any).isFrozen || false,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      frozenAt: (wallet as any).frozenAt,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      frozenReason: (wallet as any).frozenReason,
      user: wallet.user,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentDeposits: deposits.map((d: any) => ({
        id: d.id,
        amount: Number(d.amountMinor) / 100,
        status: d.status,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAt: d.createdAt,
      })),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentWithdrawals: withdrawals.map((w: any) => ({
        id: w.id,
        amount: Number(w.amountMinor) / 100,
        status: w.status,
        requestedAt: w.requestedAt,
      })),
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  @Post("wallets/:userId/adjust")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Adjust user wallet balance (credit/debit)" })
  async adjustWalletBalance(
    @Param("userId") userId: string,
    @CurrentUser("id") adminId: string,
    @Body() dto: AdminAdjustBalanceDto,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) {
    // Validate user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Get or create wallet
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      // Create wallet if not exists
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          currency: "IDR",
          balanceMinor: 0n,
          lockedMinor: 0n,
        },
      });
    }

    if ((wallet as any).isFrozen) {
      throw new BadRequestException("Cannot adjust balance on a frozen wallet");
    }

    const amountMinor = BigInt(Math.round(dto.amount * 100));
    const isCredit = dto.type === AdminWalletAdjustmentType.CREDIT;

    // For debit, check sufficient balance
    if (!isCredit) {
      const availableBalance =
        wallet.balanceMinor -
        wallet.lockedMinor -
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((wallet as any).frozenMinor || 0n);
      if (availableBalance < amountMinor) {
        throw new BadRequestException(
          `Insufficient balance. Available: Rp ${Number(availableBalance) / 100}, Requested: Rp ${dto.amount}`,
        );
      }
    }

    // Perform the adjustment in a transaction
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.prisma.$transaction(async (tx: any) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          balanceMinor: isCredit
            ? { increment: amountMinor }
            : { decrement: amountMinor },
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          version: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      // Create ledger journal entry
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      const journal = await (tx as any).ledgerJournal.create({
        data: {
          type: isCredit ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
          currency: "IDR",
          amountMinor,
          description: `Admin ${isCredit ? "credit" : "debit"}: ${dto.reason}`,
          idempotencyKey: `ADMIN_ADJ_${userId}_${Date.now()}`,
        },
      });

      return { wallet: updatedWallet, journal };
    });

    // Create audit log
    await this.createAuditLog(adminId, "UPDATE", "Wallet", wallet.id, {
      action: isCredit ? "BALANCE_CREDITED" : "BALANCE_DEBITED",
      amount: dto.amount,
      amountMinor: amountMinor.toString(),
      reason: dto.reason,
      referenceId: dto.referenceId,
      previousBalance: Number(wallet.balanceMinor) / 100,
      newBalance: Number(result.wallet.balanceMinor) / 100,
    });

    this.logger.log(
      `Wallet ${wallet.id} ${isCredit ? "credited" : "debited"} Rp ${dto.amount} by admin ${adminId}. Reason: ${dto.reason}`,
    );

    return {
      message: `Balance ${isCredit ? "credited" : "debited"} successfully`,
      wallet: {
        id: result.wallet.id,
        userId: result.wallet.userId,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        previousBalance: Number(wallet.balanceMinor) / 100,
        adjustedAmount: isCredit ? dto.amount : -dto.amount,
        newBalance: Number(result.wallet.balanceMinor) / 100,
        available:
          Number(
            result.wallet.balanceMinor -
              result.wallet.lockedMinor -
              // Eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((result.wallet as any).frozenMinor || 0n),
          ) / 100,
      },
      adjustment: {
        type: dto.type,
        amount: dto.amount,
        reason: dto.reason,
        referenceId: dto.referenceId,
        performedBy: adminId,
        performedAt: new Date(),
      },
    };
  }
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any

  @Post("wallets/:userId/freeze")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Freeze user wallet balance" })
  async freezeWallet(
    @Param("userId") userId: string,
    @CurrentUser("id") adminId: string,
    @Body() dto: AdminFreezeWalletDto,
  ) {
    // Validate user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Cannot freeze admin wallet
    if (user.isAdmin) {
      throw new ForbiddenException("Cannot freeze admin wallet");
    }

    // Get wallet
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw new NotFoundException("Wallet not found for this user");
    }

    // Check if already frozen
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((wallet as any).isFrozen) {
      throw new BadRequestException("Wallet is already frozen");
    }

    // Calculate amount to freeze
    const availableBalance = wallet.balanceMinor - wallet.lockedMinor;
    let freezeAmountMinor: bigint;

    if (dto.amount) {
      freezeAmountMinor = BigInt(Math.round(dto.amount * 100));
      if (freezeAmountMinor > availableBalance) {
        throw new BadRequestException(
          `Cannot freeze Rp ${dto.amount}. Available balance: Rp ${Number(availableBalance) / 100}`,
        );
      }
    } else {
      // Freeze entire available balance
      freezeAmountMinor = BigInt(availableBalance);
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    }

    // Perform freeze in transaction
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.prisma.$transaction(async (tx: any) => {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          frozenMinor: freezeAmountMinor,
          isFrozen: true,
          frozenAt: new Date(),
          frozenReason: dto.reason,
          frozenByUserId: adminId,
          version: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      // Create ledger journal entry
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any).ledgerJournal.create({
        data: {
          type: "ADMIN_FREEZE",
          currency: "IDR",
          amountMinor: freezeAmountMinor,
          description: `Wallet frozen: ${dto.reason}`,
          idempotencyKey: `ADMIN_FREEZE_${userId}_${Date.now()}`,
        },
      });

      return updatedWallet;
    });

    // Create audit log
    await this.createAuditLog(adminId, "UPDATE", "Wallet", wallet.id, {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      action: "WALLET_FROZEN",
      frozenAmount: Number(freezeAmountMinor) / 100,
      reason: dto.reason,
    });
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any

    this.logger.log(
      `Wallet ${wallet.id} frozen (Rp ${Number(freezeAmountMinor) / 100}) by admin ${adminId}. Reason: ${dto.reason}`,
    );

    return {
      message: "Wallet frozen successfully",
      wallet: {
        id: result.id,
        userId: result.userId,
        balance: Number(result.balanceMinor) / 100,
        locked: Number(result.lockedMinor) / 100,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        frozen: Number((result as any).frozenMinor) / 100,
        available:
          Number(
            result.balanceMinor -
              result.lockedMinor -
              // Eslint-disable-next-line @typescript-eslint/no-explicit-any
              (result as any).frozenMinor,
          ) / 100,
        isFrozen: true,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        frozenAt: (result as any).frozenAt,
        frozenReason: dto.reason,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      },
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    };
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Post("wallets/:userId/unfreeze")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Unfreeze user wallet balance" })
  async unfreezeWallet(
    @Param("userId") userId: string,
    @CurrentUser("id") adminId: string,
    @Body() dto: AdminUnfreezeWalletDto,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) {
    // Validate user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Get wallet
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw new NotFoundException("Wallet not found for this user");
    }

    // Check if frozen
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(wallet as any).isFrozen) {
      throw new BadRequestException("Wallet is not frozen");
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentFrozen = (wallet as any).frozenMinor || 0n;
    let unfreezeAmountMinor: bigint;

    if (dto.amount) {
      unfreezeAmountMinor = BigInt(Math.round(dto.amount * 100));
      if (unfreezeAmountMinor > currentFrozen) {
        throw new BadRequestException(
          `Cannot unfreeze Rp ${dto.amount}. Currently frozen: Rp ${Number(currentFrozen) / 100}`,
        );
      }
    } else {
      // Unfreeze entire frozen balance
      unfreezeAmountMinor = currentFrozen;
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const remainingFrozen = currentFrozen - unfreezeAmountMinor;
    const isFullyUnfrozen = remainingFrozen === 0n;

    // Perform unfreeze in transaction
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.prisma.$transaction(async (tx: any) => {
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          frozenMinor: remainingFrozen,
          isFrozen: !isFullyUnfrozen,
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          frozenAt: isFullyUnfrozen ? null : (wallet as any).frozenAt,
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          frozenReason: isFullyUnfrozen ? null : (wallet as any).frozenReason,
          frozenByUserId: isFullyUnfrozen
            ? null
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (wallet as any).frozenByUserId,
          version: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      // Create ledger journal entry
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any).ledgerJournal.create({
        data: {
          type: "ADMIN_UNFREEZE",
          currency: "IDR",
          amountMinor: unfreezeAmountMinor,
          description: `Wallet unfrozen: ${dto.reason}`,
          idempotencyKey: `ADMIN_UNFREEZE_${userId}_${Date.now()}`,
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        },
      });

      return updatedWallet;
    });

    // Create audit log
    await this.createAuditLog(adminId, "UPDATE", "Wallet", wallet.id, {
      action: "WALLET_UNFROZEN",
      unfrozenAmount: Number(unfreezeAmountMinor) / 100,
      remainingFrozen: Number(remainingFrozen) / 100,
      isFullyUnfrozen,
      reason: dto.reason,
    });

    this.logger.log(
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      `Wallet ${wallet.id} unfrozen (Rp ${Number(unfreezeAmountMinor) / 100}) by admin ${adminId}. Reason: ${dto.reason}`,
    );

    return {
      message: isFullyUnfrozen
        ? "Wallet fully unfrozen"
        : "Partial unfreeze successful",
      wallet: {
        id: result.id,
        userId: result.userId,
        balance: Number(result.balanceMinor) / 100,
        locked: Number(result.lockedMinor) / 100,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        frozen: Number((result as any).frozenMinor) / 100,
        available:
          Number(
            // Eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.balanceMinor -
              result.lockedMinor -
              // Eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((result as any).frozenMinor || 0n),
          ) / 100,
        isFrozen: !isFullyUnfrozen,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        frozenAt: (result as any).frozenAt,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        frozenReason: (result as any).frozenReason,
      },
    };
  }

  @Get("wallets/:userId/adjustments")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get wallet adjustment history" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getWalletAdjustments(
    @Param("userId") userId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw new NotFoundException("Wallet not found for this user");
    }

    const skip = (page - 1) * limit;

    // Get admin adjustment journals
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [journals, total] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).ledgerJournal.findMany({
        where: {
          type: {
            // Eslint-disable-next-line @typescript-eslint/no-explicit-any
            in: [
              "ADMIN_CREDIT",
              "ADMIN_DEBIT",
              "ADMIN_FREEZE",
              "ADMIN_UNFREEZE",
            ],
          },
          idempotencyKey: { contains: userId },
        },
        orderBy: { createdAt: "desc" },
        skip,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        take: limit,
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).ledgerJournal.count({
        where: {
          type: {
            in: [
              "ADMIN_CREDIT",
              "ADMIN_DEBIT",
              "ADMIN_FREEZE",
              "ADMIN_UNFREEZE",
            ],
          },
          idempotencyKey: { contains: userId },
        },
      }),
    ]);

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: journals.map((j: any) => ({
        id: j.id,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: j.type,
        amount: Number(j.amountMinor) / 100,
        description: j.description,
        createdAt: j.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any

  // ============================================================================
  // AUDIT LOGS
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // ============================================================================

  @Get("audit-logs")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get audit logs" })
  @ApiQuery({ name: "action", required: false })
  @ApiQuery({ name: "actorType", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getAuditLogs(
    @Query("action") action?: string,
    @Query("actorType") actorType?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 50,
  ) {
    const skip = (page - 1) * limit;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, unknown> = {};

    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        take: limit,
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================================
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // SETTINGS
  // ============================================================================

  @Get("settings")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get system settings" })
  async getSettings() {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = await (this.prisma as any).systemConfig.findMany();

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return settings.reduce((acc: any, s: any) => {
      acc[s.key] = s.value;
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      return acc;
    }, {});
  }

  @Patch("settings")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Update system settings" })
  async updateSettings(
    @CurrentUser("id") adminId: string,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() dto: Record<string, any>,
  ) {
    for (const [key, value] of Object.entries(dto)) {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.prisma as any).systemConfig.upsert({
        where: { key },
        update: { value: JSON.stringify(value), updatedAt: new Date() },
        create: { key, value: JSON.stringify(value) },
      });
    }

    await this.createAuditLog(adminId, "UPDATE", "SystemConfig", "settings", {
      updatedKeys: Object.keys(dto),
    });

    return { message: "Settings updated successfully" };
  }

  // ============================================================================
  // REPORTS
  // ============================================================================

  @Get("reports/revenue")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get revenue report" })
  @ApiQuery({ name: "startDate", required: false })
  @ApiQuery({ name: "endDate", required: false })
  async getRevenueReport(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedOrders = await (this.prisma as any).order.findMany({
      where: {
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: "COMPLETED",
        completedAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        amountMinor: true,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        platformFeeMinor: true,
        completedAt: true,
      },
    });

    const totalRevenue = completedOrders.reduce(
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: bigint, o: any) => sum + (o.platformFeeMinor || 0n),
      0n,
    );
    const totalVolume = completedOrders.reduce(
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: bigint, o: any) => sum + (o.amountMinor || 0n),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      0n,
    );

    // Group by date for chart data
    const dailyRevenue: Record<
      string,
      { revenue: number; volume: number; count: number }
    > = {};
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    completedOrders.forEach((order: any) => {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      const date = order.completedAt.toISOString().split("T")[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = { revenue: 0, volume: 0, count: 0 };
      }
      dailyRevenue[date].revenue += Number(order.platformFeeMinor || 0n) / 100;
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      dailyRevenue[date].volume += Number(order.amountMinor || 0n) / 100;
      dailyRevenue[date].count += 1;
    });

    return {
      summary: {
        totalRevenue: Number(totalRevenue) / 100,
        totalVolume: Number(totalVolume) / 100,
        totalTransactions: completedOrders.length,
        period: { start, end },
      },
      dailyData: Object.entries(dailyRevenue)
        .map(([date, data]) => ({
          date,
          ...data,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  @Get("reports/transactions")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get transactions report" })
  @ApiQuery({ name: "startDate", required: false })
  @ApiQuery({ name: "endDate", required: false })
  async getTransactionReport(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [statusCounts, categoryCounts, dailyCounts] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.groupBy({
        by: ["status"],
        where: {
          createdAt: { gte: start, lte: end },
        },
        _count: { id: true },
        _sum: { amountMinor: true },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.groupBy({
        by: ["category"],
        where: {
          createdAt: { gte: start, lte: end },
        },
        _count: { id: true },
        _sum: { amountMinor: true },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.findMany({
        where: {
          createdAt: { gte: start, lte: end },
        },
        select: {
          createdAt: true,
          status: true,
        },
      }),
    ]);

    // Group daily counts
    const dailyData: Record<string, Record<string, number>> = {};
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    dailyCounts.forEach((order: any) => {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      const date = order.createdAt.toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { total: 0 };
      }
      dailyData[date].total += 1;
      dailyData[date][order.status] = (dailyData[date][order.status] || 0) + 1;
    });

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      byStatus: statusCounts.map((s: any) => ({
        status: s.status,
        count: s._count.id,
        volume: Number(s._sum.amountMinor || 0n) / 100,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      })),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      byCategory: categoryCounts.map((c: any) => ({
        category: c.category,
        count: c._count.id,
        volume: Number(c._sum.amountMinor || 0n) / 100,
      })),
      dailyData: Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          ...data,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      period: { start, end },
    };
  }

  @Get("reports/users")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get users report" })
  @ApiQuery({ name: "startDate", required: false })
  @ApiQuery({ name: "endDate", required: false })
  async getUserReport(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any

    const [totalUsers, newUsers, verifiedUsers, kycStats, activeUsers] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.user.count({
          where: {
            createdAt: { gte: start, lte: end },
            // Eslint-disable-next-line @typescript-eslint/no-explicit-any
            deletedAt: null,
          },
        }),
        this.prisma.user.count({
          where: {
            emailVerifiedAt: { not: null },
            deletedAt: null,
          },
        }),
        this.prisma.user.groupBy({
          by: ["kycStatus"],
          where: { deletedAt: null },
          _count: { id: true },
        }),
        this.prisma.user.count({
          where: {
            // Eslint-disable-next-line @typescript-eslint/no-explicit-any
            lastLoginAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
            deletedAt: null,
            // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          },
        }),
      ]);

    // Get daily registrations
    const dailyRegistrations = await this.prisma.user.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        deletedAt: null,
      },
      select: { createdAt: true },
    });

    const dailyData: Record<string, number> = {};
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    dailyRegistrations.forEach((user: any) => {
      const date = user.createdAt.toISOString().split("T")[0];
      dailyData[date] = (dailyData[date] || 0) + 1;
    });

    return {
      summary: {
        totalUsers,
        newUsers,
        verifiedUsers,
        activeUsers,
        verificationRate:
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0,
      },
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      kycBreakdown: kycStats.map((k: any) => ({
        status: k.kycStatus,
        count: k._count.id,
      })),
      dailyRegistrations: Object.entries(dailyData)
        .map(([date, count]) => ({
          date,
          count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      period: { start, end },
    };
  }

  // ============================================================================
  // DEPOSITS MANAGEMENT
  // ============================================================================

  @Get("deposits")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get all deposits" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getDeposits(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    const [deposits, total] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).deposit.findMany({
        where,
        include: {
          wallet: {
            include: {
              user: {
                select: { id: true, username: true, email: true },
              },
            },
          },
          payment: true,
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        },
        orderBy: { createdAt: "desc" },
        skip,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        take: limit,
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).deposit.count({ where }),
    ]);

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: deposits.map((d: any) => ({
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: d.id,
        amount: Number(d.amountMinor) / 100,
        method:
          d.payment?.paymentMethod ||
          d.payment?.paymentDetails?.method ||
          "VIRTUAL_ACCOUNT",
        status: d.status,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        reference:
          d.payment?.providerInvoiceId ||
          d.payment?.paymentDetails?.externalId ||
          d.paymentId,
        user: d.wallet?.user,
        createdAt: d.createdAt,
        completedAt: d.completedAt ?? d.payment?.paidAt ?? null,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any

  @Get("deposits/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get deposit details" })
  async getDeposit(@Param("id") id: string) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deposit = await (this.prisma as any).deposit.findUnique({
      where: { id },
      include: {
        wallet: {
          include: {
            user: {
              select: { id: true, username: true, email: true, phone: true },
            },
          },
        },
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      },
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!deposit) {
      throw new NotFoundException("Deposit not found");
    }

    return {
      ...deposit,
      amount: Number(deposit.amountMinor) / 100,
    };
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  @Get("analytics/overview")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get analytics overview" })
  async getAnalyticsOverview() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      todayTransactions,
      weekTransactions,
      monthTransactions,
      lastMonthTransactions,
      todayVolume,
      weekVolume,
      monthVolume,
      lastMonthVolume,
      todayUsers,
      weekUsers,
      monthUsers,
      todayDisputes,
      pendingWithdrawals,
      pendingKYC,
    ] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.count({
        where: { createdAt: { gte: today } },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.count({
        where: { createdAt: { gte: thisWeek } },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.count({
        where: { createdAt: { gte: thisMonth } },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.count({
        where: { createdAt: { gte: lastMonth, lt: thisMonth } },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.aggregate({
        where: {
          status: { in: ["PAID", "COMPLETED"] },
          paidAt: { gte: today },
        },
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        _sum: { amountMinor: true },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.aggregate({
        where: {
          status: { in: ["PAID", "COMPLETED"] },
          paidAt: { gte: thisWeek },
        },
        _sum: { amountMinor: true },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.aggregate({
        where: {
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: { in: ["PAID", "COMPLETED"] },
          paidAt: { gte: thisMonth },
        },
        _sum: { amountMinor: true },
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.aggregate({
        where: {
          status: { in: ["PAID", "COMPLETED"] },
          paidAt: { gte: lastMonth, lt: thisMonth },
        },
        _sum: { amountMinor: true },
      }),
      this.prisma.user.count({
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { createdAt: { gte: today }, deletedAt: null },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: thisWeek }, deletedAt: null },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: thisMonth }, deletedAt: null },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).dispute.count({
        where: { openedAt: { gte: today } },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).withdrawal.count({ where: { status: "PENDING" } }),
      this.prisma.user.count({ where: { kycStatus: "PENDING" } }),
    ]);

    const monthVolumeNum = Number(monthVolume._sum?.amountMinor || 0n) / 100;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastMonthVolumeNum =
      Number(lastMonthVolume._sum?.amountMinor || 0n) / 100;
    const volumeChange =
      lastMonthVolumeNum > 0
        ? (
            ((monthVolumeNum - lastMonthVolumeNum) / lastMonthVolumeNum) *
            100
          ).toFixed(1)
        : 0;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const txChange =
      lastMonthTransactions > 0
        ? (
            ((monthTransactions - lastMonthTransactions) /
              lastMonthTransactions) *
            100
          ).toFixed(1)
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          0;

    return {
      transactions: {
        today: todayTransactions,
        week: weekTransactions,
        month: monthTransactions,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        change: txChange,
      },
      volume: {
        today: Number(todayVolume._sum?.amountMinor || 0n) / 100,
        week: Number(weekVolume._sum?.amountMinor || 0n) / 100,
        month: monthVolumeNum,
        change: volumeChange,
      },
      users: {
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        today: todayUsers,
        week: weekUsers,
        month: monthUsers,
      },
      alerts: {
        disputes: todayDisputes,
        pendingWithdrawals,
        pendingKYC,
      },
    };
  }

  @Get("analytics/charts")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get chart data for analytics" })
  @ApiQuery({ name: "period", required: false })
  async getAnalyticsCharts(@Query("period") period: string = "30d") {
    let days = 30;
    if (period === "7d") days = 7;
    else if (period === "90d") days = 90;
    else if (period === "365d") days = 365;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [orders, users, deposits, withdrawals] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          createdAt: true,
          amountMinor: true,
          platformFeeMinor: true,
          status: true,
        },
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: startDate }, deletedAt: null },
        select: { createdAt: true },
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).deposit.findMany({
        where: { createdAt: { gte: startDate }, status: "COMPLETED" },
        select: { createdAt: true, amountMinor: true },
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).withdrawal.findMany({
        where: {
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          requestedAt: { gte: startDate },
          status: { in: ["COMPLETED", "APPROVED"] },
        },
        select: { requestedAt: true, amountMinor: true },
      }),
    ]);

    // Group by date
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dailyData: Record<string, any> = {};

    // Initialize all dates
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      dailyData[date] = {
        date,
        transactions: 0,
        volume: 0,
        revenue: 0,
        users: 0,
        deposits: 0,
        withdrawals: 0,
      };
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    orders.forEach((o: any) => {
      const date = o.createdAt.toISOString().split("T")[0];
      if (dailyData[date]) {
        dailyData[date].transactions += 1;
        dailyData[date].volume += Number(o.amountMinor || 0n) / 100;
        dailyData[date].revenue += Number(o.platformFeeMinor || 0n) / 100;
      }
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    users.forEach((u: any) => {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      const date = u.createdAt.toISOString().split("T")[0];
      if (dailyData[date]) {
        dailyData[date].users += 1;
      }
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    deposits.forEach((d: any) => {
      const date = d.createdAt.toISOString().split("T")[0];
      if (dailyData[date]) {
        dailyData[date].deposits += Number(d.amountMinor || 0n) / 100;
      }
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    withdrawals.forEach((w: any) => {
      const date = w.requestedAt.toISOString().split("T")[0];
      if (dailyData[date]) {
        dailyData[date].withdrawals += Number(w.amountMinor || 0n) / 100;
      }
    });

    return {
      period,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: Object.values(dailyData).sort((a: any, b: any) =>
        a.date.localeCompare(b.date),
      ),
    };
  }

  @Get("analytics")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get analytics overview and charts" })
  @ApiQuery({ name: "period", required: false })
  async getAnalytics(@Query("period") period: string = "30d") {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [overview, charts] = await Promise.all([
      this.getAnalyticsOverview(),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.getAnalyticsCharts(period),
    ]);

    return {
      overview,
      charts,
    };
  }
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any

  // ============================================================================
  // PROMO MANAGEMENT
  // ============================================================================

  @Get("promos")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get all promos" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getPromos(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [promos, total] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).promoCode.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).promoCode.count(),
    ]);

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: promos.map((p: any) => ({
        ...p,
        discountAmount: p.discountAmountMinor
          ? Number(p.discountAmountMinor) / 100
          : null,
        minOrderAmount: p.minOrderAmountMinor
          ? Number(p.minOrderAmountMinor) / 100
          : null,
        maxDiscountAmount: p.maxDiscountAmountMinor
          ? Number(p.maxDiscountAmountMinor) / 100
          : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Post("promos")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Create promo code" })
  async createPromo(
    @CurrentUser("id") adminId: string,
    @Body()
    dto: {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: string;
      description?: string;
      discountType: "PERCENTAGE" | "FIXED";
      discountValue: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      maxUsage?: number;
      maxUsagePerUser?: number;
      validFrom?: string;
      validUntil?: string;
      isActive?: boolean;
    },
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promo = await (this.prisma as any).promoCode.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description,
        discountType: dto.discountType,
        discountPercentage:
          dto.discountType === "PERCENTAGE" ? dto.discountValue : null,
        discountAmountMinor:
          dto.discountType === "FIXED" ? BigInt(dto.discountValue * 100) : null,
        minOrderAmountMinor: dto.minOrderAmount
          ? BigInt(dto.minOrderAmount * 100)
          : null,
        maxDiscountAmountMinor: dto.maxDiscountAmount
          ? BigInt(dto.maxDiscountAmount * 100)
          : null,
        maxUsage: dto.maxUsage,
        maxUsagePerUser: dto.maxUsagePerUser || 1,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : new Date(),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        isActive: dto.isActive ?? true,
      },
    });

    await this.createAuditLog(adminId, "CREATE", "PromoCode", promo.id, {
      code: dto.code,
    });

    return promo;
  }

  @Patch("promos/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Update promo code" })
  async updatePromo(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() dto: any,
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, unknown> = {};

    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.maxUsage !== undefined) updateData.maxUsage = dto.maxUsage;
    if (dto.validUntil !== undefined)
      updateData.validUntil = dto.validUntil ? new Date(dto.validUntil) : null;

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promo = await (this.prisma as any).promoCode.update({
      where: { id },
      data: updateData,
    });

    await this.createAuditLog(adminId, "UPDATE", "PromoCode", id, dto);

    return promo;
  }

  @Post("promos/:id/deactivate")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Deactivate promo code" })
  async deactivatePromo(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.prisma as any).promoCode.update({
      where: { id },
      data: { isActive: false },
    });

    await this.createAuditLog(adminId, "UPDATE", "PromoCode", id, {
      action: "DEACTIVATED",
    });

    return { message: "Promo deactivated" };
  }

  @Delete("promos/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Deactivate promo code (alias for delete)" })
  async deletePromo(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
  ) {
    return this.deactivatePromo(id, adminId);
  }

  // ============================================================================
  // KYC MANAGEMENT
  // ============================================================================

  @Get("kyc")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get KYC submissions" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getKYCSubmissions(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    const [submissions, total] = await Promise.all([
      this.prisma.kYCSubmission.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, email: true, kycStatus: true },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.kYCSubmission.count({ where }),
    ]);

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      data: submissions,
      total,
      page,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get("kyc/submissions")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get KYC submissions (alias)" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getKYCSubmissionsAlias(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    return this.getKYCSubmissions(status, page, limit);
  }

  private async activateUserById(
    id: string,
    adminId: string,
    action: "ACTIVATED" | "UNSUSPENDED",
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any

    await this.prisma.user.update({
      where: { id },
      data: {
        suspendedAt: null,
        suspendedUntil: null,
        suspendReason: null,
      },
    });

    await this.createAuditLog(adminId, "UPDATE", "User", id, {
      action,
    });

    this.logger.log(`User ${id} ${action.toLowerCase()} by admin ${adminId}`);
  }

  @Get("kyc/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get KYC submission details" })
  async getKYCSubmission(@Param("id") id: string) {
    const submission = await this.prisma.kYCSubmission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            kycStatus: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException("KYC submission not found");
    }

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return submission;
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // ============================================================================
  // WITHDRAWALS - Extended
  // ============================================================================

  @Get("withdrawals")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get all withdrawals" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getWithdrawals(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    const [withdrawals, total] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).withdrawal.findMany({
        where,
        include: {
          wallet: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  kycStatus: true,
                },
              },
            },
          },
          bankAccount: true,
        },
        orderBy: { requestedAt: "desc" },
        skip,
        take: limit,
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).withdrawal.count({ where }),
    ]);

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: withdrawals.map((w: any) => ({
        id: w.id,
        amount: Number(w.amountMinor) / 100,
        fee: Number(w.feeMinor || 0n) / 100,
        netAmount: Number(w.amountMinor - (w.feeMinor || 0n)) / 100,
        status: w.status,
        bankAccount: w.bankAccount
          ? {
              id: w.bankAccount.id,
              bankName: w.bankAccount.bankName,
              accountNumberLast4: w.bankAccount.accountNumberLast4,
            }
          : null,
        user: w.wallet?.user,
        createdAt: w.requestedAt,
        processedAt: w.processedAt,
        rejectionReason: w.rejectionReason,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get("withdrawals/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get withdrawal details" })
  async getWithdrawal(@Param("id") id: string) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withdrawal = await (this.prisma as any).withdrawal.findUnique({
      where: { id },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                kycStatus: true,
              },
            },
          },
        },
        bankAccount: true,
      },
    });

    if (!withdrawal) {
      throw new NotFoundException("Withdrawal not found");
    }

    return {
      ...withdrawal,
      amount: Number(withdrawal.amountMinor) / 100,
      fee: Number(withdrawal.feeMinor || 0n) / 100,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async createAuditLog(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    details: any,
  ) {
    try {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.prisma as any).auditLog.create({
        data: {
          performedBy: userId,
          action,
          entityType,
          entityId,
          details,
        },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create audit log: ${(error as Error).message}`,
      );
    }
  }
}
