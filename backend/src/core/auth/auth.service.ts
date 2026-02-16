import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '@integrations/email/email.service';
import { HashUtil } from '@common/utils/hash.util';
import { MfaService } from './mfa.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { nanoid } from 'nanoid';

interface UserWithoutPassword {
  id: string;
  email: string;
  username: string;
  phone: string | null;
  emailVerifiedAt: Date | null;
  isAdmin: boolean;
  role: string;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginResult {
  user: UserWithoutPassword;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mfaService: MfaService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserWithoutPassword> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await HashUtil.verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (await HashUtil.needsRehash(user.passwordHash)) {
        const newHash = await HashUtil.hashPassword(password);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash },
        });
      }

      const { passwordHash, ...result } = user;
      return result as UserWithoutPassword;
    } catch (error) {
      this.logger.error(`Error in validateUser: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async register(data: {
    email: string;
    username: string;
    password: string;
    phone?: string;
  }): Promise<{ user: Omit<any, 'passwordHash'>; message: string }> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email or username already exists');
    }

    const passwordHash = await HashUtil.hashPassword(data.password);
    const verificationToken = nanoid(32);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        phone: data.phone,
        emailVerificationToken: verificationToken,
        emailVerifiedAt: null,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;
    await this.emailService.sendEmail(
      user.email,
      'Verify Your Kahade Account',
      `
        <h1>Welcome to Kahade!</h1>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationLink}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, you can safely ignore this email.</p>
      `,
    ).catch(() => {
      // Non-blocking: log but don't fail registration
    });

    return {
      user: userWithoutPassword,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(
    data: { email: string; password: string },
    ip?: string,
    userAgent?: string,
  ): Promise<LoginResult> {
    const user = await this.validateUser(data.email, data.password);

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = this.configService.get('security.jwt.expiresIn') || '15m';

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('security.jwt.refreshSecret'),
      expiresIn: this.configService.get('security.jwt.refreshExpiresIn'),
    });

    const refreshHash = await HashUtil.hashPassword(refreshToken);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshHash,
        ipAddress: ip || 'unknown',
        userAgent: userAgent || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async adminLogin(
    data: { email: string; password: string },
    ip?: string,
    userAgent?: string,
  ): Promise<LoginResult> {
    const result = await this.login(data, ip, userAgent);

    if (!result.user.isAdmin) {
      throw new UnauthorizedException('Access denied. Admin privileges required.');
    }

    return result;
  }

  async refreshToken(refreshToken: string, actualRefreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('security.jwt.refreshSecret'),
      });

      const sessions = await this.prisma.session.findMany({
        where: {
          userId: payload.sub,
          expiresAt: { gt: new Date() },
        },
      });

      let validSession = null;
      for (const session of sessions) {
        const isValid = await HashUtil.verifyPassword(actualRefreshToken, session.refreshHash);
        if (isValid) {
          validSession = session;
          break;
        }
      }

      if (!validSession) {
        throw new UnauthorizedException('Invalid session');
      }

      const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
      const expiresIn = this.configService.get('security.jwt.expiresIn') || '15m';

      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken,
        expiresIn,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<{ message: string }> {
    try {
      const sessions = await this.prisma.session.findMany({
        where: { userId },
      });

      for (const session of sessions) {
        const isValid = await HashUtil.verifyPassword(refreshToken, session.refreshHash);
        if (isValid) {
          await this.prisma.session.delete({
            where: { id: session.id },
          });
          break;
        }
      }

      return { message: 'Logout successful' };
    } catch (error) {
      this.logger.error(`Error in logout: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async logoutAll(userId: string, _currentToken: string): Promise<{ message: string }> {
    try {
      await this.prisma.session.deleteMany({
        where: { userId },
      });

      return { message: 'All sessions terminated' };
    } catch (error) {
      this.logger.error(`Error in logoutAll: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        emailVerifiedAt: true,
        isAdmin: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { message: 'If the email exists, a reset link has been sent' };
      }

      const resetToken = nanoid(32);
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetTokenExpiry,
        },
      });

      const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
      await this.emailService.sendEmail(
        user.email,
        'Reset Your Kahade Password',
        `
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetLink}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email. Your password will not be changed.</p>
      `,
      ).catch(() => {});

      return { message: 'If the email exists, a reset link has been sent' };
    } catch (error) {
      this.logger.error(`Error in forgotPassword: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
        },
      });

      return { valid: !!user };
    } catch (error) {
      this.logger.error(`Error in validateResetToken: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      const passwordHash = await HashUtil.hashPassword(newPassword);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      await this.prisma.session.deleteMany({
        where: { userId: user.id },
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      this.logger.error(`Error in resetPassword: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await HashUtil.verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await HashUtil.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { emailVerificationToken: token },
      });

      if (!user) {
        throw new BadRequestException('Invalid verification token');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: new Date(),
          emailVerificationToken: null,
        },
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      this.logger.error(`Error in verifyEmail: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { message: 'If the email exists, a verification email has been sent' };
      }

      if (user.emailVerifiedAt) {
        throw new BadRequestException('Email is already verified');
      }

      const verificationToken = nanoid(32);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerificationToken: verificationToken },
      });

      const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;
      await this.emailService.sendEmail(
        user.email,
        'Verify Your Kahade Account',
        `
        <h1>Email Verification</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationLink}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
      ).catch(() => {});

      return { message: 'If the email exists, a verification email has been sent' };
    } catch (error) {
      this.logger.error(`Error in resendVerificationEmail: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async setupMfa(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const secret = this.mfaService.generateSecret();
      const qrCode = await this.mfaService.generateQRCode(user.email, secret);

      await this.prisma.user.update({
        where: { id: userId },
        data: { totpSecretEnc: secret },
      });

      return { secret, qrCode };
    } catch (error) {
      this.logger.error(`Error in setupMfa: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async enableMfa(userId: string, code: string): Promise<{ message: string; backupCodes: string[] }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.totpSecretEnc) {
        throw new BadRequestException('MFA setup not initiated');
      }

      const isValid = this.mfaService.verifyToken(code, user.totpSecretEnc);
      if (!isValid) {
        throw new BadRequestException('Invalid MFA code');
      }

      const backupCodes = await this.mfaService.generateBackupCodes(10);
      const hashedBackupCodes = await this.mfaService.hashBackupCodes(backupCodes);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: true,
          backupCodesHash: hashedBackupCodes,
        },
      });

      return {
        message: 'MFA enabled successfully',
        backupCodes,
      };
    } catch (error) {
      this.logger.error(`Error in enableMfa: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async disableMfa(
    userId: string,
    password: string,
    code: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await HashUtil.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    if (user.totpSecretEnc) {
      const isCodeValid = this.mfaService.verifyToken(code, user.totpSecretEnc);
      if (!isCodeValid) {
        throw new BadRequestException('Invalid MFA code');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        totpSecretEnc: null,
        backupCodesHash: Prisma.DbNull,
      },
    });

    return { message: 'MFA disabled successfully' };
  }

  async listSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string): Promise<{ message: string }> {
    try {
      await this.prisma.session.delete({
        where: {
          id: sessionId,
          userId,
        },
      });

      return { message: 'Session revoked' };
    } catch (error) {
      this.logger.error(`Error in revokeSession: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async revokeAllSessions(userId: string): Promise<{ message: string }> {
    try {
      await this.prisma.session.deleteMany({
        where: { userId },
      });

      return { message: 'All sessions revoked' };
    } catch (error) {
      this.logger.error(`Error in revokeAllSessions: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
