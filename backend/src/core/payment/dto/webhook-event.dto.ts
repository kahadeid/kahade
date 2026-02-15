import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';



export enum WebhookEventType {
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_EXPIRED = 'PAYMENT_EXPIRED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
}

export class WebhookEventDto {
  @ApiProperty({
    description: 'Webhook event type',
    enum: WebhookEventType,
    example: WebhookEventType.PAYMENT_RECEIVED,
  })
  @IsEnum(WebhookEventType)
  eventType: WebhookEventType;

  @ApiProperty({
    description: 'Event payload data',
    example: { transactionId: 'TRX-123', amount: 500000 },
  })
  @IsObject()
  payload: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Webhook signature for verification',
    example: 'hmac-sha256-signature',
  })
  @IsOptional()
  @IsString()
  signature?: string;
}
