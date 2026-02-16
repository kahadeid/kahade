import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '',
  from: {
    email: process.env.EMAIL_FROM || process.env.SMTP_FROM_EMAIL || 'noreply@kahade.id',
    name: process.env.SMTP_FROM_NAME || 'Kahade',
  },
}));
