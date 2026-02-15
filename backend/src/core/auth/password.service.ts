import { Injectable } from '@nestjs/common';
import { HashUtil } from '@common/utils/hash.util';


import * as crypto from 'crypto';


@Injectable()
export class PasswordService {
  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    try {
    return HashUtil.hashPassword(password);
  }

  /**
   * Verify a password against a hash
   */
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  /**
   * Verifypassword
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
    return HashUtil.verifyPassword(password, hash);
  }

  /**
   * Check if password meets security requirements
   */
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?-]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a secure random password using cryptographically secure random
   * @param length - Length of password (default: 16)
   * @returns Cryptographically secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';
    const all = lowercase + uppercase + numbers + special;

    let password = '';

    // Use crypto.randomInt() for cryptographically secure random
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += special[crypto.randomInt(0, special.length)];

    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      password += all[crypto.randomInt(0, all.length)];
    }

    // Shuffle the password using Fisher-Yates algorithm with crypto.randomInt
    const passwordArray = password.split('');
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join('');
  }
}
