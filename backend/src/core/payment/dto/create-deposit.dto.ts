import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';



export class CreateDepositDto {
  @ApiProperty({
    description: 'Amount to deposit in Rupiah (no decimals)',
    example: 500000,
    minimum: 10000,
    maximum: 100000000,
  })
  @IsInt({ message: 'Amount must be a whole number in Rupiah' })
  @Type(() => Number)
  @Min(10000, { message: 'Minimum deposit is Rp 10,000' })
  @Max(100000000, { message: 'Maximum deposit is Rp 100,000,000' })
  amountMinor: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'IDR',
    default: 'IDR',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Payment method identifier',
    example: 'BANK_TRANSFER',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
