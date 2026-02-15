import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';



export enum SettlementType {
  RELEASE_TO_SELLER = 'RELEASE_TO_SELLER',
  REFUND_TO_BUYER = 'REFUND_TO_BUYER',
  PARTIAL_RELEASE = 'PARTIAL_RELEASE',
}

export class SettlementDto {
  @ApiProperty({
    description: 'Escrow transaction ID',
    example: 'esc-123456789',
  })
  @IsString()
  escrowId: string;

  @ApiProperty({
    description: 'Settlement type',
    enum: SettlementType,
    example: SettlementType.RELEASE_TO_SELLER,
  })
  @IsEnum(SettlementType)
  settlementType: SettlementType;

  @ApiProperty({
    description: 'Amount to settle in minor units',
    example: 500000,
  })
  @IsInt()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Settlement reason or notes',
    example: 'Order completed successfully',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
