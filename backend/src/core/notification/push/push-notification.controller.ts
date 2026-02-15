
import {
import {
import { AdminGuard } from "@common/guards/admin.guard";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { NotificationChannel } from "@prisma/client";

  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
  PushNotificationService,
  PushPayload,
} from "./push-notification.service";

@Controller("notifications/push")
@UseGuards(JwtAuthGuard)
export class PushNotificationController {
  constructor(private readonly pushService: PushNotificationService) {}

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  /**
   * Register push subscription (Web Push)
   */
  @Post("subscribe")
  async subscribe(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Body()
    body: {
      endpoint: string;
      p256dh: string;
      auth: string;
      deviceType?: string;
      deviceName?: string;
      browser?: string;
    },
  ) {
    await this.pushService.registerPushSubscription(
      req.user.id,
      {
        endpoint: body.endpoint,
        p256dh: body.p256dh,
        auth: body.auth,
      },
      {
        deviceType: body.deviceType,
        deviceName: body.deviceName,
        browser: body.browser,
      },
    );

    return { message: "Push subscription registered successfully" };
  }

  /**
   * Unregister push subscription
   */
  @Delete("unsubscribe")
  async unsubscribe(@Body() body: { endpoint: string }) {
    await this.pushService.unregisterPushSubscription(body.endpoint);
    return { message: "Push subscription removed successfully" };
  }

  /**
   * Get user's push subscriptions
   */
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Get("subscriptions")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getSubscriptions(@Request() req: Request) {
    return this.pushService.getUserPushSubscriptions(req.user.id);
  }

  // ============================================================================
  // NOTIFICATION HISTORY
  // ============================================================================

  /**
   * Get notification history
   */
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Get("history")
  async getHistory(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.pushService.getNotificationHistory(req.user.id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  /**
   * Mark notification as read
   */
  @Post(":id/read")
  async markAsRead(@Param("id") id: string) {
    await this.pushService.markAsRead(id);
    return { message: "Notification marked as read" };
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  /**
   * Send notification to users (Admin only)
   */
  @Post("admin/send")
  @UseGuards(AdminGuard)
  async sendNotification(
    @Body()
    body: {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      userIds: string[];
      title: string;
      body: string;
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?: Record<string, any>;
      imageUrl?: string;
      actionUrl?: string;
      channels?: NotificationChannel[];
    },
  ) {
    const payload: PushPayload = {
      title: body.title,
      body: body.body,
      data: body.data,
      imageUrl: body.imageUrl,
      actionUrl: body.actionUrl,
    };

    const results = await this.pushService.sendToUsers(
      body.userIds,
      payload,
      body.channels,
    );

    return {
      success: true,
      results: Object.fromEntries(results),
    };
  }

  // ============================================================================
  // TEST ENDPOINT (Development only)
  // ============================================================================

  /**
   // Eslint-disable-next-line @typescript-eslint/no-explicit-any
   * Send test notification to self
   */
  @Post("test")
  async sendTestNotification(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Body()
    body: {
      title?: string;
      body?: string;
      channels?: NotificationChannel[];
    },
  ) {
    const payload: PushPayload = {
      title: body.title || "Test Notification",
      body: body.body || "This is a test notification from Kahade",
    };

    const results = await this.pushService.sendToUser(
      req.user.id,
      payload,
      body.channels,
    );

    return { message: "Test notification sent", results };
  }
}
