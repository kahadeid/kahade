import { ApiPropertyOptional } from "@nestjs/swagger";

import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";

// ============================================================================
// REFRESH TOKEN DTO
// ============================================================================

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: "JWT refresh token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  @IsOptional()
  @MinLength(10, { message: "Invalid refresh token format" })
  @MaxLength(2048, { message: "Refresh token too long" })
  refreshToken: string;
}
