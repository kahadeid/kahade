import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';



export class AssignPromoDto {
  @ApiProperty({
    description: 'Promo code to assign',
    example: 'VIP2026',
  })
  @IsString()
  @IsNotEmpty()
  promoCode: string;

  @ApiProperty({
    description: 'User IDs to assign promo to',
    example: ['usr-123', 'usr-456', 'usr-789'],
  })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiPropertyOptional({
    description: 'Assignment notes',
    example: 'VIP customer exclusive promo',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
