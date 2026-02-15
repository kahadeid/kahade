import { ApiProperty } from "@nestjs/swagger";

import {
import { Type } from "class-transformer";

  IsNumber,
  IsString,
  Min,
  Max,
  IsOptional,
  IsUUID,
  MaxLength,
} from "class-validator";

// ============================================================================
// WITHDRAW DTO
// Aligns with /withdrawals DTO (amountMinor + bankAccountId)
// ============================================================================

export class WithdrawDto {
  @ApiProperty({
    description: "Amount to withdraw in minor units (Rupiah)",
    example: 500000,
    minimum: 50000,
    maximum: 50000000,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(50000, { message: "Minimum withdrawal is Rp 50,000" })
  @Max(50000000, {
    message: "Maximum withdrawal is Rp 50,000,000 per transaction",
  })
  amountMinor: number;

  @ApiProperty({
    description: "Bank account ID to withdraw to",
    example: "bank-account-uuid-123",
  })
  @IsUUID("4", { message: "Invalid bank account ID" })
  @IsString()
  bankAccountId: string;

  @ApiProperty({
    description: "Optional note for the withdrawal",
    example: "Monthly salary withdrawal",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
