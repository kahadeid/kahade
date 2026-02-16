import { registerAs } from '@nestjs/config';

export default registerAs('sms', () => ({
  provider: process.env.SMS_PROVIDER || '',
  apiKey: process.env.SMS_API_KEY || '',
  apiSecret: process.env.SMS_API_SECRET || '',
  from: process.env.SMS_FROM || 'Kahade',
}));
