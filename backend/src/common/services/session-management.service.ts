import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';



/**
 * Session Management Service (HIGH-006)
 *
 * Handles:
 * - Session creation with proper expiry
 * - Session validation with activity tracking
 * - Automatic session cleanup
 * - Session security (IP/User-Agent tracking)
 * - Max lifetime enforcement
 */
@Injectable()
export class SessionManagementService {
  private readonly logger = new Logger(SessionManagementService.name);

  // Session configuration
  private readonly SESSION_EXPIRY_MINUTES = 15; // Sliding window
  private readonly SESSION_MAX_LIFETIME_HOURS = 24; // Absolute max
  private readonly SESSION_INACTIVITY_DAYS = 30; // Cleanup after

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session
   */
  async createSession(data: {
    userId: string;
    token: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<{
    id: string;
    expiresAt: Date;
    maxLifetime: Date;
  }> {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.SESSION_EXPIRY_MINUTES * 60 * 1000,
    );
    const maxLifetime = new Date(
      now.getTime() + this.SESSION_MAX_LIFETIME_HOURS * 60 * 60 * 1000,
    );

    // Invalidate old sessions for this user (optional - for single session per user)
    // Await this.invalidateUserSessions(data.userId);

    const session = await this.prisma.session.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt,
        maxLifetime,
        lastActivityAt: now,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        isActive: true,
      },
    });

    this.logger.log(
      `Session created for user ${data.userId} from ${data.ipAddress}`,
    );

    return {
      id: session.id,
      expiresAt: session.expiresAt,
      maxLifetime: session.maxLifetime,
    };
  }

  /**
   * Validate and refresh session
   */
  async validateSession(
    sessionId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{
    valid: boolean;
    userId?: string;
    reason?: string;
  }> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    if (!session.isActive) {
      return { valid: false, reason: 'Session inactive' };
    }

    const now = new Date();

    // Check sliding window expiry
    if (session.expiresAt < now) {
      await this.invalidateSession(sessionId);
      return { valid: false, reason: 'Session expired' };
    }

    // Check max lifetime
    if (session.maxLifetime < now) {
      await this.invalidateSession(sessionId);
      return { valid: false, reason: 'Session max lifetime reached' };
    }

    // Security: Check IP address match (optional - can be disabled for mobile)
    if (
      process.env.SESSION_BIND_IP === 'true' &&
      session.ipAddress !== ipAddress
    ) {
      this.logger.warn(
        `Session ${sessionId}: IP mismatch. Expected ${session.ipAddress}, got ${ipAddress}`,
      );
      await this.invalidateSession(sessionId);
      return { valid: false, reason: 'IP address changed' };
    }

    // Refresh session (sliding window)
    const newExpiresAt = new Date(
      now.getTime() + this.SESSION_EXPIRY_MINUTES * 60 * 1000,
    );

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        expiresAt: newExpiresAt,
        lastActivityAt: now,
      },
    });

    return {
      valid: true,
      userId: session.userId,
    };
  }

  /**
   * Invalidate a specific session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    try {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });

    this.logger.log(`Session ${sessionId} invalidated`);
  }

  /**
   * Invalidate all sessions for a user (logout all devices)
   */
  async invalidateUserSessions(userId: string): Promise<number> {
    try {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: { isActive: false },
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });

    this.logger.log(
      `Invalidated ${result.count} sessions for user ${userId}`,
    );

    return result.count;
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        createdAt: true,
        lastActivityAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: {
        lastActivityAt: 'desc',
      },
    });
  }

  /**
   * Cleanup expired sessions (runs daily)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  /**
   * Cleanupexpiredsessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
    const cutoffDate = new Date(
      Date.now() - this.SESSION_INACTIVITY_DAYS * 24 * 60 * 60 * 1000,
    );

    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { isActive: false },
          { expiresAt: { lt: new Date() } },
          { maxLifetime: { lt: new Date() } },
          { lastActivityAt: { lt: cutoffDate } },
        ],
      },
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    });

    this.logger.log(`Cleaned up ${result.count} expired sessions`);
  }
}
