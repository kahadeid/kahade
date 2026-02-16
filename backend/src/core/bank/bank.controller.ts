import { Throttle } from "@nestjs/throttler";

import { AddBankAccountDto } from "./dto/add-bank-account.dto";
import { BankRepository } from "./bank.repository";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { SUPPORTED_BANKS, getBankByCode } from "@common/constants/banks";
import {
import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";

// ============================================================================
// BANK CONTROLLER - Bank-Grade Security
// Implements: Rate Limiting, Input Validation, Secure Account Management
// ============================================================================

// Maximum bank accounts per user
const MAX_BANK_ACCOUNTS = 5;

@ApiTags("bank")
@Controller("bank")
export class BankController {
  constructor(private readonly bankRepository: BankRepository) {}

  @Get("health")
  @ApiOperation({ summary: "Health check" })
  health() {
    return { status: "ok", service: "bank" };
  }

  @Get("list")
  @ApiOperation({ summary: "Get list of supported banks" })
  @ApiResponse({ status: 200, description: "Returns list of supported banks" })
  getSupportedBanks() {
    return {
      banks: SUPPORTED_BANKS,
    };
  }

  @Get("accounts")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get user bank accounts" })
  @ApiResponse({ status: 200, description: "Returns user bank accounts" })
  async getBankAccounts(@CurrentUser("id") userId: string) {
    const accounts = await this.bankRepository.findByUserId(userId);
    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      accounts: accounts.map((acc: any) => ({
        id: acc.id,
        bankName: acc.bankName,
        accountNumber: `****${acc.accountNumberLast4}`,
        accountNumberLast4: acc.accountNumberLast4,
        isActive: acc.isActive,
        isVerified: acc.isVerified,
        isDefault: acc.isDefault,
        createdAt: acc.createdAt,
      })),
    };
  }

  @Get("accounts/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get bank account by ID" })
  @ApiResponse({ status: 200, description: "Returns bank account details" })
  @ApiResponse({ status: 404, description: "Bank account not found" })
  async getBankAccount(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const account = await this.bankRepository.findById(id, userId);
    if (!account) {
      throw new NotFoundException("Bank account not found");
    }
    return {
      id: account.id,
      bankName: account.bankName,
      accountNumberLast4: account.accountNumberLast4,
      isActive: account.isActive,
      isVerified: account.isVerified,
      isDefault: account.isDefault,
      createdAt: account.createdAt,
    };
  }

  @Post("accounts")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Throttle({ default: { limit: 5, ttl: 86400000 } }) // 5 bank accounts per day
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add new bank account" })
  @ApiResponse({ status: 201, description: "Bank account added successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid bank code or duplicate account",
  })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async addBankAccount(
    @CurrentUser("id") userId: string,
    @Body() dto: AddBankAccountDto,
  ) {
    // Validate bank code
    const bank = getBankByCode(dto.bankCode);
    if (!bank) {
      throw new BadRequestException("Invalid bank code");
    }

    // Check account limit
    const existingAccounts = await this.bankRepository.findByUserId(userId);
    if (existingAccounts.length >= MAX_BANK_ACCOUNTS) {
      throw new BadRequestException(
        `Maximum ${MAX_BANK_ACCOUNTS} bank accounts allowed`,
      );
    }

    // Check for duplicate by last 4 digits
    const duplicate = existingAccounts.find(
      (acc) =>
        acc.bankName === bank.name &&
        acc.accountNumberLast4 === dto.accountNumber.slice(-4),
    );
    if (duplicate) {
      throw new BadRequestException("Bank account already exists");
    }

    // Validate account number format (10-16 digits)
    if (!/^\d{10,16}$/.test(dto.accountNumber)) {
      throw new BadRequestException("Invalid account number format");
    }

    // Validate account holder name (only letters, spaces, and common characters)
    if (!/^[a-zA-Z\s.'-]{2,100}$/.test(dto.accountHolderName)) {
      throw new BadRequestException("Invalid account holder name");
    }

    const account = await this.bankRepository.create({
      userId,
      bankName: bank.name,
      accountNumber: dto.accountNumber,
      accountHolderName: dto.accountHolderName.trim(),
    });

    return {
      message: "Bank account added successfully",
      account: {
        id: account.id,
        bankName: account.bankName,
        accountNumberLast4: account.accountNumberLast4,
        isActive: account.isActive,
        isVerified: account.isVerified,
      },
    };
  }

  @Patch("accounts/:id/default")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 per hour
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set bank account as default" })
  @ApiResponse({ status: 200, description: "Bank account set as default" })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async setAsDefault(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const account = await this.bankRepository.findById(id, userId);
    if (!account) {
      throw new NotFoundException("Bank account not found");
    }

    if (!account.isActive) {
      throw new BadRequestException("Cannot set inactive account as default");
    }

    await this.bankRepository.setAsDefault(id, userId);

    return { message: "Bank account set as default" };
  }

  @Delete("accounts/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 per hour
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete bank account" })
  @ApiResponse({ status: 200, description: "Bank account deleted" })
  @ApiResponse({ status: 404, description: "Bank account not found" })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async deleteBankAccount(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const account = await this.bankRepository.findById(id, userId);
    if (!account) {
      throw new NotFoundException("Bank account not found");
    }

    // Check if this is the only account and is default
    const allAccounts = await this.bankRepository.findByUserId(userId);
    if (allAccounts.length === 1 && account.isDefault) {
      // Allow deletion of last account
    }

    await this.bankRepository.softDelete(id, userId);

    return { message: "Bank account deleted successfully" };
  }

  @Post("accounts/:id/verify")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Throttle({ default: { limit: 3, ttl: 86400000 } }) // 3 per day
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request bank account verification" })
  @ApiResponse({ status: 200, description: "Verification request submitted" })
  @ApiResponse({ status: 404, description: "Bank account not found" })
  @ApiResponse({ status: 400, description: "Account already verified" })
  async requestVerification(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const account = await this.bankRepository.findById(id, userId);
    if (!account) {
      throw new NotFoundException("Bank account not found");
    }

    if (account.isVerified) {
      throw new BadRequestException("Bank account is already verified");
    }

    // In a real implementation, this would trigger a verification process
    // For now, we'll just mark it as pending verification
    await this.bankRepository.update(id, userId, {
      isVerified: false, // Will be set to true after verification completes
    });

    return {
      message: "Verification request submitted",
      status: "pending",
      note: "A small deposit will be sent to your account. Please check your bank statement and confirm the amount.",
    };
  }

  @Get("accounts/:id/withdrawals")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get withdrawals for a specific bank account" })
  @ApiResponse({ status: 200, description: "Returns withdrawal history" })
  @ApiResponse({ status: 404, description: "Bank account not found" })
  async getAccountWithdrawals(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const account = await this.bankRepository.findById(id, userId);
    if (!account) {
      throw new NotFoundException("Bank account not found");
    }

    // Get withdrawals for this bank account
    const withdrawals = await this.bankRepository.getWithdrawalsForAccount(
      id,
      userId,
    );

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      withdrawals: withdrawals.map((w: any) => ({
        id: w.id,
        amount: Number(w.amountMinor) / 100,
        status: w.status,
        requestedAt: w.requestedAt,
        processedAt: w.processedAt,
        completedAt: w.completedAt,
      })),
    };
  }
}
