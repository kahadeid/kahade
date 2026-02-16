
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  FRONTEND_URL: Joi.string().optional().default('http://localhost:5000'),
  API_PREFIX: Joi.string().default('api'),
  ENABLE_SWAGGER: Joi.string().valid('true', 'false').default('false'),

  DATABASE_URL: Joi.string().required(),
  POSTGRES_USER: Joi.string().optional(),
  POSTGRES_PASSWORD: Joi.string().optional(),
  POSTGRES_DB: Joi.string().optional(),

  REDIS_HOST: Joi.string().optional().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_DB: Joi.number().default(0),
  REDIS_URL: Joi.string().optional(),
  REDIS_ENABLED: Joi.string().valid('true', 'false').default('false'),
  REDIS_TLS_ENABLED: Joi.string().valid('true', 'false').default('false'),

  JWT_SECRET: Joi.string().optional().default('dev-jwt-secret-key-change-in-production-32chars'),
  JWT_REFRESH_SECRET: Joi.string().optional().default('dev-jwt-refresh-secret-key-change-prod-32chars'),
  JWT_ACCESS_TOKEN_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: Joi.string().default('7d'),

  ENCRYPTION_KEY: Joi.string().optional().default('dev-encryption-key-32-characters!'),
  ENCRYPTION_IV: Joi.string().optional().default('dev-iv-16-chars!!'),

  SESSION_SECRET: Joi.string().optional().default('dev-session-secret-key-change-in-production-32chars'),
  COOKIE_SECRET: Joi.string().optional().default('dev-cookie-secret-key-change-in-prod-32chars'),
  CSRF_SECRET: Joi.string().optional().default('dev-csrf-secret-key'),
  BCRYPT_ROUNDS: Joi.number().min(10).max(14).default(12),

  SMTP_HOST: Joi.string().optional().allow(''),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.string().valid('true', 'false').default('false'),
  SMTP_USER: Joi.string().optional().allow(''),
  SMTP_PASSWORD: Joi.string().optional().allow(''),
  SMTP_FROM_NAME: Joi.string().default('Kahade'),
  SMTP_FROM_EMAIL: Joi.string().default('noreply@kahade.id'),

  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  THROTTLE_LOGIN_LIMIT: Joi.number().default(5),
  THROTTLE_OTP_LIMIT: Joi.number().default(3),

  CORS_ORIGIN: Joi.string().optional(),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  HSTS_MAX_AGE: Joi.number().default(31536000),

  MAX_FILE_SIZE: Joi.number().default(10485760),
  UPLOAD_PATH: Joi.string().default('./uploads'),
  ALLOWED_FILE_TYPES: Joi.string().default('image/jpeg,image/png,image/webp,application/pdf'),

  SENTRY_DSN: Joi.string().uri().optional().allow(''),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  ENABLE_METRICS: Joi.string().valid('true', 'false').default('true'),
  LOG_FILE_PATH: Joi.string().default('./logs'),

  ENABLE_2FA: Joi.boolean().default(true),
  ENABLE_EMAIL_VERIFICATION: Joi.boolean().default(true),
  ENABLE_SMS_VERIFICATION: Joi.boolean().default(false),

  MIDTRANS_SERVER_KEY: Joi.string().optional().allow(''),
  MIDTRANS_CLIENT_KEY: Joi.string().optional().allow(''),
  MIDTRANS_IS_PRODUCTION: Joi.boolean().default(false),
}).options({ allowUnknown: true });
