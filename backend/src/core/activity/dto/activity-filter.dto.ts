import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';



export enum ActivityType {
  LOGIN = 'LOGIN',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_ACCEPTED = 'ORDER_ACCEPTED',
  PAYMENT_MADE = 'PAYMENT_MADE',
  RATING_GIVEN = 'RATING_GIVEN',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  KYC_SUBMITTED = 'KYC_SUBMITTED',
}

export class ActivityFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 'usr-123',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by activity type',
    enum: ActivityType,
    example: ActivityType.ORDER_CREATED,
  })
  @IsOptional()
  @IsEnum(ActivityType)
  activityType?: ActivityType;

  @ApiPropertyOptional({
    description: 'Filter from date (ISO 8601)',
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter to date (ISO 8601)',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
