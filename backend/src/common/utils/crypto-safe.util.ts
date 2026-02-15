import { randomBytes, randomInt } from 'crypto';



/**
 * Cryptographically Secure Random Generation (MED-009)
 *
 * Replaces Math.random() with crypto.randomBytes() for security-critical operations.
 * Math.random() is NOT cryptographically secure and predictable.
 */

/**
 * Generate cryptographically secure random string
 * @param length - Length of the string
 * @returns Random hex string
 */
export function generateRandomString(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate cryptographically secure random token
 * @param length - Length in bytes
 * @returns Random token in base64url format (URL-safe)
 */
export function generateRandomToken(length: number = 32): string {
  return randomBytes(length)
    .toString('base64url')
    .replace(/[+/=]/g, '') // Remove non-URL-safe characters
    .slice(0, length * 2);
}

/**
 * Generate cryptographically secure 6-digit OTP
 * @returns 6-digit OTP as string
 */
export function generateOTP(): string {
  // Generate 3 bytes = 24 bits
  const bytes = randomBytes(3);
  // Convert to number and ensure 6 digits
  const num = parseInt(bytes.toString('hex'), 16);
  return (num % 1_000_000).toString().padStart(6, '0');
}

/**
 * Generate cryptographically secure random integer
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random integer
 */
export function generateRandomInt(min: number, max: number): number {
  return randomInt(min, max);
}

/**
 * Generate cryptographically secure UUID-like ID
 * @returns Random UUID-like string
 */
export function generateUUIDLike(): string {
  const bytes = randomBytes(16);
  const hex = bytes.toString('hex');

  // Format like UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    '4' + hex.substring(13, 16), // Version 4
    ((parseInt(hex.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) +
      hex.substring(18, 20),
    hex.substring(20, 32),
  ].join('-');
}

/**
 * Generate secure session ID
 * @returns Session ID
 */
export function generateSessionId(): string {
  return `ses_${generateRandomToken(32)}`;
}

/**
 * Generate secure API key
 * @returns API key
 */
export function generateAPIKey(): string {
  return `sk_${generateRandomToken(32)}`;
}

/**
 * Timing-safe string comparison
 * Prevents timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns True if equal
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  try {
    return randomBytes(0).compare(bufA, bufB) === 0;
  } catch {
    // Fallback to constant-time comparison
    let result = 0;
    for (let i = 0; i < bufA.length; i++) {
      result |= bufA[i] ^ bufB[i];
    }
    return result === 0;
  }
}

/**
 * Generate CSRF token
 * @returns CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate email verification token
 * @returns Verification token
 */
export function generateVerificationToken(): string {
  return generateRandomToken(32);
}

/**
 * Generate password reset token
 * @returns Reset token
 */
export function generatePasswordResetToken(): string {
  return generateRandomToken(32);
}
