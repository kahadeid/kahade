
import * as Joi from 'joi';

/**
 * Environment Variable Validation (HIGH-035)
 *
 * Features:
 * - Schema-based validation
 * - Required variables checking
 * - Type conversion
 * - Default values
 * - Startup validation
 */

export interface EnvironmentVariables {
  // Application
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
  APP_NAME: string;
  APP_URL: string;

  // Database
  DATABASE_URL: string;
  DATABASE_POOL_MIN: number;
  DATABASE_POOL_MAX: number;

  // Redis
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  REDIS_PASSWORD?: string;

  // JWT
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_EXPIRES: string;

  // Encryption
  ENCRYPTION_KEY: string;

  // Payment Gateway
  XENDIT_SECRET_KEY?: string;
  XENDIT_CALLBACK_TOKEN?: string;
  MIDTRANS_SERVER_KEY?: string;
  MIDTRANS_CLIENT_KEY?: string;

  // Email
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;

  // Storage
  STORAGE_TYPE: 'local' | 's3' | 'gcs';
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_BUCKET?: string;

  // Monitoring
  SENTRY_DSN?: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug' | 'verbose';

  // Security
  CORS_ORIGINS: string;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;

  // Feature Flags
  ENABLE_SWAGGER: boolean;
  ENABLE_METRICS: boolean;
}

export const envValidationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  APP_NAME: Joi.string().default('Kahade API'),
  APP_URL: Joi.string().uri().required(),

  // Database
  DATABASE_URL: Joi.string().required(),
  DATABASE_POOL_MIN: Joi.number().min(0).default(2),
  DATABASE_POOL_MAX: Joi.number().min(1).default(10),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow(''),

  // JWT
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .custom((value, helpers) => {
      const forbiddenPatterns = ['CHANGE', 'TODO', 'FIXME', 'REPLACE', 'PLACEHOLDER', 'SECRET_IN_PRODUCTION'];
      const upperValue = value.toUpperCase();
      for (const pattern of forbiddenPatterns) {
        if (upperValue.includes(pattern)) {
          return helpers.error('any.invalid', { 
            message: `JWT_SECRET contains placeholder text "${pattern}". Generate a secure secret using: openssl rand -base64 48` 
          });
        }
      }
      return value;
    }),
  JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES: Joi.string().default('7d'),

  // Encryption
  ENCRYPTION_KEY: Joi.string().length(32).required(),

  // Payment Gateway
  XENDIT_SECRET_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  XENDIT_CALLBACK_TOKEN: Joi.string(),
  MIDTRANS_SERVER_KEY: Joi.string(),
  MIDTRANS_CLIENT_KEY: Joi.string(),

  // Email
  SMTP_HOST: Joi.string(),
  SMTP_PORT: Joi.number().port(),
  SMTP_USER: Joi.string(),
  SMTP_PASS: Joi.string(),

  // Storage
  STORAGE_TYPE: Joi.string()
    .valid('local', 's3', 'gcs')
    .default('local'),
  AWS_ACCESS_KEY_ID: Joi.string().when('STORAGE_TYPE', {
    is: 's3',
    then: Joi.required(),
  }),
  AWS_SECRET_ACCESS_KEY: Joi.string().when('STORAGE_TYPE', {
    is: 's3',
    then: Joi.required(),
  }),
  AWS_BUCKET: Joi.string().when('STORAGE_TYPE', {
    is: 's3',
    then: Joi.required(),
  }),

  // Monitoring
  SENTRY_DSN: Joi.string().uri(),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),

  // Security
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW: Joi.number().default(60000), // 1 minute
  RATE_LIMIT_MAX: Joi.number().default(100),

  // Feature Flags
  ENABLE_SWAGGER: Joi.boolean().default(true),
  ENABLE_METRICS: Joi.boolean().default(true),
});

/**
 * Validate environment variables
 */
export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const { error, value } = envValidationSchema.validate(config, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message).join(', ');
    throw new Error(`Environment validation failed: ${errors}`);
  }

  return value;
}

/**
 * Usage in app.module.ts:
 *
 * import { ConfigModule } from '@nestjs/config';
 * import { validateEnv } from './common/config/env.validation';
 *
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({
 *       validate: validateEnv,
 *       validationOptions: {
 *         abortEarly: false,
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 */
