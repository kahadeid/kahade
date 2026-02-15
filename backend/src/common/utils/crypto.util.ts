import { hash, verify } from '@node-rs/bcrypt';


import * as crypto from 'crypto';


export class HashUtil {
  private static readonly SALT_ROUNDS = 12;

  static async hash(data: string): Promise<string> {
    return hash(data, this.SALT_ROUNDS);
  }

  static async verify(data: string, hashed: string): Promise<boolean> {
    try {
      return await verify(data, hashed);
    } catch {
      return false;
    }
  }

  static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static async verifyHash(hash: string): Promise<boolean> {
    // @node-rs/bcrypt doesn't have getRounds, so we just validate format
    return hash.startsWith('$2b$') || hash.startsWith('$2a$') || hash.startsWith('$2y$');
  }
}

export class CryptoUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 64;
  private static readonly TAG_LENGTH = 16;

  static encrypt(text: string, secret: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const key = crypto.pbkdf2Sync(secret, salt, 100000, this.KEY_LENGTH, 'sha512');

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = (cipher as any).getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }

  static decrypt(encrypted: string, secret: string): string {
    const buffer = Buffer.from(encrypted, 'base64');

    const salt = buffer.subarray(0, this.SALT_LENGTH);
    const iv = buffer.subarray(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
    const tag = buffer.subarray(
      this.SALT_LENGTH + this.IV_LENGTH,
      this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH
    );
    const ciphertext = buffer.subarray(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);

    const key = crypto.pbkdf2Sync(secret, salt, 100000, this.KEY_LENGTH, 'sha512');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    (decipher as any).setAuthTag(tag);

    return decipher.update(ciphertext) + decipher.final('utf8');
  }

  static generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  static hash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  static hmac(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}
