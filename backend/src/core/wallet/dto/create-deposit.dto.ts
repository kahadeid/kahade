import { ApiProperty } from '@nestjs/swagger';


import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
  E_WALLET = 'E_WALLET',
  CREDIT_CARD = 'CREDIT_CARD',
}

export class CreateDepositDto {
  @ApiProperty({
    description: 'Deposit amount in major currency units (e.g., 1000.00 IDR)',
    example: 1000.00,
    minimum: 10,
    maximum: 100000000,
  })
  @IsNumber()
  @Min(10, { message: 'Minimum deposit amount is 10' })
  @Max(100000000, { message: 'Maximum deposit amount is 100,000,000' })
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'IDR',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string = 'IDR';

  @ApiProperty({
    description: 'Idempotency key to prevent duplicate deposits',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID('4')
  @IsOptional()
  idempotencyKey?: string;

  @ApiProperty({
    description: 'Optional notes for this deposit',
    example: 'Monthly subscription payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
