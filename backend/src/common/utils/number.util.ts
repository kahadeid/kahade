import { NumberUtils } from './number.utils';



/**
 * @deprecated Use NumberUtils from './number.utils' instead.
 * This file is kept for backward compatibility.
 */

export class NumberUtil extends NumberUtils {
  static formatCurrency(amount: number, currency: string = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  static toMinorUnit(amount: number, decimals: number = 2): bigint {
    return BigInt(Math.round(amount * Math.pow(10, decimals)));
  }

  static fromMinorUnit(amount: bigint, decimals: number = 2): number {
    return Number(amount) / Math.pow(10, decimals);
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static isPositive(value: number): boolean {
    return value > 0;
  }

  static isNonNegative(value: number): boolean {
    return value >= 0;
  }
}
