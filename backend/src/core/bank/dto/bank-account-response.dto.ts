import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';



export class BankAccountResponseDto {
  @ApiProperty({
    description: 'Bank account ID',
    example: 'ba-123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Bank code',
    example: 'BCA',
  })
  @IsString()
  bankCode: string;

  @ApiProperty({
    description: 'Bank account number',
    example: '1234567890',
  })
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'Account holder name',
    example: 'John Doe',
  })
  @IsString()
  accountHolderName: string;

  @ApiProperty({
    description: 'Whether the account is verified',
    example: true,
  })
  @IsBoolean()
  isVerified: boolean;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'Bank Central Asia',
  })
  @IsOptional()
  @IsString()
  bankName?: string;
}
