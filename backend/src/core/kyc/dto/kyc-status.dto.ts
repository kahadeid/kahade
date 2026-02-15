import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';



export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESUBMIT = 'RESUBMIT',
}

export class KycStatusDto {
  @ApiProperty({
    description: 'User ID',
    example: 'usr-123456789',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'KYC verification status',
    enum: KycStatus,
    example: KycStatus.APPROVED,
  })
  @IsEnum(KycStatus)
  status: KycStatus;

  @ApiPropertyOptional({
    description: 'Status message',
    example: 'KYC approved successfully',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Rejection reason (if rejected)',
    example: 'ID card not clear',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
