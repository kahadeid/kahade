import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  csrf: {
    secret: process.env.CSRF_SECRET || 'dev-csrf-secret-key',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-characters!',
    iv: process.env.ENCRYPTION_IV || 'dev-iv-16-chars!!',
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'dev-session-secret-key-change-in-production-32chars',
  },
  cookie: {
    secret: process.env.COOKIE_SECRET || 'dev-cookie-secret-key-change-in-prod-32chars',
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-32chars',
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret-key-change-prod-32chars',
    refreshExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  },
  bruteForce: {
    maxAttempts: parseInt(process.env.THROTTLE_LOGIN_LIMIT, 10) || 5,
    lockDuration: 900,
  },
  hsts: {
    maxAge: parseInt(process.env.HSTS_MAX_AGE, 10) || 31536000,
  },
}));
