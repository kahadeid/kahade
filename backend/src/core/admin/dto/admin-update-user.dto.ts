import { ApiPropertyOptional } from "@nestjs/swagger";

import { KYCStatus } from "@prisma/client";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ description: "Username" })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: "Email address" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: "Phone number" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Admin flag" })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @ApiPropertyOptional({ description: "KYC status", enum: KYCStatus })
  @IsOptional()
  @IsEnum(KYCStatus)
  kycStatus?: KYCStatus;
}
