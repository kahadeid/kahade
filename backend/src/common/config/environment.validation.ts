import { plainToInstance } from 'class-transformer';


import {

  IsString,
  IsNumber,
  IsEnum,
  IsUrl,
  IsOptional,
  validateSync,
  Min,
  Max,
} from 'class-validator';

/**
 * Environment Variable Validation (MED-004)
 *
 * Ensures all required environment variables are present
 * and have valid values before application starts.
 */

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

export class EnvironmentVariables {
  // Node Environment
  @IsEnum(Environment)
  NODE_ENV: Environment;

  // Server
  @IsNumber()
  @Min(1000)
  @Max(65535)
  PORT: number;

  // Database
  @IsUrl({ require_tld: false })
  DATABASE_URL: string;

  // JWT
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsNumber()
  @Min(60) // At least 1 minute
  @Max(86400) // Max 24 hours
  JWT_EXPIRES_IN: number;

  @IsNumber()
  @Min(86400) // At least 1 day
  @Max(2592000) // Max 30 days
  JWT_REFRESH_EXPIRES_IN: number;

  // Email
  @IsString()
  @IsOptional()
  EMAIL_HOST?: string;

  @IsNumber()
  @IsOptional()
  EMAIL_PORT?: number;

  @IsString()
  @IsOptional()
  EMAIL_USER?: string;

  @IsString()
  @IsOptional()
  EMAIL_PASSWORD?: string;

  @IsString()
  @IsOptional()
  EMAIL_FROM?: string;

  // Frontend URL
  @IsUrl()
  FRONTEND_URL: string;

  // API
  @IsUrl()
  API_URL: string;

  // Rate Limiting
  @IsNumber()
  @Min(1)
  @IsOptional()
  THROTTLE_TTL?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  THROTTLE_LIMIT?: number;

  // Session
  @IsString()
  @IsOptional()
  SESSION_BIND_IP?: string;

  // File Upload
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  MAX_FILE_SIZE_MB?: number;

  // Redis (optional)
  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  // Payment Gateway
  @IsString()
  @IsOptional()
  PAYMENT_GATEWAY_API_KEY?: string;

  @IsString()
  @IsOptional()
  PAYMENT_GATEWAY_SECRET?: string;
}

/**
 * Validate environment variables
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = Object.values(error.constraints || {});
        return `${error.property}: ${constraints.join(', ')}`;
      })
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${errorMessages}\n\n` +
        'Please check your .env file and ensure all required variables are set.',
    );
  }

  return validatedConfig;
}
