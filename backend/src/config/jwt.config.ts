import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production-32chars',
  expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret-key-change-prod-32chars',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
}));
