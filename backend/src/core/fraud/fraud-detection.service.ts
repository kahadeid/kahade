import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@infrastructure/database/prisma.service";
import { RiskLevel, FraudAlertStatus } from "@prisma/client";

// ============================================================================
// FRAUD DETECTION SERVICE
// Rule-based fraud detection and risk assessment
// ============================================================================

export interface FraudCheckResult {
  isHighRisk: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  flagsTriggered: string[];
  requiresReview: boolean;
  alerts: string[];
}

export interface VelocityCheckParams {
  userId: string;
  windowMinutes: number;
  maxTransactions: number;
  maxAmount?: bigint;
}

// Default fraud rules
const DEFAULT_FRAUD_RULES = [
  {
    code: "VELOCITY_HIGH_FREQUENCY",
    name: "High Frequency Transactions",
    description: "Too many transactions in a short time window",
    type: "VELOCITY",
    conditions: { windowMinutes: 60, maxTransactions: 10 },
    actions: { requireReview: true, blockTransaction: false },
    riskScore: 30,
    priority: 10,
  },
  {
    code: "VELOCITY_HIGH_AMOUNT",
    name: "High Volume in Short Period",
    description: "High transaction volume in a short time window",
    type: "VELOCITY",
    conditions: { windowMinutes: 60, maxAmountMinor: 50000000 }, // 500K IDR
    actions: { requireReview: true, blockTransaction: false },
    riskScore: 40,
    priority: 10,
  },
  {
    code: "AMOUNT_UNUSUAL_HIGH",
    name: "Unusually High Amount",
    description: "Transaction amount significantly higher than user average",
    type: "AMOUNT",
    conditions: { multiplierThreshold: 5 }, // 5x average
    actions: { requireReview: true, blockTransaction: false },
    riskScore: 25,
    priority: 20,
  },
  {
    code: "PATTERN_NEW_ACCOUNT_HIGH_VALUE",
    name: "New Account High Value",
    description: "High value transaction from new account",
    type: "PATTERN",
    conditions: { accountAgeDays: 7, minAmountMinor: 10000000 }, // 100K IDR
    actions: { requireReview: true, blockTransaction: false },
    riskScore: 35,
    priority: 15,
  },
  {
    code: "DEVICE_NEW_DEVICE",
    name: "New Device Detected",
    description: "Transaction from unrecognized device",
    type: "DEVICE",
    conditions: {},
    actions: { requireReview: false, blockTransaction: false },
    riskScore: 15,
    priority: 30,
  },
  {
    code: "LOCATION_VPN_PROXY",
    name: "VPN/Proxy Detected",
    description: "Transaction from VPN or proxy IP",
    type: "LOCATION",
    conditions: {},
    actions: { requireReview: true, blockTransaction: false },
    riskScore: 25,
    priority: 20,
  },
  {
    code: "ACCOUNT_MULTIPLE_FAILED_PAYMENTS",
    name: "Multiple Failed Payments",
    description: "Multiple failed payment attempts",
    type: "ACCOUNT",
    conditions: { failedPaymentsThreshold: 3, windowHours: 24 },
    actions: { requireReview: true, blockTransaction: true },
    riskScore: 50,
    priority: 5,
  },
  {
    code: "NETWORK_LINKED_FRAUD_ACCOUNT",
    name: "Linked to Fraud Account",
    description: "Account linked to known fraud account",
    type: "NETWORK",
    conditions: {},
    actions: { requireReview: true, blockTransaction: true },
    riskScore: 80,
    priority: 1,
  },
];

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize default fraud rules
   */
  async initializeDefaultRules(): Promise<void> {
    try {
      for (const rule of DEFAULT_FRAUD_RULES) {
        await this.prisma.fraudRule.upsert({
          where: { code: rule.code },
          update: {
            name: rule.name,
            description: rule.description,
            type: rule.type as any,
            conditions: rule.conditions,
            actions: rule.actions,
            riskScore: rule.riskScore,
            priority: rule.priority,
          },
          create: {
            code: rule.code,
            name: rule.name,
            description: rule.description,
            type: rule.type as any,
            conditions: rule.conditions,
            actions: rule.actions,
            riskScore: rule.riskScore,
            priority: rule.priority,
          },
        });
      }
      this.logger.log(`Initialized ${DEFAULT_FRAUD_RULES.length} fraud rules`);
    } catch (error) {
      this.logger.error(`Error in initializeDefaultRules: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  // ============================================================================
  // FRAUD CHECKS
  // ============================================================================

  /**
   * Run all fraud checks for a transaction
   */
  async checkTransaction(
    userId: string,
    amountMinor: bigint,
    ipAddress?: string,
    deviceFingerprint?: string,
  ): Promise<FraudCheckResult> {
    const flagsTriggered: string[] = [];
    const alerts: string[] = [];
    let totalRiskScore = 0;

    const riskProfile = await this.getOrCreateRiskProfile(userId);

    if (riskProfile.isWatchlisted) {
      totalRiskScore += 30;
      flagsTriggered.push("USER_WATCHLISTED");
    }

    const rules = await this.prisma.fraudRule.findMany({
      where: { isActive: true },
      orderBy: { priority: "asc" },
    });

    for (const rule of rules) {
      const triggered = await this.evaluateRule(
        rule,
        userId,
        amountMinor,
        ipAddress,
        deviceFingerprint,
      );

      if (triggered) {
        flagsTriggered.push(rule.code);
        totalRiskScore += rule.riskScore;
        alerts.push(rule.name);
        await this.createAlert(userId, rule, amountMinor);
      }
    }

    const riskLevel = this.calculateRiskLevel(totalRiskScore);
    const requiresReview =
      totalRiskScore >= 50 || riskLevel === "HIGH" || riskLevel === "CRITICAL";

    await this.updateRiskProfile(userId, totalRiskScore, flagsTriggered);

    return {
      isHighRisk: riskLevel === "HIGH" || riskLevel === "CRITICAL",
      riskScore: totalRiskScore,
      riskLevel,
      flagsTriggered,
      requiresReview,
      alerts,
    };
  }

  /**
   * Evaluate a single fraud rule
   */
  private async evaluateRule(
    rule: any,
    userId: string,
    amountMinor: bigint,
    ipAddress?: string,
    deviceFingerprint?: string,
  ): Promise<boolean> {
    const conditions = rule.conditions as any;

    switch (rule.type) {
      case "VELOCITY":
        return this.checkVelocity(userId, conditions, amountMinor);
      case "AMOUNT":
        return this.checkAmount(userId, amountMinor, conditions);
      case "PATTERN":
        return this.checkPattern(userId, amountMinor, conditions);
      case "DEVICE":
        return this.checkDevice(userId, deviceFingerprint);
      case "LOCATION":
        return this.checkLocation(ipAddress);
      case "ACCOUNT":
        return this.checkAccount(userId, conditions);
      case "NETWORK":
        return this.checkNetwork(userId);
      default:
        return false;
    }
  }

  /**
   * Check velocity rules (transaction frequency)
   */
  private async checkVelocity(
    userId: string,
    conditions: any,
    currentAmount: bigint,
  ): Promise<boolean> {
    const windowStart = new Date(
      Date.now() - conditions.windowMinutes * 60 * 1000,
    );

    const recentOrders = await this.prisma.order.findMany({
      where: {
        OR: [{ initiatorId: userId }, { counterpartyId: userId }],
        createdAt: { gte: windowStart },
      },
      select: { amountMinor: true },
    });

    if (
      conditions.maxTransactions &&
      recentOrders.length >= conditions.maxTransactions
    ) {
      return true;
    }

    if (conditions.maxAmountMinor) {
      const totalAmount = recentOrders.reduce(
        (sum, o) => sum + o.amountMinor,
        0n,
      );
      if (totalAmount + currentAmount > BigInt(conditions.maxAmountMinor)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check amount-based rules
   */
  private async checkAmount(
    userId: string,
    amountMinor: bigint,
    conditions: any,
  ): Promise<boolean> {
    const avgResult = await this.prisma.order.aggregate({
      where: {
        OR: [{ initiatorId: userId }, { counterpartyId: userId }],
        status: "COMPLETED",
      },
      _avg: { amountMinor: true },
    });

    const avgAmount = avgResult._avg.amountMinor || 0;

    if (conditions.multiplierThreshold && avgAmount > 0) {
      const threshold = BigInt(
        Math.floor(Number(avgAmount) * conditions.multiplierThreshold),
      );
      if (amountMinor > threshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check pattern-based rules
   */
  private async checkPattern(
    userId: string,
    amountMinor: bigint,
    conditions: any,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    if (!user) return false;

    const accountAgeDays = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (
      conditions.accountAgeDays &&
      conditions.minAmountMinor &&
      accountAgeDays <= conditions.accountAgeDays &&
      amountMinor >= BigInt(conditions.minAmountMinor)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Check device-based rules
   */
  private async checkDevice(
    userId: string,
    fingerprint?: string,
  ): Promise<boolean> {
    if (!fingerprint) return false;

    const knownDevice = await this.prisma.deviceFingerprint.findFirst({
      where: {
        userId,
        fingerprint,
        isTrusted: true,
      },
    });

    return !knownDevice;
  }

  /**
   * Check location-based rules
   */
  private async checkLocation(ipAddress?: string): Promise<boolean> {
    try {
      if (!ipAddress) return false;

      const ipReputation = await this.prisma.ipReputation.findUnique({
        where: { ipAddress },
      });

      if (ipReputation) {
        return ipReputation.isVpn || ipReputation.isProxy || ipReputation.isTor;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error in checkLocation: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * Check account-based rules
   */
  private async checkAccount(
    userId: string,
    conditions: any,
  ): Promise<boolean> {
    if (conditions.failedPaymentsThreshold && conditions.windowHours) {
      const windowStart = new Date(
        Date.now() - conditions.windowHours * 60 * 60 * 1000,
      );

      const failedPayments = await this.prisma.payment.count({
        where: {
          userId,
          status: "FAILED",
          createdAt: { gte: windowStart },
        },
      });

      if (failedPayments >= conditions.failedPaymentsThreshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check network-based rules (linked accounts)
   */
  private async checkNetwork(userId: string): Promise<boolean> {
    try {
      const riskProfile = await this.prisma.userRiskProfile.findUnique({
        where: { userId },
      });

      if (riskProfile && riskProfile.confirmedFrauds > 0) {
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error in checkNetwork: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  // ============================================================================
  // RISK PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Get or create user risk profile
   */
  async getOrCreateRiskProfile(userId: string): Promise<any> {
    try {
      let profile = await this.prisma.userRiskProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        profile = await this.prisma.userRiskProfile.create({
          data: { userId },
        });
      }

      return profile;
    } catch (error) {
      this.logger.error(`Error in getOrCreateRiskProfile: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * Update user risk profile
   */
  private async updateRiskProfile(
    userId: string,
    riskScore: number,
    flagsTriggered: string[],
  ): Promise<void> {
    const riskLevel = this.calculateRiskLevel(riskScore);

    await this.prisma.userRiskProfile.upsert({
      where: { userId },
      update: {
        overallRiskScore: riskScore,
        riskLevel,
        lastAssessedAt: new Date(),
        totalAlerts: { increment: flagsTriggered.length > 0 ? 1 : 0 },
      },
      create: {
        userId,
        overallRiskScore: riskScore,
        riskLevel,
        lastAssessedAt: new Date(),
      },
    });
  }

  /**
   * Calculate risk level from score
   */
  private calculateRiskLevel(score: number): RiskLevel {
    if (score >= 80) return "CRITICAL";
    if (score >= 50) return "HIGH";
    if (score >= 25) return "MEDIUM";
    return "LOW";
  }

  // ============================================================================
  // ALERT MANAGEMENT
  // ============================================================================

  /**
   * Create fraud alert
   */
  private async createAlert(
    userId: string,
    rule: any,
    amountMinor?: bigint,
  ): Promise<void> {
    await this.prisma.fraudAlert.create({
      data: {
        userId,
        ruleId: rule.id,
        alertType: rule.type,
        riskLevel: this.calculateRiskLevel(rule.riskScore),
        riskScore: rule.riskScore,
        title: rule.name,
        description: rule.description,
        evidence: {
          amountMinor: amountMinor?.toString(),
          timestamp: new Date().toISOString(),
        },
        status: "PENDING",
      },
    });
  }

  /**
   * Get pending fraud alerts
   */
  async getPendingAlerts(options: { page: number; limit: number }): Promise<{
    data: unknown[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { page, limit } = options;
      const skip = (page - 1) * limit;

      const [alerts, total] = await Promise.all([
        this.prisma.fraudAlert.findMany({
          where: { status: "PENDING" },
          orderBy: [{ riskLevel: "desc" }, { createdAt: "desc" }],
          skip,
          take: limit,
          include: { rule: true },
        }),
        this.prisma.fraudAlert.count({ where: { status: "PENDING" } }),
      ]);

      return { data: alerts, total, page, limit };
    } catch (error) {
      this.logger.error(`Error in getPendingAlerts: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * Resolve fraud alert
   */
  async resolveAlert(
    alertId: string,
    resolution: {
      status: FraudAlertStatus;
      resolution: string;
      actionTaken?: string;
      resolvedBy: string;
    },
  ): Promise<void> {
    const alert = await this.prisma.fraudAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new Error("Alert not found");
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.fraudAlert.update({
        where: { id: alertId },
        data: {
          status: resolution.status,
          resolution: resolution.resolution,
          actionTaken: resolution.actionTaken,
          resolvedBy: resolution.resolvedBy,
          resolvedAt: new Date(),
        },
      });

      if (resolution.status === "CONFIRMED_FRAUD" && alert.userId) {
        await tx.userRiskProfile.update({
          where: { userId: alert.userId },
          data: {
            confirmedFrauds: { increment: 1 },
            isWatchlisted: true,
            watchlistReason: resolution.resolution,
            watchlistedAt: new Date(),
            watchlistedBy: resolution.resolvedBy,
          },
        });
      }
    });

    this.logger.log(`Alert ${alertId} resolved as ${resolution.status}`);
  }

  /**
   * Add user to watchlist
   */
  async addToWatchlist(
    userId: string,
    reason: string,
    addedBy: string,
  ): Promise<void> {
    await this.prisma.userRiskProfile.upsert({
      where: { userId },
      update: {
        isWatchlisted: true,
        watchlistReason: reason,
        watchlistedAt: new Date(),
        watchlistedBy: addedBy,
      },
      create: {
        userId,
        isWatchlisted: true,
        watchlistReason: reason,
        watchlistedAt: new Date(),
        watchlistedBy: addedBy,
      },
    });

    this.logger.log(`User ${userId} added to watchlist: ${reason}`);
  }

  /**
   * Remove user from watchlist
   */
  async removeFromWatchlist(userId: string): Promise<void> {
    try {
      await this.prisma.userRiskProfile.update({
        where: { userId },
        data: {
          isWatchlisted: false,
          watchlistReason: null,
          watchlistedAt: null,
          watchlistedBy: null,
        },
      });

      this.logger.log(`User ${userId} removed from watchlist`);
    } catch (error) {
      this.logger.error(`Error in removeFromWatchlist: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
