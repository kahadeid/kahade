import { ApiProperty } from '@nestjs/swagger';
import { AUTH } from '@common/constants/limits.constants';
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';



/**
 * Login DTO (HIGH-001)
 * Complete validation for login requests
 */
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecureP@ssw0rd',
    minLength: AUTH.PASSWORD_MIN_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(AUTH.PASSWORD_MIN_LENGTH)
  password: string;
}
