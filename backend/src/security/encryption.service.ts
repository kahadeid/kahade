import { Injectable } from "@nestjs/common";

import * as crypto from "crypto";

@Injectable()
export class EncryptionService {
  private readonly algorithm = "aes-256-gcm";
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;
  private readonly tagPosition = this.saltLength + this.ivLength;
  private readonly encryptedPosition = this.tagPosition + this.tagLength;

  // FIX SEC-004: Increase PBKDF2 iterations from 100,000 to 600,000
  // OWASP recommends minimum 600,000 iterations for PBKDF2-HMAC-SHA512 as of 2023
  // This provides better resistance against brute-force attacks on encrypted data
  private readonly pbkdf2Iterations = 600000;

  encrypt(text: string, secret: string): string {
    const salt = crypto.randomBytes(this.saltLength);
    const key = crypto.pbkdf2Sync(
      secret,
      salt,
      this.pbkdf2Iterations,
      this.keyLength,
      "sha512",
    );
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();
    const result = Buffer.concat([salt, iv, tag, encrypted]);

    return result.toString("base64");
  }

  decrypt(encryptedData: string, secret: string): string {
    const buffer = Buffer.from(encryptedData, "base64");

    const salt = buffer.subarray(0, this.saltLength);
    const iv = buffer.subarray(this.saltLength, this.tagPosition);
    const tag = buffer.subarray(this.tagPosition, this.encryptedPosition);
    const encrypted = buffer.subarray(this.encryptedPosition);

    const key = crypto.pbkdf2Sync(
      secret,
      salt,
      this.pbkdf2Iterations,
      this.keyLength,
      "sha512",
    );
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final("utf8");
  }

  hash(text: string): string {
    return crypto.createHash("sha256").update(text).digest("hex");
  }

  generateRandomToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }
}
