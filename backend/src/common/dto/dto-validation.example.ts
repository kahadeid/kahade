import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';


import DOMPurify from 'isomorphic-dompurify';

import {

/**
 * DTO Validation & Sanitization Examples
 *
 * This file demonstrates best practices for creating secure DTOs
 * with comprehensive validation and input sanitization.
 *
 * Copy these patterns when creating new DTOs.
 */

  IsString,
  IsNumber,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsInt,
  Min,
  Max,
  MaxLength,
  MinLength,
  Matches,
  IsBoolean,
  IsDate,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsUUID,
  IsUrl,
  IsMobilePhone,
} from 'class-validator';

/**
 * Helper function to sanitize HTML input
 * Removes potentially dangerous HTML/scripts while preserving safe formatting
 */
function sanitizeHtml(value: string): string {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

/**
 * Helper to trim and sanitize string input
 */
function sanitizeString(value: string): string {
  return DOMPurify.sanitize(value.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Example: Order Creation DTO
 * Demonstrates validation for financial transactions
 */
export class CreateOrderExampleDto {
  @ApiProperty({
    description: 'Order title',
    example: 'Website Development Service',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @MinLength(5, { message: 'Title must be at least 5 characters' })
  @Transform(({ value }) => sanitizeString(value))
  title: string;

  @ApiProperty({
    description: 'Order description',
    example: 'Full-stack web application development',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  @Transform(({ value }) => sanitizeHtml(value))
  description: string;

  @ApiProperty({
    description: 'Order amount in smallest currency unit (e.g., cents)',
    example: 1000000,
    minimum: 1,
    maximum: 1000000000,
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsInt({ message: 'Amount must be an integer' })
  @IsPositive({ message: 'Amount must be positive' })
  @Min(1, { message: 'Amount must be at least 1' })
  @Max(1000000000, { message: 'Amount exceeds maximum allowed value' })
  amount: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'IDR',
    enum: ['IDR', 'USD'],
  })
  @IsString()
  @IsEnum(['IDR', 'USD'], { message: 'Currency must be either IDR or USD' })
  currency: 'IDR' | 'USD';

  @ApiPropertyOptional({
    description: 'Optional notes for the order',
    example: 'Please deliver by end of month',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => (value ? sanitizeString(value) : undefined))
  notes?: string;
}

/**
 * Example: User Registration DTO
 * Demonstrates validation for authentication
 */
export class RegisterUserExampleDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255)
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'User password (min 8 chars, must include uppercase, lowercase, number, special char)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(100)
  @Transform(({ value }) => sanitizeString(value))
  fullName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+628123456789',
  })
  @IsMobilePhone('id-ID', {}, { message: 'Invalid Indonesian phone number' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;
}

/**
 * Example: Nested DTO Validation
 * Demonstrates validation for complex nested objects
 */
export class AddressDto {
  @ApiProperty({ example: 'Jl. Sudirman No. 123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => sanitizeString(value))
  street: string;

  @ApiProperty({ example: 'Jakarta Selatan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => sanitizeString(value))
  city: string;

  @ApiProperty({ example: 'DKI Jakarta' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => sanitizeString(value))
  province: string;

  @ApiProperty({ example: '12190' })
  @IsString()
  @Matches(/^\d{5}$/, { message: 'Postal code must be 5 digits' })
  postalCode: string;
}

export class UserProfileExampleDto {
  @ApiProperty()
  @IsUUID('4', { message: 'Invalid user ID format' })
  userId: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Transform(({ value }) => value.map((v: string) => sanitizeString(v)))
  tags?: string[];
}

/**
 * Example: Query/Filter DTO
 * Demonstrates validation for search and pagination
 */
export class SearchOrdersExampleDto {
  @ApiPropertyOptional({ example: 'pending', enum: ['pending', 'completed', 'cancelled'] })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'cancelled'])
  status?: 'pending' | 'completed' | 'cancelled';

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'amount'])
  sortBy?: 'createdAt' | 'updatedAt' | 'amount';

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ example: 'search term' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => sanitizeString(value))
  search?: string;
}

/**
 * Key Takeaways:
 *
 * 1. Always use @IsNotEmpty() for required fields
 * 2. Add @MaxLength() to prevent database overflow
 * 3. Use @Transform() with sanitization functions
 * 4. Add descriptive error messages
 * 5. Use @IsEnum() for predefined values
 * 6. Validate nested objects with @ValidateNested()
 * 7. Use @Type() for proper type transformation
 * 8. Add Swagger decorators for API documentation
 * 9. For financial data, use integers (smallest unit) to avoid floating point issues
 * 10. Always sanitize user input to prevent XSS
 */
