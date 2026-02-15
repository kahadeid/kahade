import { StringUtils } from './string.utils';


import * as crypto from 'crypto';


/**
 * @deprecated Use StringUtils from './string.utils' instead.
 * This file is kept for backward compatibility.
 */

export class StringUtil extends StringUtils {
  static generateRandomString(length: number): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  static generateNumericCode(length: number): string {
    let result = '';
    while (result.length < length) {
      const byte = crypto.randomBytes(1)[0];
      if (byte !== undefined && byte < 250) {
        result += (byte % 10).toString();
      }
    }
    return result;
  }

  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    if (username.length <= 2) {
      return `${username[0]}***@${domain}`;
    }
    return `${username.substring(0, 2)}***${username.slice(-1)}@${domain}`;
  }

  static maskPhone(phone: string): string {
    if (phone.length <= 4) return phone;
    return `${phone.substring(0, 2)}****${phone.slice(-2)}`;
  }
}
