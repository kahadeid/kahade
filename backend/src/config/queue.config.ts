import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  redis: {
    host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.QUEUE_REDIS_PORT || process.env.REDIS_PORT, 10) || 6379,
    // FIX: QUEUE_REDIS_PASSWORD was missing — Bull queue would fail auth if Redis requires password.
    // Falls back to REDIS_PASSWORD if no dedicated queue Redis password is set.
    password: process.env.QUEUE_REDIS_PASSWORD || process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.QUEUE_REDIS_DB, 10) || 1,
  },
  enabled: process.env.REDIS_ENABLED === 'true',
}));
