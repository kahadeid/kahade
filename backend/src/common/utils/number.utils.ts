/**
 * Number Utilities (LOW-005)
 */

export class NumberUtils {
  /**
   * Format number with thousand separators
   */
  static format(num: number, decimals: number = 0): string {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Format as currency (IDR)
   */
  static formatCurrency(num: number): string {
    return `Rp ${this.format(num, 0)}`;
  }

  /**
   * Round to decimals
   */
  static round(num: number, decimals: number = 0): number {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Generate random number
   */
  static random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Clamp number between min and max
   */
  static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  /**
   * Check if number is in range
   */
  static inRange(num: number, min: number, max: number): boolean {
    return num >= min && num <= max;
  }

  /**
   * Calculate percentage
   */
  static percentage(value: number, total: number): number {
    return (value / total) * 100;
  }

  /**
   * Parse string to number
   */
  static parse(str: string): number {
    const parsed = parseFloat(str.replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
}
