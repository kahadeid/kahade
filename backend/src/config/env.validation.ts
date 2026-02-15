
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().required(),
  API_PREFIX: Joi.string().default('api'),
  ENABLE_SWAGGER: Joi.string().valid('true', 'false').default('false'),

  // Database
  DATABASE_URL: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().min(16).required(),
  POSTGRES_DB: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().min(16).required(),
  REDIS_DB: Joi.number().default(0),
  REDIS_URL: Joi.string().optional(),
  REDIS_ENABLED: Joi.string().valid('true', 'false').default('false'),
  REDIS_TLS_ENABLED: Joi.string().valid('true', 'false').default('false'),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  // Support both naming conventions (canonical: JWT_ACCESS_TOKEN_EXPIRY)
  JWT_ACCESS_TOKEN_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: Joi.string().default('7d'),

  // Encryption
  ENCRYPTION_KEY: Joi.string().min(32).required(),
  ENCRYPTION_IV: Joi.string().min(16).required(),

  // Session & Cookie
  SESSION_SECRET: Joi.string().min(32).required(),
  COOKIE_SECRET: Joi.string().min(32).when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  CSRF_SECRET: Joi.string().min(16).when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  BCRYPT_ROUNDS: Joi.number().min(10).max(14).default(12),

  // Email (SMTP_* canonical naming)
  SMTP_HOST: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.string().valid('true', 'false').default('false'),
  SMTP_USER: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  SMTP_PASSWORD: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  SMTP_FROM_NAME: Joi.string().default('Kahade'),
  SMTP_FROM_EMAIL: Joi.string().email().default('noreply@kahade.id'),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  THROTTLE_LOGIN_LIMIT: Joi.number().default(5),
  THROTTLE_OTP_LIMIT: Joi.number().default(3),

  // CORS - comma-separated list of origins, NOT a single URI
  CORS_ORIGIN: Joi.string().optional(),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // Security
  HSTS_MAX_AGE: Joi.number().default(31536000),

  // File Upload
  MAX_FILE_SIZE: Joi.number().default(10485760),
  UPLOAD_PATH: Joi.string().default('./uploads'),
  ALLOWED_FILE_TYPES: Joi.string().default('image/jpeg,image/png,image/webp,application/pdf'),

  // Monitoring
  SENTRY_DSN: Joi.string().uri().optional().allow(''),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  ENABLE_METRICS: Joi.string().valid('true', 'false').default('true'),
  LOG_FILE_PATH: Joi.string().default('./logs'),

  // Features
  ENABLE_2FA: Joi.boolean().default(true),
  ENABLE_EMAIL_VERIFICATION: Joi.boolean().default(true),
  ENABLE_SMS_VERIFICATION: Joi.boolean().default(false),

  // Payment Gateway
  MIDTRANS_SERVER_KEY: Joi.string().optional().allow(''),
  MIDTRANS_CLIENT_KEY: Joi.string().optional().allow(''),
  MIDTRANS_IS_PRODUCTION: Joi.boolean().default(false),
});
