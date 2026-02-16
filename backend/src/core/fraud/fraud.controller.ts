
import { AdminGuard } from "@common/guards/admin.guard";
import { FraudDetectionService } from "./fraud-detection.service";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { RiskAssessmentService } from "./risk-assessment.service";
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";

@Controller("fraud")
@UseGuards(JwtAuthGuard, AdminGuard)
export class FraudController {
  constructor(
    private readonly fraudService: FraudDetectionService,
    private readonly riskService: RiskAssessmentService,
  ) {}

  // ============================================================================
  // FRAUD ALERTS
  // ============================================================================

  @Get("alerts")
  async getPendingAlerts(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.fraudService.getPendingAlerts({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Put("alerts/:alertId/resolve")
  async resolveAlert(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("alertId") alertId: string,
    @Body()
    body: {
      status: "CONFIRMED_FRAUD" | "FALSE_POSITIVE" | "RESOLVED";
      resolution: string;
      actionTaken?: string;
    },
  ) {
    await this.fraudService.resolveAlert(alertId, {
      ...body,
      resolvedBy: req.user.id,
    });
    return { success: true };
  }

  // ============================================================================
  // RISK ASSESSMENTS
  // ============================================================================

  @Get("risk/orders")
  async getOrdersRequiringReview(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.riskService.getOrdersRequiringReview({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Get("risk/orders/:orderId")
  async getOrderRiskAssessment(@Param("orderId") orderId: string) {
    return this.riskService.getOrderRiskAssessment(orderId);
  }

  @Put("risk/orders/:orderId/approve")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async approveOrder(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("orderId") orderId: string,
    @Body() body: { notes?: string },
  ) {
    await this.riskService.approveOrder(orderId, req.user.id, body.notes);
    return { success: true };
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Put("risk/orders/:orderId/reject")
  async rejectOrder(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("orderId") orderId: string,
    @Body() body: { reason: string },
  ) {
    await this.riskService.rejectOrder(orderId, req.user.id, body.reason);
    return { success: true };
  }

  // ============================================================================
  // WATCHLIST
  // ============================================================================
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any

  @Post("watchlist/:userId")
  async addToWatchlist(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("userId") userId: string,
    @Body() body: { reason: string },
  ) {
    await this.fraudService.addToWatchlist(userId, body.reason, req.user.id);
    return { success: true };
  }

  @Put("watchlist/:userId/remove")
  async removeFromWatchlist(@Param("userId") userId: string) {
    await this.fraudService.removeFromWatchlist(userId);
    return { success: true };
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  @Post("initialize-rules")
  async initializeRules() {
    await this.fraudService.initializeDefaultRules();
    return { success: true, message: "Fraud rules initialized" };
  }
}
