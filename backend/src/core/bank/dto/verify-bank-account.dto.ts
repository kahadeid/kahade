import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';



export class VerifyBankAccountDto {
  @ApiProperty({
    description: 'Bank code to verify',
    example: 'BCA',
  })
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @ApiProperty({
    description: 'Bank account number to verify',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  accountNumber: string;
}
