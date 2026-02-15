/**
 * @deprecated Import from './limits' instead.
 * This file re-exports from limits.ts for backward compatibility.
 */
export * from './limits';

// Additional constants specific to this file
export const MONEY = {
  MINOR_UNIT_DIVISOR: 100,
  DEFAULT_CURRENCY: 'IDR',
  DECIMAL_PLACES: 2,
} as const;

export const WALLET_LIMITS = {
  MIN_DEPOSIT: 10,
  MAX_DEPOSIT: 100_000_000,
  MIN_WITHDRAWAL: 50,
  MAX_WITHDRAWAL: 10_000_000,
  MAX_DAILY_WITHDRAWALS: 5,
  MAX_DAILY_WITHDRAWAL_AMOUNT: 50_000_000,
  MAX_BALANCE: 1_000_000_000,
} as const;

export const ESCROW_LIMITS = {
  MIN_AMOUNT: 10_000,
  MAX_AMOUNT: 500_000_000,
  MAX_HOLD_DAYS: 90,
  AUTO_RELEASE_DAYS: 14,
} as const;

export const RATE_LIMITS = {
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_WINDOW_MINUTES: 15,
  OTP_MAX_ATTEMPTS: 3,
  OTP_WINDOW_MINUTES: 5,
  API_DEFAULT_PER_MINUTE: 100,
  API_STRICT_PER_MINUTE: 10,
} as const;

export const FILE_LIMITS = {
  MAX_KYC_FILE_SIZE_MB: 5,
  MAX_PROFILE_PHOTO_SIZE_MB: 2,
  ALLOWED_KYC_MIME_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  ALLOWED_PHOTO_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const PAGINATION = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 20,
  DEFAULT_PAGE: 1,
  MAX_PAGE: 10000,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_SIZE_MB: 10,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  MAX_FILES_PER_UPLOAD: 10,
  KYC_MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  KYC_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
} as const;

export const AUTH = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  TOKEN_EXPIRY_HOURS: 24,
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  MAX_SESSIONS: 5,
  SESSION_EXPIRY_DAYS: 30,
} as const;
