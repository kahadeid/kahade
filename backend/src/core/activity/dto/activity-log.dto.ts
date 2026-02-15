import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';



export enum ActivityType {
  LOGIN = 'LOGIN',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_ACCEPTED = 'ORDER_ACCEPTED',
  PAYMENT_MADE = 'PAYMENT_MADE',
  RATING_GIVEN = 'RATING_GIVEN',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  KYC_SUBMITTED = 'KYC_SUBMITTED',
}

export class ActivityLogDto {
  @ApiProperty({
    description: 'Activity log ID',
    example: 'act-123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'User ID who performed the activity',
    example: 'usr-123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Activity type',
    enum: ActivityType,
    example: ActivityType.ORDER_CREATED,
  })
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @ApiPropertyOptional({
    description: 'Activity description',
    example: 'User created a new order',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { orderId: 'ord-123', amount: 500000 },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp of activity',
    example: '2026-02-13T23:20:00Z',
  })
  @IsString()
  createdAt: string;
}
