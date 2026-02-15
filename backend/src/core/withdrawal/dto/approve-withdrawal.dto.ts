import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';



export class ApproveWithdrawalDto {
  @ApiProperty({
    description: 'Withdrawal request ID to approve',
    example: 'wdr-123456789',
  })
  @IsString()
  @IsNotEmpty()
  withdrawalId: string;

  @ApiPropertyOptional({
    description: 'Admin notes or comments',
    example: 'Verified and approved',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
