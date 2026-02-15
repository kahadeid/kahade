import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';



export class CreateVoucherDto {
  @ApiProperty({
    description: 'Voucher code',
    example: 'WELCOME2026',
    minLength: 4,
    maxLength: 20,
  })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  code: string;

  @ApiProperty({
    description: 'Discount percentage (0-100)',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @ApiPropertyOptional({
    description: 'Maximum discount amount (minor units)',
    example: 50000,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Minimum order amount (minor units)',
    example: 100000,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum usage count',
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  maxUsage?: number;

  @ApiPropertyOptional({
    description: 'Expiration date (ISO 8601)',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}

export class CreateVoucherExtendedDto extends CreateVoucherDto {
  promoId?: string;
  voucherType?: string;
  discountMinor?: number;
  discountPercent?: number;
  maxDiscountMinor?: number;
  maxUsages?: number;
  minPurchaseMinor?: number;
  applicableCategories?: string[];
  validFrom?: string | Date;
  validUntil?: string | Date;
  assignedToUserId?: string;
}
