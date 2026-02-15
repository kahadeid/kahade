import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';



export class TransactionLimitDto {
  @ApiProperty({
    description: 'Daily transaction limit in Rupiah',
    example: 10000000,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  dailyLimit: number;

  @ApiProperty({
    description: 'Remaining daily limit in Rupiah',
    example: 5000000,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  remainingDaily: number;

  @ApiPropertyOptional({
    description: 'Monthly transaction limit in Rupiah',
    example: 100000000,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  monthlyLimit?: number;

  @ApiPropertyOptional({
    description: 'Minimum transaction amount',
    example: 10000,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  minTransaction?: number;

  @ApiPropertyOptional({
    description: 'Maximum transaction amount',
    example: 50000000,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Max(1000000000)
  maxTransaction?: number;
}
