import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';



export class PaymentCallbackDto {
  @ApiProperty({
    description: 'External payment ID from payment gateway',
    example: 'ext-pay-123456789',
  })
  @IsString()
  externalId: string;

  @ApiProperty({
    description: 'Payment status from gateway',
    example: 'PAID',
  })
  @IsString()
  status: string;

  @ApiPropertyOptional({
    description: 'Payment gateway signature for verification',
    example: 'sha256-signature-hash',
  })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiPropertyOptional({
    description: 'Additional callback data from payment gateway',
    example: { transactionTime: '2026-02-13T23:20:00Z', bankCode: 'BCA' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
