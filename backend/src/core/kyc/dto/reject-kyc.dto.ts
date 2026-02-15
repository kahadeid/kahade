import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';



export class RejectKycDto {
  @ApiProperty({
    description: 'KYC submission ID to reject',
    example: 'kyc-123456789',
  })
  @IsString()
  @IsNotEmpty()
  kycId: string;

  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Blurred ID card image',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
