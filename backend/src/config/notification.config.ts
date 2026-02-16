import { registerAs } from '@nestjs/config';

export default registerAs('notification', () => ({
  email: {
    enabled: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
  },
  sms: {
    enabled: process.env.ENABLE_SMS_VERIFICATION === 'true',
  },
  push: {
    enabled: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
  },
}));
