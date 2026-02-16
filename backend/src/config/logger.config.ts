import { registerAs } from '@nestjs/config';

export default registerAs('logger', () => ({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'json',
  filePath: process.env.LOG_DIR || process.env.LOG_FILE_PATH || './logs',
}));
