import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';



export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Username',
    example: 'johndoe',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '08123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Bio or description',
    example: 'Experienced trader',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
