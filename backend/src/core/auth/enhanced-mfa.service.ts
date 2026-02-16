import { ConfigService } from '@nestjs/config';
import { EmailService } from '@integrations/email/email.service';
import { MFAMethod } from '@prisma/client';
import { MfaService } from './mfa.service';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { SmsService } from '@integrations/sms/sms.service';
import * as crypto from 'crypto';
import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';

export interface MFASetupResult {
  method: MFAMethod;
  qrCodeDataURL?: string;
  backupCodes?: string[];
  message: string;
}

export interface MFAVerifyResult {
  success: boolean;
  method: MFAMethod;
  remainingAttempts?: number;
  message: string;
}

@Injectable()
export class EnhancedMFAService {
  private readonly logger = new Logger(EnhancedMFAService.name);
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_OTP_ATTEMPTS = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mfaService: MfaService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Getmfastatus
   */
  async getMFAStatus(userId: string): Promise<{
    enabled: boolean;
    methods: {
      totp: boolean;
      sms: boolean;
      email: boolean;
      webauthn: boolean;
    };
    preferredMethod: MFAMethod | null;
    backupCodesRemaining: number;
  }> {
    try {
      let userMfa = await this.prisma.userMFA.findUnique({
        where: { userId },
        include: {
          webauthnCredentials: {
            where: { isActive: true },
          },
        },
      });

      if (!userMfa) {
        userMfa = await this.prisma.userMFA.create({
          data: { userId },
          include: { webauthnCredentials: true },
        });
      }

      const backupCodes = (userMfa.backupCodes as string[]) || [];
      const backupCodesRemaining = backupCodes.length - userMfa.backupCodesUsed;

      return {
        enabled: userMfa.status === 'ENABLED',
        methods: {
          totp: userMfa.totpEnabled,
          sms: userMfa.smsEnabled,
          email: userMfa.emailEnabled,
          webauthn: userMfa.webauthnCredentials.length > 0,
        },
        preferredMethod: userMfa.preferredMethod,
        backupCodesRemaining,
      };
    } catch (error) {
      this.logger.error(`Error in getMFAStatus: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async initializeTOTPSetup(
    userId: string,
    userEmail: string,
  ): Promise<MFASetupResult> {
    const secret = this.mfaService.generateSecret();
    const qrCode = await this.mfaService.generateQRCode(userEmail, secret);
    const backupCodes = await this.mfaService.generateBackupCodes(10);

    await this.prisma.userMFA.upsert({
      where: { userId },
      update: {
        totpSecret: secret,
        status: 'PENDING_SETUP',
      },
      create: {
        userId,
        totpSecret: secret,
        status: 'PENDING_SETUP',
      },
    });

    return {
      method: 'TOTP',
      qrCodeDataURL: qrCode,
      backupCodes,
      message: 'Scan the QR code with your authenticator app',
    };
  }

  async confirmTOTPSetup(
    userId: string,
    code: string,
  ): Promise<MFASetupResult> {
    const userMfa = await this.prisma.userMFA.findUnique({
      where: { userId },
    });

    if (!userMfa || !userMfa.totpSecret) {
      throw new BadRequestException('TOTP setup not initialized');
    }

    const isValid = this.mfaService.verifyToken(code, userMfa.totpSecret);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    const backupCodes = await this.mfaService.generateBackupCodes(10);
    const hashedBackupCodes = await this.mfaService.hashBackupCodes(backupCodes);

    await this.prisma.userMFA.update({
      where: { userId },
      data: {
        totpEnabled: true,
        totpVerifiedAt: new Date(),
        status: 'ENABLED',
        enabledAt: new Date(),
        backupCodes: hashedBackupCodes,
        backupCodesGeneratedAt: new Date(),
        preferredMethod: 'TOTP',
      },
    });

    this.logger.log(`TOTP enabled for user ${userId}`);

    return {
      method: 'TOTP',
      backupCodes,
      message: 'TOTP has been enabled. Save your backup codes securely.',
    };
  }

  async verifyMFA(
    userId: string,
    code: string,
    method?: MFAMethod,
  ): Promise<MFAVerifyResult> {
    const userMfa = await this.prisma.userMFA.findUnique({
      where: { userId },
    });

    if (!userMfa || userMfa.status !== 'ENABLED') {
      throw new BadRequestException('MFA is not enabled');
    }

    const methodToUse = method || userMfa.preferredMethod || 'TOTP';

    if (methodToUse === 'TOTP' && userMfa.totpSecret) {
      const isValid = this.mfaService.verifyToken(code, userMfa.totpSecret);

      if (isValid) {
        await this.prisma.userMFA.update({
          where: { userId },
          data: { lastUsedAt: new Date() },
        });
      }

      return {
        success: isValid,
        method: 'TOTP',
        message: isValid ? 'Verification successful' : 'Invalid code',
      };
    }

    throw new BadRequestException('Unsupported MFA method');
  }

  async disableMFA(
    userId: string,
    code: string,
    method: MFAMethod = 'TOTP',
  ): Promise<void> {
    const verifyResult = await this.verifyMFA(userId, code, method);

    if (!verifyResult.success) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.userMFA.update({
      where: { userId },
      data: {
        status: 'DISABLED',
        totpEnabled: false,
        totpSecret: null,
        smsEnabled: false,
        emailEnabled: false,
        backupCodes: undefined,
        preferredMethod: null,
      },
    });

    this.logger.log(`MFA disabled for user ${userId}`);
  }
}
