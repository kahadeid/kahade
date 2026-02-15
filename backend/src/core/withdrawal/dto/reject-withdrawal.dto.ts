import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';



export class RejectWithdrawalDto {
  @ApiProperty({
    description: 'Withdrawal request ID to reject',
    example: 'wdr-123456789',
  })
  @IsString()
  @IsNotEmpty()
  withdrawalId: string;

  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Insufficient verification',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
