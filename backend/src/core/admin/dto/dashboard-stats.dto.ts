import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';



export class DashboardStatsDto {
  @ApiProperty({
    description: 'Total registered users',
    example: 15000,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  totalUsers: number;

  @ApiProperty({
    description: 'Active users (last 30 days)',
    example: 5000,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  activeUsers: number;

  @ApiProperty({
    description: 'Total orders',
    example: 8000,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  totalOrders: number;

  @ApiProperty({
    description: 'Pending orders',
    example: 150,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  pendingOrders: number;

  @ApiProperty({
    description: 'Total revenue (minor units)',
    example: 750000000,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  totalRevenue: number;

  @ApiProperty({
    description: 'Total platform fees collected (minor units)',
    example: 75000000,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  platformFees: number;

  @ApiProperty({
    description: 'Average order value (minor units)',
    example: 93750,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  averageOrderValue: number;

  @ApiProperty({
    description: 'Active escrow transactions',
    example: 75,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  activeEscrow: number;
}
