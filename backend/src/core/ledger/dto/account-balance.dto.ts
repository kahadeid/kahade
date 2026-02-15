import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';



export class AccountBalanceDto {
  @ApiProperty({
    description: 'Account ID',
    example: 'acc-123456789',
  })
  @IsString()
  accountId: string;

  @ApiProperty({
    description: 'Account name',
    example: 'User Wallet - usr-123',
  })
  @IsString()
  accountName: string;

  @ApiProperty({
    description: 'Debit balance in minor units',
    example: 5000000,
  })
  @IsInt()
  @Type(() => Number)
  debitBalance: number;

  @ApiProperty({
    description: 'Credit balance in minor units',
    example: 3000000,
  })
  @IsInt()
  @Type(() => Number)
  creditBalance: number;

  @ApiProperty({
    description: 'Net balance in minor units',
    example: 2000000,
  })
  @IsInt()
  @Type(() => Number)
  netBalance: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'IDR',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}
