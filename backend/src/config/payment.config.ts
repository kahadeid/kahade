import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  gateway: process.env.PAYMENT_GATEWAY || 'midtrans',
  apiKey: process.env.PAYMENT_API_KEY || '',
  webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  sandbox: process.env.PAYMENT_SANDBOX !== 'false',
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  },
}));
