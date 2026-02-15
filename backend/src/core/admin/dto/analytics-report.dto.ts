import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsObject, IsArray } from 'class-validator';
import { Type } from 'class-transformer';



export class AnalyticsReportDto {
  @ApiProperty({
    description: 'Report ID',
    example: 'rpt-123456789',
  })
  @IsString()
  reportId: string;

  @ApiProperty({
    description: 'Report period start',
    example: '2026-02-01T00:00:00Z',
  })
  @IsString()
  periodStart: string;

  @ApiProperty({
    description: 'Report period end',
    example: '2026-02-28T23:59:59Z',
  })
  @IsString()
  periodEnd: string;

  @ApiProperty({
    description: 'Total users',
    example: 10000,
  })
  @IsInt()
  @Type(() => Number)
  totalUsers: number;

  @ApiProperty({
    description: 'Total orders',
    example: 5000,
  })
  @IsInt()
  @Type(() => Number)
  totalOrders: number;

  @ApiProperty({
    description: 'Total revenue (minor units)',
    example: 500000000,
  })
  @IsInt()
  @Type(() => Number)
  totalRevenue: number;

  @ApiProperty({
    description: 'Additional metrics',
    example: { avgOrderValue: 100000, conversionRate: 0.15 },
  })
  @IsObject()
  metrics: Record<string, any>;

  @ApiProperty({
    description: 'Chart data points',
    example: [{ date: '2026-02-01', value: 1000 }],
  })
  @IsArray()
  chartData: unknown[];
}
