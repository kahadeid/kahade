import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';



export enum JournalEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class CreateJournalDto {
  @ApiProperty({
    description: 'Account ID',
    example: 'acc-123456789',
  })
  @IsString()
  accountId: string;

  @ApiProperty({
    description: 'Entry type',
    enum: JournalEntryType,
    example: JournalEntryType.DEBIT,
  })
  @IsEnum(JournalEntryType)
  entryType: JournalEntryType;

  @ApiProperty({
    description: 'Amount in minor units',
    example: 500000,
  })
  @IsInt()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Description of the journal entry',
    example: 'Payment received for order ORD-123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Reference ID (order, transaction, etc)',
    example: 'ord-123',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
