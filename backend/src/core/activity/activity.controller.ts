import { Controller, Get, Query, UseGuards, Logger } from "@nestjs/common";

import {
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { PrismaService } from "@infrastructure/database/prisma.service";
import { sanitizePagination } from "@common/pipes/pagination.pipe";

  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";

// ============================================================================
// ACTIVITY CONTROLLER - Production Ready
// Implements: Activity Logging, History Retrieval, Filtering
// ============================================================================

@ApiTags("activity")
@Controller("activity")
export class ActivityController {
  private readonly logger = new Logger(ActivityController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check" })
  health() {
    return { status: "ok" };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get user activity log" })
  @ApiQuery({
    name: "type",
    required: false,
    description: "Filter by activity type",
  })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({
    name: "from",
    required: false,
    description: "Start date (ISO format)",
  })
  @ApiQuery({
    name: "to",
    required: false,
    description: "End date (ISO format)",
  })
  @ApiResponse({ status: 200, description: "Returns user activity log" })
  async getActivityLog(
    @CurrentUser("id") userId: string,
    @Query("type") type?: string,
    @Query("page") rawPage?: number,
    @Query("limit") rawLimit?: number,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const { page, limit, skip } = sanitizePagination(rawPage, rawLimit, {
      maxLimit: 100,
    });
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };

    if (type) {
      where.activityType = type.toUpperCase();
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [activities, total] = await Promise.all([
      this.prisma.userActivity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.userActivity.count({ where }),
    ]);

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: activities.map((a: any) => ({
        id: a.id,
        type: a.activityType,
        description: a.description,
        metadata: a.metadata,
        ipAddress: a.ipAddress ? this.maskIpAddress(a.ipAddress) : null,
        userAgent: a.userAgent,
        country: a.country,
        city: a.city,
        createdAt: a.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get("summary")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get activity summary" })
  @ApiResponse({ status: 200, description: "Returns activity summary" })
  async getActivitySummary(@CurrentUser("id") userId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalActivities, recentActivities, activityByType] =
      await Promise.all([
        this.prisma.userActivity.count({ where: { userId } }),
        this.prisma.userActivity.count({
          where: { userId, createdAt: { gte: thirtyDaysAgo } },
        }),
        this.prisma.userActivity.groupBy({
          by: ["activityType"],
          where: { userId },
          _count: true,
        }),
      ]);

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalActivities,
      recentActivities,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      activityByType: activityByType.map((a: any) => ({
        type: a.activityType,
        count: a._count,
      })),
    };
  }

  @Get("transactions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get transaction history" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiResponse({ status: 200, description: "Returns transaction history" })
  async getTransactionHistory(
    @CurrentUser("id") userId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Query("status") status?: string,
  ) {
    const skip = (page - 1) * limit;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      OR: [{ initiatorId: userId }, { counterpartyId: userId }],
      deletedAt: null,
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          title: true,
          status: true,
          amountMinor: true,
          platformFeeMinor: true,
          initiatorRole: true,
          initiatorId: true,
          counterpartyId: true,
          createdAt: true,
          paidAt: true,
          completedAt: true,
          initiator: { select: { id: true, username: true } },
          counterparty: { select: { id: true, username: true } },
        },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.prisma.order.count({ where }),
    ]);

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: orders.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        title: o.title,
        status: o.status,
        amount: Number(o.amountMinor) / 100,
        fee: Number(o.platformFeeMinor) / 100,
        role:
          o.initiatorId === userId
            ? o.initiatorRole
            : o.initiatorRole === "BUYER"
              ? "SELLER"
              : "BUYER",
        counterparty:
          o.initiatorId === userId
            ? o.counterparty?.username
            : o.initiator.username,
        createdAt: o.createdAt,
        paidAt: o.paidAt,
        completedAt: o.completedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get("wallet")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get wallet activity history" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({
    name: "type",
    required: false,
    description: "DEPOSIT, WITHDRAWAL, TRANSFER",
  })
  @ApiResponse({ status: 200, description: "Returns wallet activity history" })
  async getWalletHistory(
    @CurrentUser("id") userId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("type") type?: string,
  ) {
    const skip = (page - 1) * limit;

    // Get wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalPages: 0,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      };
    }

    // Build query based on type
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    let deposits: unknown[] = [];
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    let withdrawals: unknown[] = [];
    let depositTotal = 0;
    let withdrawalTotal = 0;

    if (!type || type.toUpperCase() === "DEPOSIT") {
      [deposits, depositTotal] = await Promise.all([
        this.prisma.deposit.findMany({
          where: { walletId: wallet.id },
          orderBy: { createdAt: "desc" },
          skip: type ? skip : 0,
          take: type ? limit : Math.ceil(limit / 2),
        }),
        this.prisma.deposit.count({ where: { walletId: wallet.id } }),
      ]);
    }

    if (!type || type.toUpperCase() === "WITHDRAWAL") {
      [withdrawals, withdrawalTotal] = await Promise.all([
        this.prisma.withdrawal.findMany({
          where: { walletId: wallet.id },
          orderBy: { requestedAt: "desc" },
          skip: type ? skip : 0,
          take: type ? limit : Math.ceil(limit / 2),
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        }),
        this.prisma.withdrawal.count({ where: { walletId: wallet.id } }),
      ]);
    }

    // Combine and sort
    const combined = [
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...deposits.map((d: any) => ({
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: d.id,
        type: "DEPOSIT",
        amount: Number(d.amountMinor) / 100,
        status: d.status,
        reference: d.externalRef,
        createdAt: d.createdAt,
        completedAt: d.completedAt,
      })),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...withdrawals.map((w: any) => ({
        id: w.id,
        type: "WITHDRAWAL",
        amount: Number(w.amountMinor) / 100,
        status: w.status,
        reference: w.externalRef,
        createdAt: w.requestedAt,
        completedAt: w.completedAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      data: combined.slice(0, limit),
      total: depositTotal + withdrawalTotal,
      page,
      limit,
      totalPages: Math.ceil((depositTotal + withdrawalTotal) / limit),
    };
  }

  @Get("security")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get security-related activity" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiResponse({ status: 200, description: "Returns security activity" })
  async getSecurityActivity(
    @CurrentUser("id") userId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // Only filter by LOGIN and LOGOUT which are valid ActivityTypes
    const [activities, total] = await Promise.all([
      this.prisma.userActivity.findMany({
        where: {
          userId,
          activityType: {
            in: ["LOGIN", "LOGOUT"],
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.userActivity.count({
        where: {
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          userId,
          activityType: {
            in: ["LOGIN", "LOGOUT"],
          },
        },
      }),
    ]);

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: activities.map((a: any) => ({
        id: a.id,
        type: a.activityType,
        description: a.description,
        ipAddress: a.ipAddress ? this.maskIpAddress(a.ipAddress) : null,
        userAgent: a.userAgent,
        createdAt: a.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get active login sessions" })
  @ApiResponse({ status: 200, description: "Returns active sessions" })
  async getActiveSessions(@CurrentUser("id") userId: string) {
    // Get recent login activities (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const loginActivities = await this.prisma.userActivity.findMany({
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: {
        userId,
        activityType: "LOGIN",
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Group by device/browser combination
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessions = loginActivities.map((a: any) => {
      const ua = a.userAgent || "";
      let device = "Desktop";
      let browser = "Unknown";
      let os = "Unknown";

      if (ua.includes("Mobile") || ua.includes("Android")) device = "Mobile";
      if (ua.includes("iPad") || ua.includes("Tablet")) device = "Tablet";

      if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari")) browser = "Safari";
      else if (ua.includes("Edge")) browser = "Edge";

      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Mac")) os = "macOS";
      else if (ua.includes("Linux")) os = "Linux";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("iOS") || ua.includes("iPhone")) os = "iOS";

      return {
        id: a.id,
        device,
        browser,
        os,
        ipAddress: a.ipAddress ? this.maskIpAddress(a.ipAddress) : null,
        location:
          a.city && a.country ? `${a.city}, ${a.country}` : a.country || null,
        lastActive: a.createdAt,
      };
    });

    return { sessions };
  }

  @Get("stats")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get activity statistics" })
  @ApiResponse({ status: 200, description: "Returns activity statistics" })
  async getActivityStats(@CurrentUser("id") userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayCount,
      weekCount,
      monthCount,
      totalCount,
      lastLogin,
      loginCount,
    ] = await Promise.all([
      this.prisma.userActivity.count({
        where: { userId, createdAt: { gte: today } },
      }),
      this.prisma.userActivity.count({
        where: { userId, createdAt: { gte: thisWeek } },
      }),
      this.prisma.userActivity.count({
        where: { userId, createdAt: { gte: thisMonth } },
      }),
      this.prisma.userActivity.count({ where: { userId } }),
      this.prisma.userActivity.findFirst({
        where: { userId, activityType: "LOGIN" },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.userActivity.count({
        where: { userId, activityType: "LOGIN", createdAt: { gte: thisMonth } },
      }),
    ]);

    return {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      total: totalCount,
      lastLogin: lastLogin?.createdAt || null,
      loginCountThisMonth: loginCount,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private _maskIpAddress(ip: string): string {
    // Mask last octet for privacy
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    return ip.substring(0, ip.length - 3) + "***";
  }
}
