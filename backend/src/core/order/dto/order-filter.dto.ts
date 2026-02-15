import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';



export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PAID = 'PAID',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export class OrderFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: OrderStatus,
    example: OrderStatus.PAID,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by initiator user ID',
    example: 'usr-123',
  })
  @IsOptional()
  @IsString()
  initiatorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by counterparty user ID',
    example: 'usr-456',
  })
  @IsOptional()
  @IsString()
  counterpartyId?: string;

  @ApiPropertyOptional({
    description: 'Search by order number or title',
    example: 'MacBook',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}

// Extended filter DTO with additional fields used by order.service.ts
export class OrderFilterExtendedDto extends OrderFilterDto {
  role?: string;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
