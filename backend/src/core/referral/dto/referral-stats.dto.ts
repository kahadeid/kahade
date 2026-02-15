import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';



export class ReferralStatsDto {
  @ApiProperty({
    description: 'User ID',
    example: 'usr-123456789',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Total number of referrals',
    example: 25,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  totalReferrals: number;

  @ApiProperty({
    description: 'Active referrals count',
    example: 20,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  activeReferrals: number;

  @ApiProperty({
    description: 'Total rewards earned (minor units)',
    example: 500000,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  totalRewardsEarned: number;

  @ApiProperty({
    description: 'Pending rewards (minor units)',
    example: 100000,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  pendingRewards: number;
}
