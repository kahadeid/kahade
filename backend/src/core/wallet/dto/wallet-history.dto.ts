import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';



export enum WalletTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  ESCROW_HOLD = 'ESCROW_HOLD',
  ESCROW_RELEASE = 'ESCROW_RELEASE',
  REFUND = 'REFUND',
  FEE = 'FEE',
}

export class WalletHistoryDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'wt-123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: WalletTransactionType,
    example: WalletTransactionType.DEPOSIT,
  })
  @IsEnum(WalletTransactionType)
  type: WalletTransactionType;

  @ApiProperty({
    description: 'Amount in minor units (Rupiah)',
    example: 500000,
  })
  @IsInt()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: 'Wallet top-up via BCA Virtual Account',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Transaction timestamp',
    example: '2026-02-13T23:20:00Z',
  })
  @IsString()
  createdAt: string;
}
