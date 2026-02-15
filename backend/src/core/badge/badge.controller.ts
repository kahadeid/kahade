
import {
import { BadgeService } from "./badge.service";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { ReputationService } from "./reputation.service";

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

@Controller("badges")
export class BadgeController {
  constructor(
    private readonly badgeService: BadgeService,
    private readonly reputationService: ReputationService,
  ) {}

  // ============================================================================
  // BADGE ENDPOINTS
  // ============================================================================

  @Get()
  async getAllBadges() {
    return this.badgeService.getAllBadges();
  }

  @Get("my")
  @UseGuards(JwtAuthGuard)
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMyBadges(@Request() req: Request) {
    return this.badgeService.getUserBadges(req.user.id);
  }

  @Get("user/:userId")
  async getUserBadges(@Param("userId") userId: string) {
    return this.badgeService.getDisplayedBadges(userId);
  }

  @Post("check")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @UseGuards(JwtAuthGuard)
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async checkAndAwardBadges(@Request() req: Request) {
    const awarded = await this.badgeService.checkAndAwardBadges(req.user.id);
    return { awarded };
  }

  @Put(":userBadgeId/display")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @UseGuards(JwtAuthGuard)
  async toggleBadgeDisplay(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("userBadgeId") userBadgeId: string,
    @Body() body: { isDisplayed: boolean },
  ) {
    await this.badgeService.toggleBadgeDisplay(
      req.user.id,
      userBadgeId,
      body.isDisplayed,
    );
    return { success: true };
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Put("reorder")
  @UseGuards(JwtAuthGuard)
  async reorderBadges(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Body() body: { badgeOrder: { userBadgeId: string; order: number }[] },
  ) {
    await this.badgeService.reorderBadges(req.user.id, body.badgeOrder);
    return { success: true };
  }

  // ============================================================================
  // REPUTATION ENDPOINTS
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // ============================================================================

  @Get("reputation/my")
  @UseGuards(JwtAuthGuard)
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMyReputation(@Request() req: Request) {
    return this.reputationService.getUserReputation(req.user.id);
  }

  @Get("reputation/user/:userId")
  async getUserReputation(@Param("userId") userId: string) {
    return this.reputationService.getUserReputation(userId);
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  @Get("reputation/history")
  @UseGuards(JwtAuthGuard)
  async getReputationHistory(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.reputationService.getReputationHistory(req.user.id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Get("leaderboard")
  async getLeaderboard(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.reputationService.getLeaderboard({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }
}
