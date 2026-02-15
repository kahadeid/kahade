import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';



export class RedeemVoucherDto {
  @ApiProperty({
    description: 'Voucher code to redeem',
    example: 'WELCOME2026',
    minLength: 4,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  voucherCode: string;

  @ApiProperty({
    description: 'Order ID to apply voucher to',
    example: 'ord-123456789',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
