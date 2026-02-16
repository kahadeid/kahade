import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  name: process.env.APP_NAME || 'Kahade',
  url: process.env.APP_URL || 'http://localhost:5000',
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  apiPrefix: process.env.API_PREFIX || 'api',
  enableSwagger: process.env.ENABLE_SWAGGER === 'true',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5000',
  rateLimit: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS !== 'false',
  },
}));
