import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';



export enum JournalEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class JournalEntryDto {
  @ApiProperty({
    description: 'Journal entry ID',
    example: 'jnl-123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Account ID',
    example: 'acc-123',
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

  @ApiProperty({
    description: 'Description',
    example: 'Payment for order ORD-123',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Entry timestamp',
    example: '2026-02-13T23:20:00Z',
  })
  @IsString()
  createdAt: string;
}
