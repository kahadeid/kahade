import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';



export class VerifyKycDto {
  @ApiProperty({
    description: 'KYC submission ID to verify',
    example: 'kyc-123456789',
  })
  @IsString()
  @IsNotEmpty()
  kycId: string;

  @ApiPropertyOptional({
    description: 'Verification notes',
    example: 'All documents verified successfully',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
