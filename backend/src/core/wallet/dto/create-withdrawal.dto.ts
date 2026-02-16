import { ApiProperty } from '@nestjs/swagger';


import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({
    description: 'Withdrawal amount in major currency units',
    example: 500.00,
    minimum: 50,
    maximum: 10000000,
  })
  @IsNumber()
  @Min(50, { message: 'Minimum withdrawal amount is 50' })
  @Max(10000000, { message: 'Maximum withdrawal amount is 10,000,000' })
  amount: number;

  @ApiProperty({
    description: 'Bank code',
    example: 'BCA',
  })
  @IsString()
  @Length(2, 10)
  bankCode: string;

  @ApiProperty({
    description: 'Bank account number',
    example: '1234567890',
  })
  @IsString()
  @Matches(/^[0-9]+$/, { message: 'Bank account must contain only numbers' })
  @Length(6, 20)
  bankAccountNumber: string;

  @ApiProperty({
    description: 'Bank account holder name',
    example: 'John Doe',
  })
  @IsString()
  @Length(3, 100)
  bankAccountName: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'IDR',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string = 'IDR';

  @ApiProperty({
    description: 'Optional notes for this withdrawal',
    example: 'Monthly payout',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
