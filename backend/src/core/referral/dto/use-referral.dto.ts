import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';



export class UseReferralDto {
  @ApiProperty({
    description: 'Referral code to use',
    example: 'REFER2026ABC',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  referralCode: string;
}
