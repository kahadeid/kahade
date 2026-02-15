import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEmail } from 'class-validator';



export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'usr-123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '08123456789',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  @IsBoolean()
  isEmailVerified: boolean;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2026-01-01T00:00:00Z',
  })
  @IsString()
  createdAt: string;
}
