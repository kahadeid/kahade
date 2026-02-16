
import { BadgeCategory, BadgeRarity } from "@prisma/client";
import { PrismaService } from "@infrastructure/database/prisma.service";
import {
  Injectable,
  Logger,
  NotFoundException,
  // Eslint-disable-next-line @typescript-eslint/no-unused-vars
  BadRequestException,
} from "@nestjs/common";
// Eslint-disable-next-line @typescript-eslint/no-unused-vars

// Eslint-disable-next-line @typescript-eslint/no-unused-vars

// ============================================================================
// BADGE SERVICE - Gamification & Trust System
// ============================================================================

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirements: BadgeRequirements;
  pointsAwarded: number;
  iconUrl?: string;
  color?: string;
}

export interface BadgeRequirements {
  minTransactions?: number;
  minRating?: number;
  minSuccessRate?: number;
  kycVerified?: boolean;
  accountAgeDays?: number;
  totalVolumeMinor?: number;
  consecutiveSuccessful?: number;
  disputeWinRate?: number;
  responseTimeMinutes?: number;
}

export interface UserBadgeInfo {
  id: string;
  badge: {
    code: string;
    name: string;
    description: string;
    category: BadgeCategory;
    rarity: BadgeRarity;
    iconUrl: string | null;
    color: string | null;
  };
  awardedAt: Date;
  isDisplayed: boolean;
}

// Default badge definitions
const DEFAULT_BADGES: BadgeDefinition[] = [
  // Verification badges
  {
    code: "VERIFIED_EMAIL",
    name: "Email Verified",
    description: "User has verified their email address",
    category: "VERIFICATION",
    rarity: "COMMON",
    requirements: {},
    pointsAwarded: 10,
    color: "#4CAF50",
  },
  {
    code: "KYC_VERIFIED",
    name: "Identity Verified",
    description: "User has completed KYC verification",
    category: "VERIFICATION",
    rarity: "UNCOMMON",
    requirements: { kycVerified: true },
    pointsAwarded: 50,
    color: "#2196F3",
  },
  // Transaction badges
  {
    code: "FIRST_TRANSACTION",
    name: "First Steps",
    description: "Completed first transaction",
    category: "TRANSACTION",
    rarity: "COMMON",
    requirements: { minTransactions: 1 },
    pointsAwarded: 20,
    color: "#FF9800",
  },
  {
    code: "TRANSACTION_10",
    name: "Getting Started",
    description: "Completed 10 transactions",
    category: "TRANSACTION",
    rarity: "COMMON",
    requirements: { minTransactions: 10 },
    pointsAwarded: 50,
    color: "#FF9800",
  },
  {
    code: "TRANSACTION_50",
    name: "Active Trader",
    description: "Completed 50 transactions",
    category: "TRANSACTION",
    rarity: "UNCOMMON",
    requirements: { minTransactions: 50 },
    pointsAwarded: 100,
    color: "#FF5722",
  },
  {
    code: "TRANSACTION_100",
    name: "Experienced Trader",
    description: "Completed 100 transactions",
    category: "TRANSACTION",
    rarity: "RARE",
    requirements: { minTransactions: 100 },
    pointsAwarded: 200,
    color: "#E91E63",
  },
  {
    code: "TRANSACTION_500",
    name: "Master Trader",
    description: "Completed 500 transactions",
    category: "TRANSACTION",
    rarity: "EPIC",
    requirements: { minTransactions: 500 },
    pointsAwarded: 500,
    color: "#9C27B0",
  },
  {
    code: "TRANSACTION_1000",
    name: "Legend",
    description: "Completed 1000 transactions",
    category: "TRANSACTION",
    rarity: "LEGENDARY",
    requirements: { minTransactions: 1000 },
    pointsAwarded: 1000,
    color: "#FFD700",
  },
  // Trust badges
  {
    code: "TRUSTED_SELLER",
    name: "Trusted Seller",
    description: "Maintained 4.5+ rating with 20+ transactions",
    category: "TRUST",
    rarity: "UNCOMMON",
    requirements: { minRating: 4.5, minTransactions: 20 },
    pointsAwarded: 100,
    color: "#00BCD4",
  },
  {
    code: "TOP_RATED",
    name: "Top Rated",
    description: "Maintained 4.8+ rating with 50+ transactions",
    category: "TRUST",
    rarity: "RARE",
    requirements: { minRating: 4.8, minTransactions: 50 },
    pointsAwarded: 200,
    color: "#009688",
  },
  {
    code: "PERFECT_RECORD",
    name: "Perfect Record",
    description: "100% success rate with 25+ transactions",
    category: "TRUST",
    rarity: "RARE",
    requirements: { minSuccessRate: 100, minTransactions: 25 },
    pointsAwarded: 250,
    color: "#4CAF50",
  },
  {
    code: "FAST_RESPONDER",
    name: "Fast Responder",
    description: "Average response time under 30 minutes",
    category: "ENGAGEMENT",
    rarity: "UNCOMMON",
    requirements: { responseTimeMinutes: 30 },
    pointsAwarded: 75,
    color: "#03A9F4",
  },
  // Engagement badges
  {
    code: "VETERAN",
    name: "Veteran",
    description: "Account active for over 1 year",
    category: "ENGAGEMENT",
    rarity: "UNCOMMON",
    requirements: { accountAgeDays: 365 },
    pointsAwarded: 100,
    color: "#795548",
  },
  {
    code: "HIGH_VOLUME",
    name: "High Volume Trader",
    description: "Total transaction volume over 100 million IDR",
    category: "TRANSACTION",
    rarity: "EPIC",
    requirements: { totalVolumeMinor: 10000000000 }, // 100M IDR in minor
    pointsAwarded: 300,
    color: "#673AB7",
  },
];

@Injectable()
export class BadgeService {
  private readonly logger = new Logger(BadgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // BADGE MANAGEMENT
  // ============================================================================

  /**
   * Initialize default badges in database
   */
  async initializeDefaultBadges(): Promise<void> {
    try {
    for (const badge of DEFAULT_BADGES) {
      await this.prisma.badge.upsert({
        where: { code: badge.code },
        update: {
          name: badge.name,
          description: badge.description,
          category: badge.category,
          rarity: badge.rarity,
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          requirements: badge.requirements as any,
          pointsAwarded: badge.pointsAwarded,
          iconUrl: badge.iconUrl,
          color: badge.color,
        },
        create: {
          code: badge.code,
          name: badge.name,
          description: badge.description,
          category: badge.category,
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          rarity: badge.rarity,
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          requirements: badge.requirements as any,
          pointsAwarded: badge.pointsAwarded,
          iconUrl: badge.iconUrl,
          color: badge.color,
        },
      });
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }
    this.logger.log(`Initialized ${DEFAULT_BADGES.length} default badges`);
  }

  /**
   // Eslint-disable-next-line @typescript-eslint/no-explicit-any
   * Get all available badges
   */
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAllBadges(): Promise<any[]> {
    try {
    return this.prisma.badge.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { rarity: "asc" }],
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId: string): Promise<UserBadgeInfo[]> {
    try {
    const userBadges = await this.prisma.userBadge.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      include: {
        badge: true,
      },
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderBy: [{ displayOrder: "asc" }, { awardedAt: "desc" }],
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return userBadges.map((ub: any) => ({
      id: ub.id,
      badge: {
        code: ub.badge.code,
        name: ub.badge.name,
        description: ub.badge.description,
        category: ub.badge.category,
        rarity: ub.badge.rarity,
        iconUrl: ub.badge.iconUrl,
        color: ub.badge.color,
      },
      awardedAt: ub.awardedAt,
      isDisplayed: ub.isDisplayed,
    }));
  }

  /**
   * Award badge to user
   */
  async awardBadge(
    userId: string,
    badgeCode: string,
    reason?: string,
    awardedBy?: string,
  ): Promise<UserBadgeInfo | null> {
    const badge = await this.prisma.badge.findUnique({
      where: { code: badgeCode },
    });

    if (!badge || !badge.isActive) {
      this.logger.warn(`Badge ${badgeCode} not found or inactive`);
      return null;
    }

    // Check if user already has this badge
    const existing = await this.prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    });

    if (existing && !existing.revokedAt) {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      return null; // Already has badge
    }

    // Award badge
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userBadge = await this.prisma.$transaction(async (tx: any) => {
      const ub = await tx.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badge.id,
          },
        },
        update: {
          revokedAt: null,
          revokedBy: null,
          revokeReason: null,
          awardedAt: new Date(),
          awardedBy,
          reason,
        },
        create: {
          userId,
          badgeId: badge.id,
          reason,
          awardedBy,
        },
        include: { badge: true },
      });

      // Update user level XP
      await tx.userLevel.upsert({
        where: { userId },
        update: {
          currentXp: { increment: badge.pointsAwarded },
          totalXp: { increment: badge.pointsAwarded },
        },
        create: {
          userId,
          currentXp: badge.pointsAwarded,
          totalXp: badge.pointsAwarded,
        },
      });

      return ub;
    });

    this.logger.log(`Badge ${badgeCode} awarded to user ${userId}`);

    return {
      id: userBadge.id,
      badge: {
        code: userBadge.badge.code,
        name: userBadge.badge.name,
        description: userBadge.badge.description,
        category: userBadge.badge.category,
        rarity: userBadge.badge.rarity,
        iconUrl: userBadge.badge.iconUrl,
        color: userBadge.badge.color,
      },
      awardedAt: userBadge.awardedAt,
      isDisplayed: userBadge.isDisplayed,
    };
  }

  /**
   * Check and award badges based on user stats
   */
  async checkAndAwardBadges(userId: string): Promise<UserBadgeInfo[]> {
    try {
    const awardedBadges: UserBadgeInfo[] = [];

    // Get user stats
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        emailVerifiedAt: true,
        kycStatus: true,
        reputationScore: true,
        totalTransactions: true,
        createdAt: true,
      },
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });

    if (!user) return awardedBadges;

    // Get user level for additional stats
    const userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    // Get all active badges
    const badges = await this.prisma.badge.findMany({
      where: { isActive: true, isAutoAwarded: true },
    });

    // Calculate user stats
    const accountAgeDays = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Get total volume
    const volumeResult = await this.prisma.order.aggregate({
      where: {
        OR: [{ initiatorId: userId }, { counterpartyId: userId }],
        status: "COMPLETED",
      },
      _sum: { amountMinor: true },
    });
    const totalVolume = volumeResult._sum.amountMinor || 0n;

    // Check each badge
    for (const badge of badges) {
      const requirements = badge.requirements as BadgeRequirements;
      let eligible = true;

      // Check email verification
      if (badge.code === "VERIFIED_EMAIL" && !user.emailVerifiedAt) {
        eligible = false;
      }

      // Check KYC
      if (requirements.kycVerified && user.kycStatus !== "VERIFIED") {
        eligible = false;
      }

      // Check transaction count
      if (
        requirements.minTransactions &&
        user.totalTransactions < requirements.minTransactions
      ) {
        eligible = false;
      }

      // Check rating
      if (
        requirements.minRating &&
        Number(user.reputationScore) < requirements.minRating
      ) {
        eligible = false;
      }

      // Check account age
      if (
        requirements.accountAgeDays &&
        accountAgeDays < requirements.accountAgeDays
      ) {
        eligible = false;
      }

      // Check volume
      if (
        requirements.totalVolumeMinor &&
        totalVolume < BigInt(requirements.totalVolumeMinor)
      ) {
        eligible = false;
      }

      // Check success rate
      if (requirements.minSuccessRate && userLevel) {
        if (Number(userLevel.successRate) < requirements.minSuccessRate) {
          eligible = false;
        }
      }

      // Check response time
      if (requirements.responseTimeMinutes && userLevel?.responseTime) {
        if (userLevel.responseTime > requirements.responseTimeMinutes) {
          eligible = false;
        }
      }

      if (eligible) {
        const awarded = await this.awardBadge(
          userId,
          badge.code,
          "Auto-awarded",
        );
        if (awarded) {
          awardedBadges.push(awarded);
        }
      }
    }

    return awardedBadges;
  }

  /**
   * Toggle badge display
   */
  async toggleBadgeDisplay(
    userId: string,
    userBadgeId: string,
    isDisplayed: boolean,
  ): Promise<void> {
    const userBadge = await this.prisma.userBadge.findFirst({
      where: { id: userBadgeId, userId },
    });

    if (!userBadge) {
      throw new NotFoundException("Badge not found");
    }

    await this.prisma.userBadge.update({
      where: { id: userBadgeId },
      data: { isDisplayed },
    });
  }

  /**
   * Reorder displayed badges
   */
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async reorderBadges(
    userId: string,
    badgeOrder: { userBadgeId: string; order: number }[],
  ): Promise<void> {
    await this.prisma.$transaction(
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      badgeOrder.map((item: any) =>
        this.prisma.userBadge.updateMany({
          where: { id: item.userBadgeId, userId },
          data: { displayOrder: item.order },
        }),
      ),
    );
  }

  /**
   * Get user's displayed badges (for profile)
   */
  async getDisplayedBadges(userId: string): Promise<UserBadgeInfo[]> {
    try {
    const userBadges = await this.prisma.userBadge.findMany({
      where: {
        userId,
        isDisplayed: true,
        revokedAt: null,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      },
      include: { badge: true },
      orderBy: { displayOrder: "asc" },
      take: 5, // Max 5 displayed badges
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return userBadges.map((ub: any) => ({
      id: ub.id,
      badge: {
        code: ub.badge.code,
        name: ub.badge.name,
        description: ub.badge.description,
        category: ub.badge.category,
        rarity: ub.badge.rarity,
        iconUrl: ub.badge.iconUrl,
        color: ub.badge.color,
      },
      awardedAt: ub.awardedAt,
      isDisplayed: ub.isDisplayed,
    }));
  }
}
