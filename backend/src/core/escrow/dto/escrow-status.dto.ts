import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';



export enum EscrowStatus {
  PENDING = 'PENDING',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
  EXPIRED = 'EXPIRED',
}

export class EscrowStatusDto {
  @ApiProperty({
    description: 'Escrow transaction ID',
    example: 'esc-123456789',
  })
  @IsString()
  escrowId: string;

  @ApiProperty({
    description: 'Current escrow status',
    enum: EscrowStatus,
    example: EscrowStatus.HELD,
  })
  @IsEnum(EscrowStatus)
  status: EscrowStatus;

  @ApiProperty({
    description: 'Amount held in escrow (minor units)',
    example: 500000,
  })
  @IsInt()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Release date (ISO 8601)',
    example: '2026-02-20T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  releaseDate?: string;
}
