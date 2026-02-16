import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';



export class CreateWithdrawalDto {
  @ApiProperty({
    description: 'User ID requesting withdrawal',
    example: 'usr-123456789',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Bank account ID to withdraw to',
    example: 'ba-123456789',
  })
  @IsString()
  @IsNotEmpty()
  bankAccountId: string;

  @ApiProperty({
    description: 'Amount in minor units (cents/sen)',
    example: '50000000',
  })
  @IsNumberString()
  @Transform(({ value }) => BigInt(value))
  amountMinor: bigint;

  @ApiProperty({
    description: 'Idempotency key for duplicate prevention',
    example: 'wdr-req-20260213-abc123',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  idempotencyKey: string;

  @ApiPropertyOptional({
    description: 'User IP address (for fraud detection)',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent string (for fraud detection)',
    example: 'Mozilla/5.0...',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Device fingerprint (for fraud detection)',
    example: 'fp-abc123def456',
  })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}
