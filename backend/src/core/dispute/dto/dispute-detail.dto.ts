import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';



export enum DisputeStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum DisputeReason {
  NOT_RECEIVED = 'NOT_RECEIVED',
  WRONG_ITEM = 'WRONG_ITEM',
  DAMAGED = 'DAMAGED',
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  OTHER = 'OTHER',
}

export class DisputeDetailDto {
  @ApiProperty({
    description: 'Dispute ID',
    example: 'dsp-123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'ord-123456789',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Dispute status',
    enum: DisputeStatus,
    example: DisputeStatus.INVESTIGATING,
  })
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @ApiProperty({
    description: 'Dispute reason',
    enum: DisputeReason,
    example: DisputeReason.NOT_RECEIVED,
  })
  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @ApiProperty({
    description: 'Dispute description',
    example: 'Package not delivered after 10 days',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Dispute amount (minor units)',
    example: 500000,
  })
  @IsInt()
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Filed by user ID',
    example: 'usr-123',
  })
  @IsString()
  filedBy: string;

  @ApiPropertyOptional({
    description: 'Resolution notes',
    example: 'Refund approved',
  })
  @IsOptional()
  @IsString()
  resolution?: string;
}
