
import * as crypto from 'crypto';

/**
 * Hash Utility
 *
 * Provides secure password hashing and verification using bcrypt.
 * Uses @node-rs/bcrypt for native performance.
 */

let bcryptAvailable = false;
let bcryptHash: ((data: string, rounds: number) => Promise<string>) | null = null;
let bcryptVerify: ((data: string, hash: string) => Promise<boolean>) | null = null;

// Try to load @node-rs/bcrypt (fast native bcrypt)
try {
  // Eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeBcrypt = require('@node-rs/bcrypt');
  bcryptHash = nodeBcrypt.hash;
  bcryptVerify = nodeBcrypt.verify;
  bcryptAvailable = true;
} catch {
  // Fallback handled below
}

// Fallback to bcryptjs if @node-rs/bcrypt not available
if (!bcryptAvailable) {
  try {
    // Eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcryptjs = require('bcryptjs');
    bcryptHash = async (data: string, rounds: number) => bcryptjs.hash(data, rounds);
    bcryptVerify = async (data: string, hash: string) => bcryptjs.compare(data, hash);
    bcryptAvailable = true;
  } catch {
    // Both unavailable - will throw on use
  }
}

export class HashUtil {
  private static readonly SALT_ROUNDS = 12;
  private static readonly CURRENT_VERSION = '$2b$12$';

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    if (!bcryptAvailable || !bcryptHash) {
      throw new Error('No bcrypt implementation available. Install @node-rs/bcrypt or bcryptjs.');
    }
    return bcryptHash(password, HashUtil.SALT_ROUNDS);
  }

  /**
   * Verify a password against a bcrypt hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!bcryptAvailable || !bcryptVerify) {
      throw new Error('No bcrypt implementation available. Install @node-rs/bcrypt or bcryptjs.');
    }
    try {
      return await bcryptVerify(password, hash);
    } catch {
      return false;
    }
  }

  /**
   * Check if a hash needs to be re-hashed (e.g., if cost factor changed)
   */
  static async needsRehash(hash: string): Promise<boolean> {
    // Check if the hash uses the current version/cost factor
    return !hash.startsWith(HashUtil.CURRENT_VERSION);
  }

  /**
   * Hash arbitrary data using SHA-256
   */
  static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash arbitrary data using SHA-512
   */
  static sha512(data: string): string {
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  /**
   * Generate a secure random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create an HMAC signature
   */
  static hmac(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  /**
   * Verify an HMAC signature using constant-time comparison
   */
  static verifyHmac(data: string, secret: string, signature: string, algorithm: string = 'sha256'): boolean {
    const expected = HashUtil.hmac(data, secret, algorithm);
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(signature, 'hex'),
      );
    } catch {
      return false;
    }
  }

  // Aliases for backward compatibility
  static async hash(password: string): Promise<string> {
    return HashUtil.hashPassword(password);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return HashUtil.verifyPassword(password, hash);
  }
}
