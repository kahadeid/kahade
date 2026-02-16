import { HashUtil } from '@common/utils/hash.util';
import { MFAMethod, MFAStatus } from '@prisma/client';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { authenticator } from 'otplib';


import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly APP_NAME = 'Kahade';
  private readonly BACKUP_CODES_COUNT = 10;
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(private readonly prisma: PrismaService) {}

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Generateqrcode
   */
  async generateQRCode(email: string, secret: string): Promise<string> {
    try {
      const otpauth = authenticator.keyuri(email, this.APP_NAME, secret);
      return QRCode.toDataURL(otpauth);
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch {
      return false;
    }
  }

  /**
   * Generatebackupcodes
   */
  async generateBackupCodes(count: number = this.BACKUP_CODES_COUNT): Promise<string[]> {
    try {
      const codes: string[] = [];
      for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(8).toString('hex').toUpperCase();
        codes.push(code.slice(0, 4) + '-' + code.slice(4, 8));
      }
      return codes;
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Hashbackupcodes
   */
  async hashBackupCodes(codes: string[]): Promise<string[]> {
    try {
      return Promise.all(codes.map((code) => HashUtil.hashPassword(code)));
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getOrCreateUserMfa(userId: string) {
    let userMfa = await this.prisma.userMFA.findUnique({ where: { userId } });
    if (!userMfa) {
      userMfa = await this.prisma.userMFA.create({
        data: { userId, status: MFAStatus.DISABLED },
      });
    }
    return userMfa;
  }

  /**
   * Verifybackupcode
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const userMfa = await this.prisma.userMFA.findUnique({ where: { userId } });
      if (!userMfa || !userMfa.backupCodes) return false;
      const backupCodes = userMfa.backupCodes as string[];
      let matchedIndex = -1;
      for (let i = 0; i < backupCodes.length; i++) {
        if (await HashUtil.verifyPassword(code, backupCodes[i])) {
          matchedIndex = i;
          break;
        }
      }
      if (matchedIndex === -1) return false;
      const updatedCodes = backupCodes.filter((_, i) => i !== matchedIndex);
      await this.prisma.userMFA.update({
        where: { userId },
        data: { backupCodes: updatedCodes, backupCodesUsed: userMfa.backupCodesUsed + 1 },
      });
      return true;
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Getmfastatus
   */
  async getMFAStatus(userId: string): Promise<{ enabled: boolean; methods: string[]; backupCodesCount: number }> {
    try {
      const userMfa = await this.prisma.userMFA.findUnique({ where: { userId } });
      if (!userMfa) return { enabled: false, methods: [], backupCodesCount: 0 };
      const methods: string[] = [];
      if (userMfa.totpEnabled) methods.push('TOTP');
      if (userMfa.smsEnabled) methods.push('SMS');
      if (userMfa.emailEnabled) methods.push('EMAIL');
      const backupCodes = userMfa.backupCodes as string[] | null;
      return {
        enabled: userMfa.status === MFAStatus.ENABLED,
        methods,
        backupCodesCount: backupCodes?.length ?? 0,
      };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Initializetotpsetup
   */
  async initializeTOTPSetup(userId: string, email: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    try {
      const secret = this.generateSecret();
      const qrCode = await this.generateQRCode(email, secret);
      const backupCodes = await this.generateBackupCodes();
      const hashedBackupCodes = await this.hashBackupCodes(backupCodes);
      await this.prisma.userMFA.upsert({
        where: { userId },
        create: { userId, status: MFAStatus.PENDING_SETUP, totpSecret: secret, backupCodes: hashedBackupCodes, backupCodesGeneratedAt: new Date() },
        update: { status: MFAStatus.PENDING_SETUP, totpSecret: secret, backupCodes: hashedBackupCodes, backupCodesGeneratedAt: new Date() },
      });
      return { secret, qrCode, backupCodes };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Confirmtotpsetup
   */
  async confirmTOTPSetup(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const userMfa = await this.prisma.userMFA.findUnique({ where: { userId } });
      if (!userMfa || userMfa.status !== MFAStatus.PENDING_SETUP || !userMfa.totpSecret) {
        throw new BadRequestException('MFA TOTP setup not initiated');
      }
      if (!this.verifyToken(code, userMfa.totpSecret)) {
        return { success: false, message: 'Invalid TOTP code' };
      }
      await this.prisma.userMFA.update({
        where: { userId },
        data: { status: MFAStatus.ENABLED, totpEnabled: true, totpVerifiedAt: new Date(), preferredMethod: MFAMethod.TOTP },
      });
      return { success: true, message: 'TOTP MFA enabled successfully' };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Verifymfa
   */
  async verifyMFA(userId: string, code: string, method: 'totp' | 'email' | 'sms' = 'totp'): Promise<{ verified: boolean; message: string }> {
    try {
      const userMfa = await this.prisma.userMFA.findUnique({ where: { userId } });
      if (!userMfa || userMfa.status !== MFAStatus.ENABLED) {
        return { verified: false, message: 'MFA not enabled for this account' };
      }
      let verified = false;
      if (method === 'totp' && userMfa.totpEnabled && userMfa.totpSecret) {
        verified = this.verifyToken(code, userMfa.totpSecret);
      }
      if (!verified) {
        verified = await this.verifyBackupCode(userId, code);
      }
      return { verified, message: verified ? 'MFA verification successful' : 'Invalid MFA code' };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Disablemfa
   */
  async disableMFA(userId: string, code: string, method: 'totp' | 'email' | 'sms' = 'totp'): Promise<{ success: boolean; message: string }> {
    try {
      const verifyResult = await this.verifyMFA(userId, code, method);
      if (!verifyResult.verified) return { success: false, message: 'Invalid verification code' };
      await this.prisma.userMFA.update({
        where: { userId },
        data: { status: MFAStatus.DISABLED, totpEnabled: false, smsEnabled: false, emailEnabled: false, totpSecret: null },
      });
      return { success: true, message: 'MFA disabled successfully' };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sendotp
   */
  async sendOTP(userId: string, method: 'sms' | 'email', ip: string, userAgent: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, phone: true } });
      if (!user) throw new NotFoundException('User not found');
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
      const mfaMethod = method === 'sms' ? MFAMethod.SMS : MFAMethod.EMAIL;
      await this.prisma.mFAChallenge.create({
        data: {
          userId,
          method: mfaMethod,
          challenge: await HashUtil.hashPassword(otp),
          expiresAt,
          ipAddress: ip,
          userAgent,
        },
      });
      this.logger.log('OTP generated for user=' + userId + ', method=' + method);
      return { message: 'OTP sent via ' + method };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Verifyotp
   */
  async verifyOTP(userId: string, code: string, method: 'sms' | 'email'): Promise<{ verified: boolean; message: string }> {
    try {
      const mfaMethod = method === 'sms' ? MFAMethod.SMS : MFAMethod.EMAIL;
      const challenge = await this.prisma.mFAChallenge.findFirst({
        where: { userId, method: mfaMethod, isUsed: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
      });
      if (!challenge) return { verified: false, message: 'No valid OTP challenge found' };
      const isValid = await HashUtil.verifyPassword(code, challenge.challenge);
      if (!isValid) return { verified: false, message: 'Invalid OTP code' };
      await this.prisma.mFAChallenge.update({ where: { id: challenge.id }, data: { isUsed: true, usedAt: new Date() } });
      return { verified: true, message: 'OTP verified successfully' };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gettrusteddevices
   */
  async getTrustedDevices(userId: string): Promise<any[]> {
    try {
      return this.prisma.trustedDevice.findMany({
        where: { userId, isActive: true },
        orderBy: { lastUsedAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Trustdevice
   */
  async trustDevice(userId: string, deviceInfo: any, ip: string, trustDays: number = 30): Promise<string> {
    try {
      const token = HashUtil.generateToken(32);
      const skipMfaUntil = new Date(Date.now() + trustDays * 24 * 60 * 60 * 1000);
      await this.prisma.trustedDevice.create({
        data: {
          userId,
          deviceToken: token,
          deviceName: deviceInfo.name || deviceInfo.userAgent || 'Unknown Device',
          deviceFingerprint: deviceInfo.fingerprint || ip,
          lastIpAddress: ip,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          skipMfaUntil,
        },
      });
      return token;
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Revoketrusteddevice
   */
  async revokeTrustedDevice(userId: string, deviceId: string, reason?: string): Promise<{ message: string }> {
    try {
      const device = await this.prisma.trustedDevice.findFirst({ where: { id: deviceId, userId } });
      if (!device) throw new NotFoundException('Trusted device not found');
      await this.prisma.trustedDevice.update({
        where: { id: deviceId },
        data: { isActive: false, revokedAt: new Date() },
      });
      return { message: 'Device trust revoked successfully' };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }
}

export { MfaService as MFAService };
