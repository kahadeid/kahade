import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  redis: {
    host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.QUEUE_REDIS_PORT || process.env.REDIS_PORT, 10) || 6379,
    db: parseInt(process.env.QUEUE_REDIS_DB, 10) || 1,
  },
  enabled: process.env.REDIS_ENABLED === 'true',
}));
