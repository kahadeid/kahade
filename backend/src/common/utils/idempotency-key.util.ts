import { customAlphabet } from 'nanoid';



// Safe characters for idempotency keys (URL-safe)
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 32);

/**
 * Generate a unique idempotency key
 *
 * @example
 * ```typescript
 * const key = generateIdempotencyKey();
 * // Result: "A1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P6"
 * ```
 */
export function generateIdempotencyKey(): string {
  return nanoid();
}

/**
 * Generate idempotency key with prefix
 *
 * @example
 * ```typescript
 * const key = generateIdempotencyKey('payment');
 * // Result: "payment_A1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P6"
 * ```
 */
export function generateIdempotencyKeyWithPrefix(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

/**
 * Validate idempotency key format
 */
export function isValidIdempotencyKey(key: string): boolean {
  if (typeof key !== 'string') {
    return false;
  }

  // Minimum length: 16 characters
  if (key.length < 16) {
    return false;
  }

  // Maximum length: 256 characters
  if (key.length > 256) {
    return false;
  }

  // Only alphanumeric, dash, underscore
  return /^[A-Za-z0-9_-]+$/.test(key);
}
