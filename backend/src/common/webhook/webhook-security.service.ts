import { Injectable, UnauthorizedException } , Logger from '@nestjs/common';


import * as crypto from 'crypto';

/**
 * Webhook Security (HIGH-034)
 *
 * Features:
 * - HMAC signature verification
 * - Replay attack prevention
 * - Timestamp validation
 * - Multiple signature algorithms
 * - Webhook event logging
 */

interface WebhookPayload {
  [key: string]: any;
}

interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
}

@Injectable()
export class WebhookSecurityService {
  private readonly REPLAY_TOLERANCE = 5 * 60 * 1000; // 5 minutes
  private processedWebhooks = new Set<string>();

  /**
   * Verify webhook signature (HMAC-SHA256)
   */
  verifySignature(
    payload: string | Buffer,
    signature: string,
    secret: string,
    algorithm: 'sha256' | 'sha512' = 'sha256',
  ): boolean {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Verify webhook with timestamp (Stripe-style)
   */
  verifyWebhook(
    payload: string,
    signature: string,
    secret: string,
    timestamp: number,
  ): WebhookVerificationResult {
    // Check timestamp to prevent replay attacks
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = Math.abs(currentTime - timestamp);

    if (timeDifference > this.REPLAY_TOLERANCE / 1000) {
      return {
        valid: false,
        error: 'Webhook timestamp is too old or too far in the future',
      };
    }

    // Create signed payload (timestamp.payload)
    const signedPayload = `${timestamp}.${payload}`;

    // Verify signature
    const isValid = this.verifySignature(signedPayload, signature, secret);

    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid webhook signature',
      };
    }

    // Check for duplicate/replay
    const webhookId = this.generateWebhookId(signedPayload);
    if (this.processedWebhooks.has(webhookId)) {
      return {
        valid: false,
        error: 'Webhook already processed (replay detected)',
      };
    }

    // Mark as processed
    this.processedWebhooks.add(webhookId);

    // Clean up old webhook IDs (to prevent memory leak)
    if (this.processedWebhooks.size > 10000) {
      const toDelete = Array.from(this.processedWebhooks).slice(0, 5000);
      toDelete.forEach((id) => this.processedWebhooks.delete(id));
    }

    return { valid: true };
  }

  /**
   * Generate webhook signature for sending
   */
  generateSignature(
    payload: WebhookPayload,
    secret: string,
    algorithm: 'sha256' | 'sha512' = 'sha256',
  ): { signature: string; timestamp: number } {
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadString = JSON.stringify(payload);
    const signedPayload = `${timestamp}.${payloadString}`;

    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(signedPayload);
    const signature = hmac.digest('hex');

    return { signature, timestamp };
  }

  /**
   * Generate unique webhook ID
   */
  private generateWebhookId(payload: string): string {
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Verify Xendit signature
   */
  verifyXenditSignature(
    payload: string,
    signature: string,
    callbackToken: string,
  ): boolean {
    return this.verifySignature(payload, signature, callbackToken);
  }

  /**
   * Verify Midtrans signature
   */
  verifyMidtransSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    serverKey: string,
    receivedSignature: string,
  ): boolean {
    const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const hash = crypto.createHash('sha512').update(signatureString).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(receivedSignature),
    );
  }
}

/**
 * Webhook verification decorator
 */
export function VerifyWebhook(secretKey: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const [req] = args;
      const webhookService: WebhookSecurityService =
        this.webhookSecurityService;

      if (!webhookService) {
        throw new UnauthorizedException('Webhook security service not found');
      }

      // Get signature from header
      const signature = req.headers['x-webhook-signature'];
      const timestamp = parseInt(req.headers['x-webhook-timestamp'], 10);

      if (!signature || !timestamp) {
        throw new UnauthorizedException('Missing webhook signature or timestamp');
      }

      // Verify webhook
      const result = webhookService.verifyWebhook(
        JSON.stringify(req.body),
        signature,
        secretKey,
        timestamp,
      );

      if (!result.valid) {
        throw new UnauthorizedException(result.error);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Example usage:
 *
 * @Controller('webhooks')
 * export class WebhookController {
 *   constructor(
 *     private webhookSecurityService: WebhookSecurityService,
 *   , private readonly logger: Logger) {}
 *
 *   @Post('payment')
 *   @VerifyWebhook(process.env.WEBHOOK_SECRET)
 *   async handlePaymentWebhook(
 *     @Req() req: Request,
 *     @Body() payload: any,
 *   ) {
 *     // Webhook is verified, process the event
 *     return { received: true };
 *   }
 *
 *   @Post('xendit')
 *   async handleXenditWebhook(
 *     @Req() req: Request,
 *     @Body() payload: any,
 *   ) {
 *     const signature = req.headers['x-callback-token'] as string;
 *     const isValid = this.webhookSecurityService.verifyXenditSignature(
 *       JSON.stringify(payload),
 *       signature,
 *       process.env.XENDIT_CALLBACK_TOKEN,
 *     );
 *
 *     if (!isValid) {
 *       throw new UnauthorizedException('Invalid webhook signature');
 *     }
 *
 *     return { received: true };
 *   }
 * }
 */
