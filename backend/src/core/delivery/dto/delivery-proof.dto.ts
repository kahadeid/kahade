import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';



export class DeliveryProofDto {
  @ApiProperty({
    description: 'Delivery proof ID',
    example: 'dlv-proof-123',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'ord-123456789',
  })
  @IsString()
  orderId: string;

  @ApiPropertyOptional({
    description: 'Proof images URLs',
    example: ['https://example.com/proof1.jpg', 'https://example.com/proof2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Delivery notes',
    example: 'Package delivered to recipient',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Submission timestamp',
    example: '2026-02-13T23:20:00Z',
  })
  @IsString()
  submittedAt: string;
}
