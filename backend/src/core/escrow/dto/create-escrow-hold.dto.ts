import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';



export class CreateEscrowHoldDto {
  @ApiProperty({
    description: 'Order ID to hold escrow for',
    example: 'ord-123456789',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'Amount to hold in escrow (minor units)',
    example: 500000,
    minimum: 1,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Buyer user ID',
    example: 'usr-buyer-123',
  })
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @ApiProperty({
    description: 'Seller user ID',
    example: 'usr-seller-456',
  })
  @IsString()
  @IsNotEmpty()
  sellerId: string;
}
