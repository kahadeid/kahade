
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { MfaService } from "./mfa.service";
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Ip,
  Headers,
} from "@nestjs/common";

@Controller("auth/mfa")
@UseGuards(JwtAuthGuard)
export class MFAController {
  constructor(private readonly mfaService: MfaService) {}

  // ============================================================================
  // MFA STATUS
  // ============================================================================

  @Get("status")
  async getMFAStatus(@Request() req: Request) {
    return this.mfaService.getMFAStatus(req.user.id);
  }

  // ============================================================================
  // TOTP SETUP
  // ============================================================================

  @Post("totp/setup")
  async initializeTOTPSetup(@Request() req: Request) {
    return this.mfaService.initializeTOTPSetup(req.user.id, req.user.email);
  }

  @Post("totp/confirm")
  async confirmTOTPSetup(@Request() req: Request, @Body() body: { code: string }) {
    return this.mfaService.confirmTOTPSetup(req.user.id, body.code);
  }

  // ============================================================================
  // OTP (SMS/EMAIL)
  // ============================================================================

  @Post("otp/send")
  async sendOTP(
    @Request() req: Request,
    @Body() body: { method: "SMS" | "EMAIL" },
    @Ip() ip: string,
    @Headers("user-agent") userAgent: string,
  ) {
    // FIX: Convert uppercase to lowercase for type compatibility
    const method = body.method.toLowerCase() as 'sms' | 'email';
    return this.mfaService.sendOTP(req.user.id, method, ip, userAgent);
  }

  @Post("otp/verify")
  async verifyOTP(
    @Request() req: Request,
    @Body() body: { code: string; method: "SMS" | "EMAIL" },
  ) {
    // FIX: Convert uppercase to lowercase for type compatibility
    const method = body.method.toLowerCase() as 'sms' | 'email';
    return this.mfaService.verifyOTP(req.user.id, body.code, method);
  }

  // ============================================================================
  // VERIFICATION
  // ============================================================================

  @Post("verify")
  async verifyMFA(
    @Request() req: Request,
    @Body() body: { code: string; method?: string },
  ) {
    return this.mfaService.verifyMFA(
      req.user.id,
      body.code,
      body.method as any,
    );
  }

  @Post("verify/backup")
  async verifyBackupCode(@Request() req: Request, @Body() body: { code: string }) {
    // FIX: Pass userId and code directly
    const verified = await this.mfaService.verifyBackupCode(req.user.id, body.code);
    return { verified, message: verified ? 'Backup code verified' : 'Invalid backup code' };
  }

  // ============================================================================
  // DISABLE MFA
  // ============================================================================

  @Post("disable")
  async disableMFA(
    @Request() req: Request,
    @Body() body: { code: string; method?: string },
  ) {
    // FIX: Method signature now expects 3 parameters
    await this.mfaService.disableMFA(
      req.user.id,
      body.code,
      body.method as any,
    );
    return { success: true, message: "MFA has been disabled" };
  }

  // ============================================================================
  // TRUSTED DEVICES
  // ============================================================================

  @Get("devices")
  async getTrustedDevices(@Request() req: Request) {
    return this.mfaService.getTrustedDevices(req.user.id);
  }

  @Post("devices/trust")
  async trustDevice(
    @Request() req: Request,
    @Body()
    body: {
      deviceName?: string;
      deviceType?: string;
      browser?: string;
      os?: string;
      fingerprint?: string;
      trustDays?: number;
    },
    @Ip() ip: string,
  ) {
    // FIX: Update to match service signature (4 parameters)
    const token = await this.mfaService.trustDevice(
      req.user.id,
      body,
      ip,
      body.trustDays,
    );
    return { success: true, deviceToken: token };
  }

  @Delete("devices/:deviceId")
  async revokeTrustedDevice(
    @Request() req: Request,
    @Param("deviceId") deviceId: string,
    @Body() body: { reason?: string },
  ) {
    // FIX: Update to match service signature (3 parameters)
    await this.mfaService.revokeTrustedDevice(
      req.user.id,
      deviceId,
      body.reason,
    );
    return { success: true, message: "Device has been revoked" };
  }
}
