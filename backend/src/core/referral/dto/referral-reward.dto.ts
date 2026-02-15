import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';



export enum RewardStatus {
  PENDING = 'PENDING',
  EARNED = 'EARNED',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
}

export class ReferralRewardDto {
  @ApiProperty({
    description: 'Reward ID',
    example: 'rwd-123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Referrer user ID',
    example: 'usr-referrer-123',
  })
  @IsString()
  referrerId: string;

  @ApiProperty({
    description: 'Referred user ID',
    example: 'usr-referred-456',
  })
  @IsString()
  referredId: string;

  @ApiProperty({
    description: 'Reward amount (minor units)',
    example: 50000,
  })
  @IsInt()
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Reward status',
    enum: RewardStatus,
    example: RewardStatus.EARNED,
  })
  @IsEnum(RewardStatus)
  status: RewardStatus;

  @ApiProperty({
    description: 'Reward earned date',
    example: '2026-02-13T23:20:00Z',
  })
  @IsString()
  earnedAt: string;
}
