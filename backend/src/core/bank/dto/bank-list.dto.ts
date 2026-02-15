import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';



export class BankDto {
  @ApiProperty({
    description: 'Bank code',
    example: 'BCA',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Bank name',
    example: 'Bank Central Asia',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Bank logo URL',
    example: 'https://example.com/logo/bca.png',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({
    description: 'Whether the bank is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}

export class BankListDto {
  @ApiProperty({
    description: 'List of banks',
    type: [BankDto],
  })
  banks: BankDto[];
}
