import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';



export class DiscrepancyDto {
  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  expectedAmount: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  actualAmount: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  difference: number;
}

export class ReconciliationReportDto {
  @ApiProperty({
    description: 'Report ID',
    example: 'rec-123456789',
  })
  @IsString()
  reportId: string;

  @ApiProperty({
    description: 'Reconciliation period start',
    example: '2026-02-01T00:00:00Z',
  })
  @IsString()
  periodStart: string;

  @ApiProperty({
    description: 'Reconciliation period end',
    example: '2026-02-28T23:59:59Z',
  })
  @IsString()
  periodEnd: string;

  @ApiProperty({
    description: 'Total debit amount',
    example: 10000000,
  })
  @IsInt()
  @Type(() => Number)
  totalDebits: number;

  @ApiProperty({
    description: 'Total credit amount',
    example: 10000000,
  })
  @IsInt()
  @Type(() => Number)
  totalCredits: number;

  @ApiProperty({
    description: 'Whether accounts are balanced',
    example: true,
  })
  @IsBoolean()
  isBalanced: boolean;

  @ApiProperty({
    description: 'List of discrepancies found',
    type: [DiscrepancyDto],
  })
  @IsArray()
  discrepancies: DiscrepancyDto[];
}
