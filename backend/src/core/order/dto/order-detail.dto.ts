import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsEnum, IsOptional } from 'class-validator';
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

export class OrderDetailDto {
  @ApiProperty({
    description: 'Order ID',
    example: 'ord-123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Order number',
    example: 'ORD-20260213-001',
  })
  @IsString()
  orderNumber: string;

  @ApiProperty({
    description: 'Order title',
    example: 'MacBook Pro 16-inch',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PAID,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Order amount in minor units',
    example: 25000000,
  })
  @IsInt()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Order description',
    example: 'Brand new, sealed box',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Initiator user ID',
    example: 'usr-123',
  })
  @IsString()
  initiatorId: string;

  @ApiPropertyOptional({
    description: 'Counterparty user ID',
    example: 'usr-456',
  })
  @IsOptional()
  @IsString()
  counterpartyId?: string;
}
