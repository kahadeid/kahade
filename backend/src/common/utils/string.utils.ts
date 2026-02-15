/**
 * String Utilities (LOW-001)
 */

export class StringUtils {
  /**
   * Convert to kebab-case
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert to camelCase
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, (c) => c.toLowerCase());
  }

  /**
   * Convert to PascalCase
   */
  static toPascalCase(str: string): string {
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  /**
   * Truncate string with ellipsis
   */
  static truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length - 3) + '...';
  }

  /**
   * Mask sensitive data (e.g., credit card)
   */
  static mask(str: string, visibleStart: number = 4, visibleEnd: number = 4): string {
    if (str.length <= visibleStart + visibleEnd) return str;
    const start = str.slice(0, visibleStart);
    const end = str.slice(-visibleEnd);
    const masked = '*'.repeat(str.length - visibleStart - visibleEnd);
    return `${start}${masked}${end}`;
  }

  /**
   * Generate random string
   */
  static random(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Slugify string
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Capitalize first letter
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Check if string is valid email
   */
  static isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Check if string is valid phone
   */
  static isPhone(str: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(str.replace(/[\s-]/g, ''));
  }
}
