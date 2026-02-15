import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray } from 'class-validator';



export class SubmitProofDto {
  @ApiProperty({
    description: 'Order ID',
    example: 'ord-123456789',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({
    description: 'Proof image URLs (uploaded separately)',
    example: ['/uploads/proof/image1.jpg', '/uploads/proof/image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({
    description: 'Delivery notes or description',
    example: 'Package delivered at 2PM',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Recipient name who received the package',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recipientName?: string;
}
