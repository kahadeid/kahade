import { ApiProperty } from "@nestjs/swagger";

import { Transform } from "class-transformer";
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
} from "class-validator";

// ============================================================================
// ADMIN LOGIN DTO
// Implements: Input Validation, Sanitization for Admin Authentication
// ============================================================================

export class AdminLoginDto {
  @ApiProperty({
    example: "admin@kahade.com",
    description: "Admin email address",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  @MaxLength(255, { message: "Email must not exceed 255 characters" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: "password123",
    description: "Admin password",
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @MaxLength(128, { message: "Password must not exceed 128 characters" })
  password: string;

  @ApiProperty({
    example: "123456",
    required: false,
    description: "MFA/2FA code if enabled",
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: "MFA code must be 6 digits" })
  @MaxLength(6, { message: "MFA code must be 6 digits" })
  mfaCode?: string;
}
