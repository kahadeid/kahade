import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';



export class BalanceDto {
  @ApiProperty({
    description: 'Available balance in minor units (Rupiah)',
    example: 1500000,
  })
  @IsInt()
  @Type(() => Number)
  availableBalance: number;

  @ApiProperty({
    description: 'Total balance in minor units (Rupiah)',
    example: 2000000,
  })
  @IsInt()
  @Type(() => Number)
  totalBalance: number;

  @ApiProperty({
    description: 'Amount held in escrow in minor units (Rupiah)',
    example: 500000,
  })
  @IsInt()
  @Type(() => Number)
  escrowHold: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'IDR',
    default: 'IDR',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}
