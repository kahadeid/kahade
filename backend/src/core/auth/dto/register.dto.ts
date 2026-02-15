import { ApiProperty } from '@nestjs/swagger';
import { AUTH } from '@common/constants/limits.constants';


import {

  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * Register DTO (HIGH-001)
 * Complete validation with strong password requirements
 */
export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Username (alphanumeric and underscore only)',
    example: 'john_doe',
    minLength: AUTH.USERNAME_MIN_LENGTH,
    maxLength: AUTH.USERNAME_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(AUTH.USERNAME_MIN_LENGTH)
  @MaxLength(AUTH.USERNAME_MAX_LENGTH)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({
    description:
      'Strong password (min 8 chars, must include uppercase, lowercase, number, and special character)',
    example: 'SecureP@ssw0rd',
    minLength: AUTH.PASSWORD_MIN_LENGTH,
    maxLength: AUTH.PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(AUTH.PASSWORD_MIN_LENGTH)
  @MaxLength(AUTH.PASSWORD_MAX_LENGTH)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}
