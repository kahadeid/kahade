import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import {

  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
  IsPositive,
  IsOptional,
  IsEnum,
} from "class-validator";

/**
 * Type of admin wallet adjustment
 */
export enum AdminWalletAdjustmentType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

/**
 * DTO for admin to add/deduct wallet balance
 */
export class AdminAdjustBalanceDto {
  @ApiProperty({
    description: "Amount to adjust (in IDR, not minor units)",
    example: 100000,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive({ message: "Amount must be a positive number" })
  amount: number;

  @ApiProperty({
    description: "Type of adjustment: CREDIT (add) or DEBIT (deduct)",
    enum: AdminWalletAdjustmentType,
    example: AdminWalletAdjustmentType.CREDIT,
  })
  @IsEnum(AdminWalletAdjustmentType)
  type: AdminWalletAdjustmentType;

  @ApiProperty({
    description: "Reason for the balance adjustment",
    example: "Compensation for service disruption on 2024-01-15",
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: "Reason is required" })
  @MinLength(10, { message: "Reason must be at least 10 characters" })
  @MaxLength(1000, { message: "Reason must not exceed 1000 characters" })
  reason: string;

  @ApiPropertyOptional({
    description: "Reference ID for tracking (e.g., ticket number)",
    example: "TICKET-2024-001234",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "Reference ID must not exceed 100 characters" })
  referenceId?: string;
}

/**
 * DTO for admin to freeze wallet balance
 */
export class AdminFreezeWalletDto {
  @ApiProperty({
    description: "Reason for freezing the wallet",
    example: "Suspicious activity detected - under investigation",
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: "Reason is required" })
  @MinLength(10, { message: "Reason must be at least 10 characters" })
  @MaxLength(1000, { message: "Reason must not exceed 1000 characters" })
  reason: string;

  @ApiPropertyOptional({
    description:
      "Amount to freeze (in IDR). If not specified, entire balance will be frozen.",
    example: 500000,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: "Amount must be a positive number" })
  amount?: number;
}

/**
 * DTO for admin to unfreeze wallet balance
 */
export class AdminUnfreezeWalletDto {
  @ApiProperty({
    description: "Reason for unfreezing the wallet",
    example: "Investigation completed - no suspicious activity found",
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: "Reason is required" })
  @MinLength(10, { message: "Reason must be at least 10 characters" })
  @MaxLength(1000, { message: "Reason must not exceed 1000 characters" })
  reason: string;

  @ApiPropertyOptional({
    description:
      "Amount to unfreeze (in IDR). If not specified, entire frozen balance will be unfrozen.",
    example: 500000,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: "Amount must be a positive number" })
  amount?: number;
}
