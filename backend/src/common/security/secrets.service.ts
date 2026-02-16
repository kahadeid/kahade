import { Injectable, Logger } from '@nestjs/common';


import * as crypto from 'crypto';

/**
 * Secrets Management (HIGH-036)
 *
 * Features:
 * - Encrypted secrets storage
 * - Secret rotation
 * - Environment-specific secrets
 * - Access logging
 * - Vault integration ready
 */

@Injectable()
export class SecretsService {
  private readonly logger = new Logger(SecretsService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly masterKey: Buffer;
  private secretsCache = new Map<string, { value: string; expires: number }>();

  constructor() {
    // Get master key from environment (must be 32 bytes)
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 32) {
      throw new Error(
        'ENCRYPTION_KEY must be set and exactly 32 characters',
      );
    }
    this.masterKey = Buffer.from(key);
  }

  /**
   * Encrypt a secret
   */
  encrypt(plaintext: string): string {
    // Generate random IV
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine: iv + authTag + encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt a secret
   */
  decrypt(ciphertext: string): string {
    try {
      // Split components
      const [ivHex, authTagHex, encrypted] = ciphertext.split(':');

      // Convert from hex
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.masterKey,
        iv,
      );
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt secret:', error);
      throw new Error('[secrets.service] Failed to decrypt secret');
    }
  }

  /**
   * Get secret from cache or environment
   */
  getSecret(key: string, cacheTTL: number = 3600000): string {
    // Check cache
    const cached = this.secretsCache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.value;
    }

    // Get from environment
    const value = process.env[key];
    if (!value) {
      throw new Error(`Secret ${key} not found`);
    }

    // Cache it
    this.secretsCache.set(key, {
      value,
      expires: Date.now() + cacheTTL,
    });

    // Log access (for audit)
    this.logger.debug(`Secret accessed: ${key}`);

    return value;
  }

  /**
   * Rotate secret (invalidate cache)
   */
  rotateSecret(key: string): void {
    this.secretsCache.delete(key);
    this.logger.log(`Secret rotated: ${key}`);
  }

  /**
   * Clear all cached secrets
   */
  clearCache(): void {
    this.secretsCache.clear();
    this.logger.log('All secrets cache cleared');
  }

  /**
   * Generate random secret
   */
  generateSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash password (for comparison)
   */
  async hashPassword(password: string, salt?: string): Promise<string> {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, actualSalt, 100000, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve(`${actualSalt}:${key.toString('hex')}`);
      });
    });
  }

  /**
   * Verify password
   */
  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const [salt] = hashedPassword.split(':');
    const hash = await this.hashPassword(password, salt);
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(hashedPassword),
    );
  }
}

/**
 * Example usage:
 *
 * constructor(private secretsService: SecretsService) {}
 *
 * // Get secret
 * const apiKey = this.secretsService.getSecret('XENDIT_SECRET_KEY');
 *
 * // Encrypt sensitive data
 * const encrypted = this.secretsService.encrypt('sensitive-data');
 * await prisma.user.create({
 *   data: { encryptedData: encrypted },
 * });
 *
 * // Decrypt
 * const decrypted = this.secretsService.decrypt(user.encryptedData);
 *
 * // Generate new secret
 * const newApiKey = this.secretsService.generateSecret(32);
 */
