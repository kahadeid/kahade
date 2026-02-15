import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import { KYCStatus } from "@prisma/client";
import { PrismaService } from "@infrastructure/database/prisma.service";

/**
 * KYC Expiry Check Cron Job
 * Checks for expiring KYC documents and sends notifications to users.
 * Runs daily at 6 AM.
 */
@Injectable()
export class KycExpiryCheckCron {
  private readonly logger = new Logger(KycExpiryCheckCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async run() {
    this.logger.log("Starting KYC expiration check...");

    try {
      // Check for KYC expiring in 30 days
      await this.checkExpiringKyc(30, "30_DAYS");

      // Check for KYC expiring in 7 days
      await this.checkExpiringKyc(7, "7_DAYS");

      // Check for KYC expiring in 1 day
      await this.checkExpiringKyc(1, "1_DAY");

      // Check for already expired KYC
      await this.checkExpiredKyc();

      this.logger.log("KYC expiration check completed");
    } catch (error: unknown) {
      this.logger.error(`KYC expiry check failed: ${(error as Error).message}`);
    }
  }

  /**
   * Check for KYC documents expiring within specified days
   */
  private async checkExpiringKyc(
    daysUntilExpiry: number,
    notificationType: string,
  ): Promise<void> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysUntilExpiry);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find KYC submissions expiring on the target date
    const expiringKyc = await this.prisma.kYCSubmission.findMany({
      where: {
        expiresAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: KYCStatus.VERIFIED,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
          },
        },
      },
    });

    if (expiringKyc.length === 0) {
      this.logger.debug(`No KYC documents expiring in ${daysUntilExpiry} days`);
      return;
    }

    this.logger.log(
      `Found ${expiringKyc.length} KYC documents expiring in ${daysUntilExpiry} days`,
    );

    // Send notifications to users
    for (const kyc of expiringKyc) {
      try {
        // Check if notification already sent for this period
        const existingNotification = await this.prisma.notification.findFirst({
          where: {
            userId: kyc.userId,
            type: "KYC",
            metadata: {
              path: ["kycId"],
              equals: kyc.id,
            },
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
            },
          },
        });

        if (existingNotification) {
          this.logger.debug(`Notification already sent for KYC ${kyc.id}`);
          continue;
        }

        // Create notification message based on expiry period
        const { title, message } = this.getExpiryNotificationContent(
          daysUntilExpiry,
          kyc.expiresAt,
        );

        // Create in-app notification
        await this.prisma.notification.create({
          data: {
            userId: kyc.userId,
            type: "KYC",
            title,
            message,
            metadata: {
              kycId: kyc.id,
              expiresAt: kyc.expiresAt?.toISOString(),
              notificationType,
              daysUntilExpiry,
            },
          },
        });

        // Queue email notification
        await this.prisma.notificationQueue.create({
          data: {
            userId: kyc.userId,
            channel: "EMAIL",
            priority: daysUntilExpiry <= 7 ? "HIGH" : "NORMAL",
            title,
            body: this.getExpiryEmailContent(
              kyc.user.username || "User",
              daysUntilExpiry,
              kyc.expiresAt,
            ),
            data: {
              kycId: kyc.id,
              expiresAt: kyc.expiresAt?.toISOString(),
            },
            status: "PENDING",
          },
        });

        this.logger.log(
          `KYC expiry notification sent to user ${kyc.userId} (expires in ${daysUntilExpiry} days)`,
        );
      } catch (notifError: unknown) {
        this.logger.error(
          `Failed to send notification for KYC ${kyc.id}: ${(notifError as Error).message}`,
        );
      }
    }
  }

  /**
   * Check for already expired KYC documents
   */
  private async checkExpiredKyc(): Promise<void> {
    const now = new Date();

    // Find expired KYC that are still marked as verified
    const expiredKyc = await this.prisma.kYCSubmission.findMany({
      where: {
        expiresAt: { lt: now },
        status: KYCStatus.VERIFIED,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (expiredKyc.length === 0) {
      return;
    }

    this.logger.log(`Found ${expiredKyc.length} expired KYC documents`);

    for (const kyc of expiredKyc) {
      try {
        // Update KYC status to rejected (since EXPIRED doesn't exist in enum)
        // In production, you might want to add EXPIRED to the enum
        await this.prisma.kYCSubmission.update({
          where: { id: kyc.id },
          data: {
            status: KYCStatus.REJECTED,
            rejectionReason: "KYC document has expired",
          },
        });

        // Update user KYC status
        await this.prisma.user.update({
          where: { id: kyc.userId },
          data: { kycStatus: KYCStatus.NONE },
        });

        // Send expiration notification
        await this.prisma.notification.create({
          data: {
            userId: kyc.userId,
            type: "KYC",
            title: "Verifikasi KYC Anda Telah Kedaluwarsa",
            message:
              "Dokumen KYC Anda telah kedaluwarsa. Silakan perbarui verifikasi untuk melanjutkan menggunakan semua fitur.",
            metadata: {
              kycId: kyc.id,
              expiredAt: kyc.expiresAt?.toISOString(),
              notificationType: "EXPIRED",
            },
          },
        });

        // Queue email notification
        await this.prisma.notificationQueue.create({
          data: {
            userId: kyc.userId,
            channel: "EMAIL",
            priority: "HIGH",
            title: "Verifikasi KYC Anda Telah Kedaluwarsa",
            body: this.getExpiredEmailContent(kyc.user.username || "User"),
            data: {
              kycId: kyc.id,
              expiredAt: kyc.expiresAt?.toISOString(),
            },
            status: "PENDING",
          },
        });

        this.logger.log(
          `KYC ${kyc.id} marked as expired for user ${kyc.userId}`,
        );
      } catch (error: unknown) {
        this.logger.error(
          `Failed to process expired KYC ${kyc.id}: ${(error as Error).message}`,
        );
      }
    }
  }

  /**
   * Get notification content based on days until expiry
   */
  private _getExpiryNotificationContent(
    daysUntilExpiry: number,
    expiresAt: Date | null,
  ): { title: string; message: string } {
    const expiryDate = expiresAt ? this.formatDate(expiresAt) : "segera";

    if (daysUntilExpiry === 1) {
      return {
        title: "⚠️ KYC Akan Kedaluwarsa Besok!",
        message: `Verifikasi KYC Anda akan kedaluwarsa besok (${expiryDate}). Segera perbarui untuk menghindari pembatasan akses.`,
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        title: "⏰ KYC Akan Segera Kedaluwarsa",
        message: `Verifikasi KYC Anda akan kedaluwarsa dalam ${daysUntilExpiry} hari (${expiryDate}). Perbarui sekarang untuk menghindari gangguan layanan.`,
      };
    } else {
      return {
        title: "📋 Pengingat Perpanjangan KYC",
        message: `Verifikasi KYC Anda akan kedaluwarsa dalam ${daysUntilExpiry} hari (${expiryDate}). Pertimbangkan untuk memperbarui lebih awal.`,
      };
    }
  }

  /**
   * Get email content for expiring KYC
   */
  private _getExpiryEmailContent(
    username: string,
    daysUntilExpiry: number,
    expiresAt: Date | null,
  ): string {
    const expiryDate = expiresAt ? this.formatDate(expiresAt) : "segera";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pengingat KYC</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${daysUntilExpiry <= 7 ? "#dc3545" : "#667eea"}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: ${daysUntilExpiry <= 7 ? "#fff3cd" : "#e3f2fd"}; border-left: 4px solid ${daysUntilExpiry <= 7 ? "#ffc107" : "#2196f3"}; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${daysUntilExpiry <= 7 ? "⚠️ Perhatian: KYC Akan Kedaluwarsa" : "📋 Pengingat Perpanjangan KYC"}</h1>
          </div>
          <div class="content">
            <p>Halo <strong>${username}</strong>,</p>

            <div class="alert-box">
              <strong>Verifikasi KYC Anda akan kedaluwarsa dalam ${daysUntilExpiry} hari</strong>
              <p style="margin: 10px 0 0 0;">Tanggal kedaluwarsa: <strong>${expiryDate}</strong></p>
            </div>

            <p>Untuk memastikan Anda dapat terus menggunakan semua fitur Kahade tanpa gangguan, silakan perbarui verifikasi KYC Anda sebelum tanggal kedaluwarsa.</p>

            <p><strong>Apa yang terjadi jika KYC kedaluwarsa?</strong></p>
            <ul>
              <li>Batas transaksi akan dikurangi</li>
              <li>Beberapa fitur mungkin tidak tersedia</li>
              <li>Penarikan dana mungkin tertunda</li>
            </ul>

            <p style="text-align: center;">
              <a href="${this.getAppUrl()}/dashboard/kyc" class="cta-button">Perbarui KYC Sekarang</a>
            </p>

            <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh sistem Kahade.</p>
            <p>© ${new Date().getFullYear()} Kahade. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get email content for expired KYC
   */
  private _getExpiredEmailContent(username: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KYC Kedaluwarsa</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚫 Verifikasi KYC Telah Kedaluwarsa</h1>
          </div>
          <div class="content">
            <p>Halo <strong>${username}</strong>,</p>

            <div class="alert-box">
              <strong>Verifikasi KYC Anda telah kedaluwarsa</strong>
              <p style="margin: 10px 0 0 0;">Beberapa fitur akun Anda mungkin terbatas sampai Anda memperbarui verifikasi.</p>
            </div>

            <p><strong>Dampak KYC kedaluwarsa:</strong></p>
            <ul>
              <li>Batas transaksi dikurangi ke level dasar</li>
              <li>Penarikan dana memerlukan verifikasi ulang</li>
              <li>Beberapa fitur premium tidak tersedia</li>
            </ul>

            <p>Untuk memulihkan akses penuh ke akun Anda, silakan perbarui verifikasi KYC sesegera mungkin.</p>

            <p style="text-align: center;">
              <a href="${this.getAppUrl()}/dashboard/kyc" class="cta-button">Perbarui KYC Sekarang</a>
            </p>

            <p>Jika Anda memiliki pertanyaan atau memerlukan bantuan, silakan hubungi tim support kami.</p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh sistem Kahade.</p>
            <p>© ${new Date().getFullYear()} Kahade. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format date to Indonesian locale
   */
  private _formatDate(date: Date): string {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Get app URL from environment or default
   */
  private _getAppUrl(): string {
    return process.env.APP_URL || "https://app.kahade.id";
  }
}
