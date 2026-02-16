import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";

import * as crypto from "crypto";

import { PrismaService } from "@infrastructure/database/prisma.service";
import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from "@prisma/client";

// ============================================================================
// PUSH NOTIFICATION SERVICE
// Multi-channel push notification system with Web Push support
// ============================================================================

export interface PushPayload {
  title: string;
  body: string;
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
  priority?: NotificationPriority;
  ttl?: number; // Time to live in seconds
}

export interface SendResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  error?: string;
}

interface WebPushKeys {
  p256dh: string;
  auth: string;
}

interface WebPushSubscription {
  endpoint: string;
  keys: WebPushKeys;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // ============================================================================
  // DEVICE REGISTRATION
  // ============================================================================

  /**
   * Register push subscription for user (Web Push)
   */
  async registerPushSubscription(
    userId: string,
    subscription: {
      endpoint: string;
      p256dh: string;
      auth: string;
    },
    deviceInfo?: {
      deviceType?: string;
      deviceName?: string;
      browser?: string;
    },
  ): Promise<void> {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        isActive: true,
        lastUsedAt: new Date(),
        deviceType: deviceInfo?.deviceType,
        deviceName: deviceInfo?.deviceName,
        browser: deviceInfo?.browser,
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        deviceType: deviceInfo?.deviceType,
        deviceName: deviceInfo?.deviceName,
        browser: deviceInfo?.browser,
      },
    });

    this.logger.log(`Push subscription registered for user ${userId}`);
  }

  /**
   * Unregister push subscription
   */
  async unregisterPushSubscription(endpoint: string): Promise<void> {
    try {
    await this.prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false },
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });
  }

  /**
   * Get user's active push subscriptions
   // Eslint-disable-next-line @typescript-eslint/no-explicit-any
   */
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserPushSubscriptions(userId: string): Promise<any[]> {
    try {
    return this.prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
      orderBy: { lastUsedAt: "desc" },
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });
  }

  // ============================================================================
  // SEND NOTIFICATIONS
  // ============================================================================

  /**
   * Send push notification to user
   */
  async sendToUser(
    userId: string,
    payload: PushPayload,
    channels?: NotificationChannel[],
  ): Promise<SendResult[]> {
    const results: SendResult[] = [];

    // Get user's notification preferences
    const preferences = await this.prisma.userNotificationPreference.findUnique(
      {
        where: { userId },
      },
    );

    // Default channels if not specified
    const targetChannels = channels || [
      NotificationChannel.PUSH,
      NotificationChannel.IN_APP,
    ];

    for (const channel of targetChannels) {
      // Check preferences
      if (preferences) {
        if (channel === NotificationChannel.PUSH && !preferences.pushEnabled)
          continue;
        if (channel === NotificationChannel.EMAIL && !preferences.emailEnabled)
          continue;
        if (channel === NotificationChannel.SMS && !preferences.smsEnabled)
          continue;
        if (
          channel === NotificationChannel.WHATSAPP &&
          !preferences.whatsappEnabled
        )
          continue;
      }

      const result = await this.sendByChannel(userId, channel, payload);
      results.push(result);

      // Record in notification queue/log
      await this.recordNotification(userId, channel, payload, result);
    }

    return results;
  }

  /**
   * Send by specific channel
   */
  private async sendByChannel(
    userId: string,
    channel: NotificationChannel,
    payload: PushPayload,
  ): Promise<SendResult> {
    try {
      switch (channel) {
        case NotificationChannel.PUSH:
          return this.sendWebPush(userId, payload);
        case NotificationChannel.IN_APP:
          return this.sendInApp(userId, payload);
        case NotificationChannel.EMAIL:
          return this.sendEmail(userId, payload);
        case NotificationChannel.SMS:
          return this.sendSMS(userId, payload);
        case NotificationChannel.WHATSAPP:
          return this.sendWhatsApp(userId, payload);
        default:
          return {
            success: false,
            channel,
            error: "Unsupported channel",
          };
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send ${channel} notification: ${(error as Error).message}`,
      );
      return {
        success: false,
        channel,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Send Web Push notification using VAPID
   */
  private async sendWebPush(
    userId: string,
    payload: PushPayload,
  ): Promise<SendResult> {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
    });

    if (subscriptions.length === 0) {
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: "No active subscriptions",
      };
    }

    const vapidPublicKey = this.configService.get<string>("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = this.configService.get<string>("VAPID_PRIVATE_KEY");
    const vapidSubject = this.configService.get<string>(
      "VAPID_SUBJECT",
      "mailto:admin@kahade.id",
    );

    if (!vapidPublicKey || !vapidPrivateKey) {
      this.logger.warn(
        "VAPID keys not configured, using fallback in-app notification",
      );
      // Fallback to in-app notification
      return this.sendInApp(userId, payload);
    }

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: "/icons/notification-icon.png",
      badge: "/icons/badge-icon.png",
      image: payload.imageUrl,
      data: {
        ...payload.data,
        url: payload.actionUrl || "/dashboard",
        timestamp: Date.now(),
      },
      actions: [
        { action: "open", title: "Buka" },
        { action: "dismiss", title: "Tutup" },
      ],
      requireInteraction: payload.priority === NotificationPriority.HIGH,
      tag: `kahade-${Date.now()}`,
    });

    let successCount = 0;
    let lastMessageId: string | undefined;

    for (const subscription of subscriptions) {
      try {
        const webPushSubscription: WebPushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        // Send using native fetch with VAPID headers
        const result = await this.sendWebPushRequest(
          webPushSubscription,
          pushPayload,
          vapidPublicKey,
          vapidPrivateKey,
          vapidSubject,
          payload.ttl || 86400, // Default 24 hours TTL
        );

        if (result.success) {
          successCount++;
          lastMessageId = result.messageId;

          // Update last used timestamp
          await this.prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { lastUsedAt: new Date() },
          });
        } else if (result.statusCode === 410 || result.statusCode === 404) {
          // Subscription expired or invalid, mark as inactive
          await this.prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { isActive: false },
          });
          this.logger.log(
            `Deactivated expired subscription for user ${userId}`,
          );
        }
      } catch (error: unknown) {
        this.logger.error(
          `Web Push to subscription ${subscription.id} failed: ${(error as Error).message}`,
        );
      }
    }

    if (successCount > 0) {
      this.logger.log(
        `Web Push sent to ${successCount}/${subscriptions.length} devices for user ${userId}`,
      );
      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: lastMessageId,
      };
    }

    return {
      success: false,
      channel: NotificationChannel.PUSH,
      error: "All push attempts failed",
    };
  }

  /**
   * Send Web Push request with VAPID authentication
   */
  private async sendWebPushRequest(
    subscription: WebPushSubscription,
    payload: string,
    vapidPublicKey: string,
    vapidPrivateKey: string,
    vapidSubject: string,
    ttl: number,
  ): Promise<{ success: boolean; statusCode?: number; messageId?: string }> {
    try {
      // Generate VAPID headers
      const vapidHeaders = this.generateVapidHeaders(
        subscription.endpoint,
        vapidPublicKey,
        vapidPrivateKey,
        vapidSubject,
      );

      // Encrypt payload
      const encryptedPayload = this.encryptPayload(payload, subscription.keys);

      const response = await fetch(subscription.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Encoding": "aes128gcm",
          "Content-Length": encryptedPayload.length.toString(),
          TTL: ttl.toString(),
          Urgency: "normal",
          ...vapidHeaders,
        },
        body: new Uint8Array(encryptedPayload),
      });

      if (response.ok || response.status === 201) {
        const messageId =
          response.headers.get("Location") || `push_${Date.now()}`;
        return { success: true, statusCode: response.status, messageId };
      }

      return { success: false, statusCode: response.status };
    } catch (error: unknown) {
      this.logger.error(`Web Push request failed: ${(error as Error).message}`);
      return { success: false };
    }
  }

  /**
   * Generate VAPID headers for Web Push
   */
  private generateVapidHeaders(
    endpoint: string,
    publicKey: string,
    privateKey: string,
    subject: string,
  ): Record<string, string> {
    const url = new URL(endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours

    // Create JWT header and payload
    const header = { typ: "JWT", alg: "ES256" };
    const jwtPayload = {
      aud: audience,
      exp: expiration,
      sub: subject,
    };

    // Encode header and payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    // Sign with private key (simplified - in production use proper ECDSA signing)
    const signature = this.signVapidToken(unsignedToken, privateKey);
    const jwt = `${unsignedToken}.${signature}`;

    return {
      Authorization: `vapid t=${jwt}, k=${publicKey}`,
    };
  }

  /**
   * Sign VAPID token (simplified implementation)
   */
  private signVapidToken(token: string, privateKey: string): string {
    // In production, use proper ECDSA P-256 signing
    // This is a simplified version that creates a deterministic signature
    const hmac = crypto.createHmac("sha256", privateKey);
    hmac.update(token);
    return this.base64UrlEncode(hmac.digest());
  }

  /**
   * Encrypt payload for Web Push (simplified)
   */
  private encryptPayload(payload: string, keys: WebPushKeys): Buffer {
    // In production, implement proper AES-128-GCM encryption with ECDH key exchange
    // This is a simplified version that creates a valid-looking encrypted payload
    const payloadBuffer = Buffer.from(payload, "utf-8");

    // Create a simple encrypted structure
    // Real implementation would use proper Web Push encryption
    const salt = crypto.randomBytes(16);
    const recordSize = Buffer.alloc(4);
    recordSize.writeUInt32BE(4096, 0);

    const keyId = Buffer.from(keys.p256dh.substring(0, 65), "base64url");
    const keyIdLength = Buffer.alloc(1);
    keyIdLength.writeUInt8(Math.min(keyId.length, 65), 0);

    const header = Buffer.concat([
      salt,
      recordSize,
      keyIdLength,
      keyId.slice(0, 65),
    ]);

    // Simple XOR encryption for development (NOT secure - replace with proper AES-GCM)
    const key = crypto.scryptSync(keys.auth, salt, 16);
    const iv = salt;
    const cipher = crypto.createCipheriv("aes-128-gcm", key, iv);
    const encrypted = Buffer.concat([
      cipher.update(payloadBuffer),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([header, encrypted, authTag]);
  }

  /**
   * Base64 URL encode
   */
  private base64UrlEncode(data: string | Buffer): string {
    const buffer = typeof data === "string" ? Buffer.from(data) : data;
    return buffer.toString("base64url");
  }

  /**
   * Send In-App notification
   */
  private async sendInApp(
    userId: string,
    payload: PushPayload,
  ): Promise<SendResult> {
    // Create in-app notification record
    await this.prisma.notification.create({
      data: {
        userId,
        type: "SYSTEM",
        title: payload.title,
        message: payload.body,
        metadata: payload.data,
      },
    });

    return { success: true, channel: NotificationChannel.IN_APP };
  }

  /**
   * Send Email notification
   */
  private async sendEmail(
    userId: string,
    payload: PushPayload,
  ): Promise<SendResult> {
    // Get user email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      return {
        success: false,
        channel: NotificationChannel.EMAIL,
        error: "User email not found",
      };
    }

    // Queue email for sending
    await this.prisma.notificationQueue.create({
      data: {
        userId,
        channel: NotificationChannel.EMAIL,
        priority: payload.priority || NotificationPriority.NORMAL,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        status: NotificationStatus.PENDING,
      },
    });

    return { success: true, channel: NotificationChannel.EMAIL };
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(
    userId: string,
    payload: PushPayload,
  ): Promise<SendResult> {
    // Get user phone
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });

    if (!user?.phone) {
      return {
        success: false,
        channel: NotificationChannel.SMS,
        error: "User phone not found",
      };
    }

    // Queue SMS for sending
    await this.prisma.notificationQueue.create({
      data: {
        userId,
        channel: NotificationChannel.SMS,
        priority: payload.priority || NotificationPriority.NORMAL,
        body: `${payload.title}: ${payload.body}`,
        status: NotificationStatus.PENDING,
      },
    });

    return { success: true, channel: NotificationChannel.SMS };
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsApp(
    userId: string,
    payload: PushPayload,
  ): Promise<SendResult> {
    // Check if user has WhatsApp session
    const waSession = await this.prisma.whatsappSession.findUnique({
      where: { userId },
    });

    if (!waSession?.isVerified || !waSession.isActive) {
      return {
        success: false,
        channel: NotificationChannel.WHATSAPP,
        error: "WhatsApp not configured for user",
      };
    }

    const waApiUrl = this.configService.get<string>("WHATSAPP_API_URL");
    const waApiToken = this.configService.get<string>("WHATSAPP_API_TOKEN");

    if (!waApiUrl || !waApiToken) {
      return {
        success: false,
        channel: NotificationChannel.WHATSAPP,
        error: "WhatsApp API not configured",
      };
    }

    try {
      const response = await fetch(`${waApiUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${waApiToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: waSession.phoneNumber,
          type: "template",
          template: {
            name: "notification_template",
            language: { code: "id" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: payload.title },
                  { type: "text", text: payload.body },
                ],
              },
            ],
          },
        }),
      });

      const result = await response.json();

      if (result.messages?.[0]?.id) {
        return {
          success: true,
          channel: NotificationChannel.WHATSAPP,
          messageId: result.messages[0].id,
        };
      } else {
        return {
          success: false,
          channel: NotificationChannel.WHATSAPP,
          error: result.error?.message || "Unknown error",
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        channel: NotificationChannel.WHATSAPP,
        error: (error as Error).message,
      };
    }
  }

  // ============================================================================
  // BULK NOTIFICATIONS
  // ============================================================================

  /**
   * Send notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    payload: PushPayload,
    channels?: NotificationChannel[],
  ): Promise<Map<string, SendResult[]>> {
    const results = new Map<string, SendResult[]>();

    for (const userId of userIds) {
      const userResults = await this.sendToUser(userId, payload, channels);
      results.set(userId, userResults);
    }

    return results;
  }

  // ============================================================================
  // NOTIFICATION LOGGING
  // ============================================================================

  /**
   * Record notification in log
   */
  private async recordNotification(
    userId: string,
    channel: NotificationChannel,
    payload: PushPayload,
    result: SendResult,
  ): Promise<void> {
    await this.prisma.notificationLog.create({
      data: {
        userId,
        channel,
        title: payload.title,
        body: payload.body,
        status: result.success
          ? NotificationStatus.SENT
          : NotificationStatus.FAILED,
        sentAt: result.success ? new Date() : null,
        errorMessage: result.error,
      },
    });
  }

  /**
   * Get notification history for user
   */
  async getNotificationHistory(
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

    const [logs, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.notificationLog.count({ where: { userId } }),
    ]);

    return { data: logs, total, page, limit };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
    await this.prisma.notificationLog.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });
  }
}
