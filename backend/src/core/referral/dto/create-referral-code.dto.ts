import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';



export class CreateReferralCodeDto {
  @ApiPropertyOptional({
    description: 'Custom referral code (if not provided, will be auto-generated)',
    example: 'MYCODE2026',
    minLength: 6,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({
    description: 'Maximum uses for this code',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({
    description: 'Expiration date (ISO 8601)',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
