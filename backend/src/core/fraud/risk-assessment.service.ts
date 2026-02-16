import { Injectable, Logger } from "@nestjs/common";

import { FraudDetectionService } from "./fraud-detection.service";
import { PrismaService } from "@infrastructure/database/prisma.service";
import { RiskLevel } from "@prisma/client";

// ============================================================================
// RISK ASSESSMENT SERVICE
// Transaction-level risk assessment
// ============================================================================

export interface TransactionRiskResult {
  orderId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  isApproved: boolean;
  requiresReview: boolean;
}

export interface RiskFactor {
  code: string;
  name: string;
  score: number;
  details: string;
}

@Injectable()
export class RiskAssessmentService {
  private readonly logger = new Logger(RiskAssessmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fraudService: FraudDetectionService,
  ) {}

  /**
   * Assess risk for a new order
   */
  async assessOrder(
    orderId: string,
    userId: string,
    amountMinor: bigint,
    ipAddress?: string,
    deviceFingerprint?: string,
  ): Promise<TransactionRiskResult> {
    const riskFactors: RiskFactor[] = [];
    let totalScore = 0;

    // Run fraud checks
    const fraudResult = await this.fraudService.checkTransaction(
      userId,
      amountMinor,
      ipAddress,
      deviceFingerprint,
    );

    // Add fraud flags as risk factors
    for (const flag of fraudResult.flagsTriggered) {
      riskFactors.push({
        code: flag,
        name: flag.replace(/_/g, " "),
        score: Math.floor(
          fraudResult.riskScore / fraudResult.flagsTriggered.length,
        ),
        details: `Fraud rule triggered: ${flag}`,
      });
    }
    totalScore += fraudResult.riskScore;

    // Additional risk factors

    // 1. User verification status
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        kycStatus: true,
        emailVerifiedAt: true,
        totalTransactions: true,
        reputationScore: true,
        createdAt: true,
      },
    });

    if (user) {
      // KYC not verified
      if (user.kycStatus !== "VERIFIED") {
        const kycScore = user.kycStatus === "NONE" ? 15 : 5;
        riskFactors.push({
          code: "KYC_NOT_VERIFIED",
          name: "KYC Not Verified",
          score: kycScore,
          details: `User KYC status: ${user.kycStatus}`,
        });
        totalScore += kycScore;
      }

      // Email not verified
      if (!user.emailVerifiedAt) {
        riskFactors.push({
          code: "EMAIL_NOT_VERIFIED",
          name: "Email Not Verified",
          score: 10,
          details: "User email is not verified",
        });
        totalScore += 10;
      }

      // Low transaction history
      if (user.totalTransactions < 5) {
        riskFactors.push({
          code: "LOW_TRANSACTION_HISTORY",
          name: "Limited Transaction History",
          score: 10,
          details: `User has only ${user.totalTransactions} transactions`,
        });
        totalScore += 10;
      }

      // Low reputation
      if (Number(user.reputationScore) < 3.0 && user.totalTransactions > 0) {
        riskFactors.push({
          code: "LOW_REPUTATION",
          name: "Low Reputation Score",
          score: 15,
          details: `User reputation: ${user.reputationScore}`,
        });
        totalScore += 15;
      }

      // New account
      const accountAgeDays = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (accountAgeDays < 7) {
        riskFactors.push({
          code: "NEW_ACCOUNT",
          name: "New Account",
          score: 10,
          details: `Account is ${accountAgeDays} days old`,
        });
        totalScore += 10;
      }
    }

    // 2. Amount-based risk
    const amountRisk = this.assessAmountRisk(amountMinor);
    if (amountRisk.score > 0) {
      riskFactors.push(amountRisk);
      totalScore += amountRisk.score;
    }

    // Calculate final risk level
    const riskLevel = this.calculateRiskLevel(totalScore);
    const requiresReview =
      totalScore >= 50 || riskLevel === "HIGH" || riskLevel === "CRITICAL";
    const isApproved = riskLevel !== "CRITICAL";

    // Save assessment
    await this.prisma.transactionRiskAssessment.upsert({
      where: { orderId },
      update: {
        riskScore: totalScore,
        riskLevel,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        riskFactors: riskFactors as any,
        flagsTriggered: fraudResult.flagsTriggered,
        isApproved,
        requiresReview,
      },
      create: {
        orderId,
        riskScore: totalScore,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        riskLevel,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        riskFactors: riskFactors as any,
        flagsTriggered: fraudResult.flagsTriggered,
        isApproved,
        requiresReview,
      },
    });

    this.logger.log(
      `Order ${orderId} risk assessment: score=${totalScore}, level=${riskLevel}`,
    );

    return {
      orderId,
      riskScore: totalScore,
      riskLevel,
      riskFactors,
      isApproved,
      requiresReview,
    };
  }

  /**
   * Assess amount-based risk
   */
  private assessAmountRisk(amountMinor: bigint): RiskFactor {
    const amount = Number(amountMinor) / 100;

    if (amount >= 100000000) {
      // 1 billion IDR
      return {
        code: "VERY_HIGH_AMOUNT",
        name: "Very High Transaction Amount",
        score: 30,
        details: `Transaction amount: Rp ${amount.toLocaleString()}`,
      };
    } else if (amount >= 50000000) {
      // 500 million IDR
      return {
        code: "HIGH_AMOUNT",
        name: "High Transaction Amount",
        score: 20,
        details: `Transaction amount: Rp ${amount.toLocaleString()}`,
      };
    } else if (amount >= 10000000) {
      // 100 million IDR
      return {
        code: "MODERATE_HIGH_AMOUNT",
        name: "Moderately High Amount",
        score: 10,
        details: `Transaction amount: Rp ${amount.toLocaleString()}`,
      };
    }

    return { code: "", name: "", score: 0, details: "" };
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

  /**
   // Eslint-disable-next-line @typescript-eslint/no-explicit-any
   * Get order risk assessment
   */
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getOrderRiskAssessment(orderId: string): Promise<any> {
    try {
    return this.prisma.transactionRiskAssessment.findUnique({
      where: { orderId },
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });
  }

  /**
   * Approve order after manual review
   */
  async approveOrder(
    orderId: string,
    reviewedBy: string,
    notes?: string,
  ): Promise<void> {
    await this.prisma.transactionRiskAssessment.update({
      where: { orderId },
      data: {
        isApproved: true,
        requiresReview: false,
        reviewedAt: new Date(),
        reviewedBy,
        reviewNotes: notes,
      },
    });

    this.logger.log(`Order ${orderId} approved by ${reviewedBy}`);
  }

  /**
   * Reject order after manual review
   */
  async rejectOrder(
    orderId: string,
    reviewedBy: string,
    reason: string,
  ): Promise<void> {
    await this.prisma.transactionRiskAssessment.update({
      where: { orderId },
      data: {
        isApproved: false,
        requiresReview: false,
        reviewedAt: new Date(),
        reviewedBy,
        reviewNotes: reason,
      },
    });

    this.logger.log(`Order ${orderId} rejected by ${reviewedBy}: ${reason}`);
  }

  /**
   * Get orders requiring review
   */
  async getOrdersRequiringReview(options: {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    page: number;
    limit: number;
  }): Promise<{
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: unknown[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [assessments, total] = await Promise.all([
      this.prisma.transactionRiskAssessment.findMany({
        where: { requiresReview: true, reviewedAt: null },
        orderBy: [{ riskLevel: "desc" }, { assessedAt: "asc" }],
        skip,
        take: limit,
      }),
      this.prisma.transactionRiskAssessment.count({
        where: { requiresReview: true, reviewedAt: null },
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      }),
    ]);

    // Get order details
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderIds = assessments.map((a: any) => a.orderId);
    const orders = await this.prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: {
        id: true,
        orderNumber: true,
        title: true,
        amountMinor: true,
        status: true,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        initiator: { select: { id: true, username: true } },
        counterparty: { select: { id: true, username: true } },
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      },
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderMap = new Map(orders.map((o: any) => [o.id, o]));

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = assessments.map((a: any) => ({
      ...a,
      order: orderMap.get(a.orderId),
    }));

    return { data, total, page, limit };
  }
}
