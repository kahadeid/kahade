import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsEnum, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';



export enum PromoType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export class CreatePromoDto {
  @ApiProperty({
    description: 'Promo name',
    example: 'February Flash Sale',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Promo code',
    example: 'FEB2026',
    minLength: 4,
    maxLength: 20,
  })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  code: string;

  @ApiProperty({
    description: 'Promo type',
    enum: PromoType,
    example: PromoType.PERCENTAGE,
  })
  @IsEnum(PromoType)
  type: PromoType;

  @ApiProperty({
    description: 'Discount value (percentage or fixed amount in minor units)',
    example: 15,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Maximum discount amount (minor units)',
    example: 100000,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Minimum order amount to apply (minor units)',
    example: 250000,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum total usage',
    example: 500,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  maxTotalUsage?: number;

  @ApiPropertyOptional({
    description: 'Maximum usage per user',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  maxUsagePerUser?: number;

  @ApiProperty({
    description: 'Start date (ISO 8601)',
    example: '2026-02-01T00:00:00Z',
  })
  @IsString()
  startDate: string;

  @ApiProperty({
    description: 'End date (ISO 8601)',
    example: '2026-02-28T23:59:59Z',
  })
  @IsString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Promo description',
    example: 'Get 15% off on all orders this February',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

// Extended fields used by promo.service.ts
export class CreatePromoExtendedDto extends CreatePromoDto {
  targetType?: string;
  discountType?: string;
  discountPercent?: number;
  maxDiscountMinor?: number;
  maxTotalUsages?: number;
  minPurchaseMinor?: number;
  applicableCategories?: string[];
  validFrom?: string | Date;
  validUntil?: string | Date;
}
