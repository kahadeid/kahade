import { ConfigService } from "@nestjs/config";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Request, Get, Ip, Headers, Delete, Param, Res, Query, BadRequestException, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { ResetPasswordDto, ForgotPasswordDto, ChangePasswordDto } from "./dto/reset-password.dto";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { AuthService } from "./auth.service";
import { CookieUtil } from "@common/utils/cookie.util";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { IpUtil } from "@common/utils/ip.util";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { LoginDto } from "./dto/login.dto";
import { MfaVerifyDto, MfaDisableDto } from "./dto/mfa-verify.dto";
import { Public } from "@common/decorators/public.decorator";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { Request as ExpressRequest, Response } from "express";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post("register")
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async register(
    @Body() registerDto: RegisterDto,
  ) {
    const result = await this.authService.register(registerDto);
    return result;
  }

  @Public()
  @Post("login")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 403, description: "Account locked" })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string | undefined,
    @Headers("user-agent") userAgent: string,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const clientIp = IpUtil.normalizeIp(ip, req);
    const result = await this.authService.login(loginDto, clientIp, userAgent);

    const csrfToken = CookieUtil.generateCsrfToken();
    CookieUtil.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      csrfToken,
      this.configService,
    );

    res.setHeader("x-csrf-token", csrfToken);

    return {
      user: result.user,
      expiresIn: result.expiresIn,
    };
  }

  @Public()
  @Get("csrf")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get CSRF token (public)" })
  @ApiResponse({ status: 200, description: "CSRF token issued" })
  async getCsrfToken(@Res({ passthrough: true }) res: Response) {
    const csrfToken = CookieUtil.generateCsrfToken();
    CookieUtil.setCsrfToken(res, csrfToken, this.configService);
    res.setHeader("x-csrf-token", csrfToken);
    return { csrfToken };
  }

  @Public()
  @Post("admin/login")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin login - restricted to administrators" })
  @ApiResponse({ status: 200, description: "Admin login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({
    status: 403,
    description: "Not an administrator or account locked",
  })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async adminLogin(
    @Body() loginDto: AdminLoginDto,
    @Ip() ip: string | undefined,
    @Headers("user-agent") userAgent: string,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const clientIp = IpUtil.normalizeIp(ip, req);
    const result = await this.authService.adminLogin(loginDto, clientIp, userAgent);

    const csrfToken = CookieUtil.generateCsrfToken();
    CookieUtil.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      csrfToken,
      this.configService,
    );

    res.setHeader("x-csrf-token", csrfToken);

    return {
      user: result.user,
      expiresIn: result.expiresIn,
    };
  }

  @Public()
  @Post("refresh")
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      refreshTokenDto?.refreshToken ||
      CookieUtil.getRefreshTokenFromCookie(req.cookies || {});

    if (!refreshToken) {
      throw new BadRequestException("Refresh token required");
    }

    const result = await this.authService.refreshToken(refreshToken, refreshToken);

    const csrfToken = CookieUtil.generateCsrfToken();
    CookieUtil.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      csrfToken,
      this.configService,
    );

    res.setHeader("x-csrf-token", csrfToken);

    return {
      expiresIn: result.expiresIn,
    };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout user" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  async logout(
    @CurrentUser("id") userId: string,
    @Request() req: Request,
    @Body("refreshToken") refreshToken?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const actualRefreshToken =
      refreshToken || CookieUtil.getRefreshTokenFromCookie(req.cookies || {}) || '';

    const result = await this.authService.logout(
      userId,
      actualRefreshToken,
    );

    if (res) {
      CookieUtil.clearAuthCookies(res, this.configService);
    }

    return result;
  }

  @Post("logout-all")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout from all devices" })
  @ApiResponse({ status: 200, description: "Logged out from all devices" })
  async logoutAll(
    @CurrentUser("id") userId: string,
    @Request() req: Request,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const accessToken =
      req.headers.authorization?.split(" ")[1] ||
      CookieUtil.getAccessTokenFromCookie(req.cookies || {});

    const result = await this.authService.logoutAll(userId, accessToken);

    if (res) {
      CookieUtil.clearAuthCookies(res, this.configService);
    }

    return result;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @SkipThrottle()
  @ApiOperation({ summary: "Get current user" })
  @ApiResponse({ status: 200, description: "Returns current user" })
  async getCurrentUser(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(user.id);
  }

  @Public()
  @Post("forgot-password")
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({
    status: 200,
    description: "Password reset email sent (if account exists)",
  })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Get("reset-password/validate")
  @ApiOperation({ summary: "Validate password reset token" })
  @ApiQuery({ name: "token", required: true })
  @ApiResponse({ status: 200, description: "Returns token validity" })
  async validateResetToken(@Query("token") token: string) {
    return this.authService.validateResetToken(token);
  }

  @Public()
  @Post("reset-password")
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with token" })
  @ApiResponse({ status: 200, description: "Password reset successful" })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Change password (authenticated)" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({ status: 401, description: "Current password incorrect" })
  async changePassword(
    @CurrentUser("id") userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Public()
  @Post("verify-email")
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify email address" })
  @ApiResponse({ status: 200, description: "Email verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  async verifyEmail(@Body() dto: { token: string }) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post("resend-verification")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend verification email (authenticated)" })
  @ApiResponse({ status: 200, description: "Verification email sent" })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async resendVerification(@CurrentUser() user: any) {
    return this.authService.resendVerificationEmail(user.email);
  }

  @Public()
  @Post("resend-verification-public")
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend verification email (public)" })
  @ApiResponse({
    status: 200,
    description: "Verification email sent (if account exists)",
  })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async resendVerificationPublic(@Body() dto: { email: string }) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Post("2fa/enable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Initiate MFA setup (legacy - use /auth/mfa/totp/setup)",
  })
  @ApiResponse({ status: 200, description: "Returns MFA setup details" })
  async setupMfa(@CurrentUser("id") userId: string) {
    return this.authService.setupMfa(userId);
  }

  @Post("2fa/verify")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Verify MFA and enable (legacy - use /auth/mfa/totp/confirm)",
  })
  @ApiResponse({ status: 200, description: "MFA enabled" })
  async verifyMfa(
    @CurrentUser("id") userId: string,
    @Body() dto: MfaVerifyDto,
  ) {
    return this.authService.enableMfa(userId, dto.code);
  }

  @Post("2fa/disable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Disable MFA (legacy - use /auth/mfa/disable)" })
  @ApiResponse({ status: 200, description: "MFA disabled" })
  async disableMfa(
    @CurrentUser("id") userId: string,
    @Body() dto: MfaDisableDto,
  ) {
    return this.authService.disableMfa(userId, dto.password, dto.code);
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "List active sessions" })
  @ApiResponse({ status: 200, description: "Returns active sessions" })
  async getSessions(@CurrentUser("id") userId: string) {
    const sessions = await this.authService.listSessions(userId);
    return sessions.map((session: any) => ({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      revokedAt: session.revokedAt,
    }));
  }

  @Delete("sessions/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Revoke a session" })
  @ApiResponse({ status: 200, description: "Session revoked" })
  async revokeSession(
    @CurrentUser("id") userId: string,
    @Param("id") sessionId: string,
  ) {
    return this.authService.revokeSession(userId, sessionId);
  }

  @Delete("sessions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Revoke all sessions" })
  @ApiResponse({ status: 200, description: "All sessions revoked" })
  async revokeAllSessions(@CurrentUser("id") userId: string) {
    return this.authService.revokeAllSessions(userId);
  }
}
