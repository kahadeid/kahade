import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';


import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Comprehensive Input Validation (HIGH-028)
 *
 * Custom validators for:
 * - Indonesian phone numbers
 * - Strong passwords
 * - Unique database values
 * - Date ranges
 * - Currency amounts
 * - File types
 */

/**
 * Validate Indonesian phone number
 */
export function IsIndonesianPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isIndonesianPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          // Remove all non-digits
          const cleaned = value.replace(/\D/g, '');

          // Should start with 62 (country code) or 0
          // Length: 10-13 digits after country code
          return /^(62|0)8[0-9]{8,11}$/.test(cleaned);
        },
        defaultMessage() {
          return 'Phone number must be a valid Indonesian phone number (e.g., 081234567890 or +6281234567890)';
        },
      },
    });
  };
}

/**
 * Validate strong password
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          // At least 8 characters
          if (value.length < 8) return false;

          // Contains uppercase
          if (!/[A-Z]/.test(value)) return false;

          // Contains lowercase
          if (!/[a-z]/.test(value)) return false;

          // Contains number
          if (!/[0-9]/.test(value)) return false;

          // Contains special character
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return false;

          return true;
        },
        defaultMessage() {
          return 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character';
        },
      },
    });
  };
}

/**
 * Validate unique value in database
 */
@ValidatorConstraint({ name: 'IsUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments) {
    const [model, field] = args.constraints;

    const record = await (this.prisma as any)[model].findFirst({
      where: { [field]: value },
    });

    return !record;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} already exists`;
  }
}

export function IsUnique(
  model: string,
  field: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [model, field],
      validator: IsUniqueConstraint,
    });
  };
}

/**
 * Validate date is after another date
 */
export function IsAfterDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!value || !relatedValue) return true;

          const date1 = new Date(value);
          const date2 = new Date(relatedValue);

          return date1 > date2;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}

/**
 * Validate positive currency amount
 */
export function IsCurrencyAmount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCurrencyAmount',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'number' && typeof value !== 'string') {
            return false;
          }

          const num = typeof value === 'string' ? parseFloat(value) : value;

          // Must be positive
          if (num <= 0) return false;

          // Max 2 decimal places
          if (!/^\d+(\.\d{1,2})?$/.test(num.toString())) return false;

          return true;
        },
        defaultMessage() {
          return 'Amount must be a positive number with maximum 2 decimal places';
        },
      },
    });
  };
}

/**
 * Validate file type
 */
export function IsFileType(
  allowedTypes: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFileType',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [allowedTypes],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || !value.mimetype) return false;

          const [allowedTypes] = args.constraints;
          return allowedTypes.includes(value.mimetype);
        },
        defaultMessage(args: ValidationArguments) {
          const [allowedTypes] = args.constraints;
          return `File type must be one of: ${allowedTypes.join(', ')}`;
        },
      },
    });
  };
}

/**
 * Example usage:
 *
 * export class CreateUserDto {
 *   @IsEmail()
 *   @IsUnique('user', 'email')
 *   email: string;
 *
 *   @IsStrongPassword()
 *   password: string;
 *
 *   @IsIndonesianPhone()
 *   phone: string;
 *
 *   @IsCurrencyAmount()
 *   initialBalance: number;
 * }
 */
