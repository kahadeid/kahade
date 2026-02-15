import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';



export enum DeliveryStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export class TrackingEventDto {
  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;
}

export class TrackingInfoDto {
  @ApiProperty({
    description: 'Order ID',
    example: 'ord-123456789',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Tracking number',
    example: 'TRK-2026021300123',
  })
  @IsString()
  trackingNumber: string;

  @ApiProperty({
    description: 'Current delivery status',
    enum: DeliveryStatus,
    example: DeliveryStatus.IN_TRANSIT,
  })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiPropertyOptional({
    description: 'Courier name',
    example: 'JNE Express',
  })
  @IsOptional()
  @IsString()
  courier?: string;

  @ApiProperty({
    description: 'Tracking events history',
    type: [TrackingEventDto],
  })
  @IsArray()
  events: TrackingEventDto[];
}
