import { SetMetadata } from '@nestjs/common';


export const IDEMPOTENT_KEY = 'idempotent';

export interface IdempotencyOptions {
  /**
   * TTL for idempotency cache in seconds
   * Default: 86400 (24 hours)
   */
  ttl?: number;

  /**
   * Whether idempotency key is required
   * Default: true
   */
  required?: boolean;
}

/**
 * Decorator to mark endpoints that require idempotency enforcement
 * Prevents duplicate financial transactions
 *
 * @example
 * ```typescript
 * @Post('orders/:id/pay')
 * @Idempotent()
 * async payOrder(@Param('id') id: string) {
 *   return this.orderService.pay(id);
 * }
 * ```
 */
export const Idempotent = (options?: IdempotencyOptions) =>
  SetMetadata(IDEMPOTENT_KEY, options || { ttl: 86400, required: true });
