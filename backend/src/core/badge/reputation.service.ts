import { Injectable, Logger } from "@nestjs/common";

import { Decimal } from "@prisma/client/runtime/library";
import { PrismaService } from "@infrastructure/database/prisma.service";

// Eslint-disable-next-line @typescript-eslint/no-unused-vars
// Eslint-disable-next-line @typescript-eslint/no-unused-vars

// ============================================================================
// REPUTATION SERVICE - User Trust & Level System
// ============================================================================

export interface UserReputationInfo {
  userId: string;
  reputationScore: number;
  level: number;
  currentXp: number;
  totalXp: number;
  xpToNextLevel: number;
  transactionCount: number;
  successRate: number;
  responseTime: number | null;
  rank: string;
}

export interface ReputationChangeEvent {
  userId: string;
  reason: string;
  change: number;
  referenceType?: string;
  referenceId?: string;
}

// Level thresholds
const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, rank: "Newcomer" },
  { level: 2, xpRequired: 100, rank: "Beginner" },
  { level: 3, xpRequired: 300, rank: "Apprentice" },
  { level: 4, xpRequired: 600, rank: "Trader" },
  { level: 5, xpRequired: 1000, rank: "Skilled Trader" },
  { level: 6, xpRequired: 1500, rank: "Expert" },
  { level: 7, xpRequired: 2200, rank: "Master" },
  { level: 8, xpRequired: 3000, rank: "Grandmaster" },
  { level: 9, xpRequired: 4000, rank: "Elite" },
  { level: 10, xpRequired: 5500, rank: "Legend" },
];

// Reputation change reasons and their impact
const REPUTATION_IMPACTS = {
  TRANSACTION_COMPLETED: 0.05,
  RATING_5_STAR: 0.1,
  RATING_4_STAR: 0.05,
  RATING_3_STAR: 0,
  RATING_2_STAR: -0.1,
  RATING_1_STAR: -0.2,
  DISPUTE_WON: 0.05,
  DISPUTE_LOST: -0.15,
  DISPUTE_SPLIT: -0.05,
  FRAUD_CONFIRMED: -1.0,
  KYC_VERIFIED: 0.2,
  ACCOUNT_WARNING: -0.1,
};

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // REPUTATION MANAGEMENT
  // ============================================================================

  /**
   * Get user's reputation info
   */
  async getUserReputation(userId: string): Promise<UserReputationInfo> {
    try {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        reputationScore: true,
        totalTransactions: true,
      },
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get or create user level
    let userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    if (!userLevel) {
      userLevel = await this.prisma.userLevel.create({
        data: { userId },
      });
    }

    const levelInfo = this.calculateLevel(userLevel.totalXp);

    return {
      userId: user.id,
      reputationScore: Number(user.reputationScore),
      level: levelInfo.level,
      currentXp: userLevel.currentXp,
      totalXp: userLevel.totalXp,
      xpToNextLevel: levelInfo.xpToNextLevel,
      transactionCount: userLevel.transactionCount,
      successRate: Number(userLevel.successRate),
      responseTime: userLevel.responseTime,
      rank: levelInfo.rank,
    };
  }

  /**
   * Update user reputation based on event
   */
  async updateReputation(event: ReputationChangeEvent): Promise<void> {
    try {
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    const { userId, reason, change, referenceType, referenceId } = event;

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.$transaction(async (tx: any) => {
      // Get current reputation
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { reputationScore: true },
      });

      if (!user) return;

      const previousScore = Number(user.reputationScore);
      let newScore = previousScore + change;

      // Clamp between 0 and 5
      newScore = Math.max(0, Math.min(5, newScore));

      // Update user reputation
      await tx.user.update({
        where: { id: userId },
        data: { reputationScore: new Decimal(newScore.toFixed(2)) },
      });

      // Record history
      await tx.reputationHistory.create({
        data: {
          userId,
          previousScore: new Decimal(previousScore.toFixed(2)),
          newScore: new Decimal(newScore.toFixed(2)),
          change: new Decimal(change.toFixed(2)),
          reason,
          referenceType,
          referenceId,
        },
      });
    });

    this.logger.log(
      `Reputation updated for user ${userId}: ${change > 0 ? "+" : ""}${change} (${reason})`,
    );
  }

  /**
   * Process rating and update reputation
   */
  async processRating(
    userId: string,
    rating: number,
    orderId: string,
  ): Promise<void> {
    let reason: string;
    let change: number;

    switch (rating) {
      case 5:
        reason = "RATING_5_STAR";
        change = REPUTATION_IMPACTS.RATING_5_STAR;
        break;
      case 4:
        reason = "RATING_4_STAR";
        change = REPUTATION_IMPACTS.RATING_4_STAR;
        break;
      case 3:
        reason = "RATING_3_STAR";
        change = REPUTATION_IMPACTS.RATING_3_STAR;
        break;
      case 2:
        reason = "RATING_2_STAR";
        change = REPUTATION_IMPACTS.RATING_2_STAR;
        break;
      default:
        reason = "RATING_1_STAR";
        change = REPUTATION_IMPACTS.RATING_1_STAR;
    }

    await this.updateReputation({
      userId,
      reason,
      change,
      referenceType: "ORDER",
      referenceId: orderId,
    });
  }

  /**
   * Process transaction completion
   */
  async processTransactionCompleted(
    userId: string,
    orderId: string,
  ): Promise<void> {
    // Update reputation
    await this.updateReputation({
      userId,
      reason: "TRANSACTION_COMPLETED",
      change: REPUTATION_IMPACTS.TRANSACTION_COMPLETED,
      referenceType: "ORDER",
      referenceId: orderId,
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Update user level stats
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.$transaction(async (tx: any) => {
      // Increment transaction count
      await tx.user.update({
        where: { id: userId },
        data: { totalTransactions: { increment: 1 } },
      });

      // Update user level
      await tx.userLevel.upsert({
        where: { userId },
        update: {
          transactionCount: { increment: 1 },
          currentXp: { increment: 10 }, // XP for completing transaction
          totalXp: { increment: 10 },
        },
        create: {
          userId,
          transactionCount: 1,
          currentXp: 10,
          totalXp: 10,
        },
      });
    });

    // Award XP
    await this.awardXp(userId, 10, "Transaction completed");
  }

  /**
   * Process dispute result
   */
  async processDisputeResult(
    userId: string,
    result: "WON" | "LOST" | "SPLIT",
    disputeId: string,
  ): Promise<void> {
    let reason: string;
    let change: number;

    switch (result) {
      case "WON":
        reason = "DISPUTE_WON";
        change = REPUTATION_IMPACTS.DISPUTE_WON;
        break;
      case "LOST":
        reason = "DISPUTE_LOST";
        change = REPUTATION_IMPACTS.DISPUTE_LOST;
        break;
      case "SPLIT":
        reason = "DISPUTE_SPLIT";
        change = REPUTATION_IMPACTS.DISPUTE_SPLIT;
        break;
    }

    await this.updateReputation({
      userId,
      reason,
      change,
      referenceType: "DISPUTE",
      referenceId: disputeId,
    });
  }

  // ============================================================================
  // XP & LEVEL SYSTEM
  // ============================================================================

  /**
   * Award XP to user
   */
  async awardXp(
    userId: string,
    amount: number,
    _reason: string,
  ): Promise<void> {
    const userLevel = await this.prisma.userLevel.upsert({
      where: { userId },
      update: {
        currentXp: { increment: amount },
        totalXp: { increment: amount },
      },
      create: {
        userId,
        currentXp: amount,
        totalXp: amount,
      },
    });

    // Check for level up
    const newLevelInfo = this.calculateLevel(userLevel.totalXp + amount);
    const currentLevelInfo = this.calculateLevel(userLevel.totalXp);

    if (newLevelInfo.level > currentLevelInfo.level) {
      await this.prisma.userLevel.update({
        where: { userId },
        data: {
          level: newLevelInfo.level,
          levelUpAt: new Date(),
        },
      });

      this.logger.log(
        `User ${userId} leveled up to level ${newLevelInfo.level} (${newLevelInfo.rank})`,
      );
    }
  }

  /**
   * Calculate level from XP
   */
  private _calculateLevel(totalXp: number): {
    level: number;
    rank: string;
    xpToNextLevel: number;
  } {
    let currentLevel = LEVEL_THRESHOLDS[0];
    let nextLevel = LEVEL_THRESHOLDS[1];

    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXp >= LEVEL_THRESHOLDS[i].xpRequired) {
        currentLevel = LEVEL_THRESHOLDS[i];
        nextLevel = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
        break;
      }
    }

    const xpToNextLevel =
      currentLevel.level === nextLevel.level
        ? 0
        : nextLevel.xpRequired - totalXp;

    return {
      level: currentLevel.level,
      rank: currentLevel.rank,
      xpToNextLevel: Math.max(0, xpToNextLevel),
    };
  }

  /**
   * Get reputation history
   */
  async getReputationHistory(
    userId: string,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: { page: number; limit: number },
  ): Promise<{
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: unknown[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.reputationHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.reputationHistory.count({ where: { userId } }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    ]);

    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: history.map((h: any) => ({
        id: h.id,
        previousScore: Number(h.previousScore),
        newScore: Number(h.newScore),
        change: Number(h.change),
        reason: h.reason,
        referenceType: h.referenceType,
        referenceId: h.referenceId,
        createdAt: h.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Get leaderboard
   */
  async getLeaderboard(options: { page: number; limit: number }): Promise<{
    try {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: unknown[];
    total: number;
    page: number;
    limit: number;
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: [{ reputationScore: "desc" }, { totalTransactions: "desc" }],
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          reputationScore: true,
          totalTransactions: true,
        },
        skip,
        take: limit,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Get levels for each user
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userIds = users.map((u: any) => u.id);
    const levels = await this.prisma.userLevel.findMany({
      where: { userId: { in: userIds } },
    });
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const levelMap = new Map<string, { totalXp: number }>(levels.map((l: any) => [l.userId, l]));

    return {
      data: users.map((u, index) => {
        const level = levelMap.get(u.id);
        const levelInfo = this.calculateLevel(level?.totalXp || 0);
        return {
          rank: skip + index + 1,
          userId: u.id,
          username: u.username,
          avatarUrl: u.avatarUrl,
          reputationScore: Number(u.reputationScore),
          totalTransactions: u.totalTransactions,
          level: levelInfo.level,
          levelRank: levelInfo.rank,
        };
      }),
      total,
      page,
      limit,
    };
  }
}
