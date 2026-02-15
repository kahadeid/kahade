import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';



export class WithdrawalLimitsDto {
  @ApiProperty({
    description: 'Daily withdrawal limit',
    example: '1000000000',
  })
  @IsString()
  @Transform(({ value }) => value.toString())
  dailyLimit: string;

  @ApiProperty({
    description: 'Daily amount already used',
    example: '500000000',
  })
  @IsString()
  @Transform(({ value }) => value.toString())
  dailyUsed: string;

  @ApiProperty({
    description: 'Remaining daily limit',
    example: '500000000',
  })
  @IsString()
  @Transform(({ value }) => value.toString())
  dailyRemaining: string;

  @ApiProperty({
    description: 'Number of withdrawals made today',
    example: 2,
  })
  @IsInt()
  @Min(0)
  dailyCount: number;

  @ApiProperty({
    description: 'Maximum withdrawals allowed per day',
    example: 5,
  })
  @IsInt()
  @Min(1)
  maxDailyCount: number;

  @ApiProperty({
    description: 'Monthly withdrawal limit',
    example: '10000000000',
  })
  @IsString()
  @Transform(({ value }) => value.toString())
  monthlyLimit: string;

  @ApiProperty({
    description: 'Monthly amount already used',
    example: '2000000000',
  })
  @IsString()
  @Transform(({ value }) => value.toString())
  monthlyUsed: string;

  @ApiProperty({
    description: 'Remaining monthly limit',
    example: '8000000000',
  })
  @IsString()
  @Transform(({ value }) => value.toString())
  monthlyRemaining: string;

  @ApiProperty({
    description: 'Cooling period in minutes between withdrawals',
    example: 15,
  })
  @IsInt()
  @Min(0)
  coolingPeriodMinutes: number;

  @ApiPropertyOptional({
    description: 'Next allowed withdrawal timestamp',
    example: '2026-02-13T23:45:00Z',
  })
  @IsOptional()
  @IsString()
  nextWithdrawalAllowedAt: string | null;
}
