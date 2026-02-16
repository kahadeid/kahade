import { registerAs } from '@nestjs/config';

export default registerAs('monitoring', () => ({
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  },
  metrics: {
    enabled: process.env.ENABLE_METRICS !== 'false',
    port: parseInt(process.env.METRICS_PORT, 10) || 9090,
  },
}));
