import { Decimal } from 'decimal.js';



/**
 * Money Utility Class
 *
 * Provides precise financial calculations using Decimal.js to avoid
 * JavaScript floating point rounding errors.
 *
 * CRITICAL: Always use this class for money calculations!
 *
 * Example:
 * ```typescript
 * const price = money(10.1);
 * const total = price.multiply(3); // 30.30 (not 30.299999999999997)
 * ```
 */

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,        // High precision for intermediate calculations
  rounding: Decimal.ROUND_HALF_UP,  // Standard rounding (banker's rounding)
  toExpNeg: -7,
  toExpPos: 21,
});

export class Money {
  private readonly amount: Decimal;

  constructor(value: number | string | Decimal | Money) {
    if (value instanceof Money) {
      this.amount = value.amount;
    } else if (value instanceof Decimal) {
      this.amount = value;
    } else {
      this.amount = new Decimal(value);
    }
  }

  // ========================================================================
  // Arithmetic Operations
  // ========================================================================

  /**
   * Add money amount
   */
  add(other: Money | number | string): Money {
    const otherMoney = other instanceof Money ? other : new Money(other);
    return new Money(this.amount.add(otherMoney.amount));
  }

  /**
   * Subtract money amount
   */
  subtract(other: Money | number | string): Money {
    const otherMoney = other instanceof Money ? other : new Money(other);
    return new Money(this.amount.sub(otherMoney.amount));
  }

  /**
   * Multiply by a number (e.g., quantity)
   */
  multiply(multiplier: number | string | Decimal): Money {
    return new Money(this.amount.mul(multiplier));
  }

  /**
   * Divide by a number
   */
  divide(divisor: number | string | Decimal): Money {
    if (new Decimal(divisor).isZero()) {
      throw new Error('Division by zero');
    }
    return new Money(this.amount.div(divisor));
  }

  /**
   * Calculate percentage of amount
   * @param percent - Percentage (e.g., 2.5 for 2.5%)
   */
  percentage(percent: number | string): Money {
    return new Money(this.amount.mul(percent).div(100));
  }

  /**
   * Add percentage to amount
   * @param percent - Percentage to add (e.g., 10 for +10%)
   */
  addPercentage(percent: number | string): Money {
    const increase = this.percentage(percent);
    return this.add(increase);
  }

  /**
   * Subtract percentage from amount
   * @param percent - Percentage to subtract (e.g., 10 for -10%)
   */
  subtractPercentage(percent: number | string): Money {
    const decrease = this.percentage(percent);
    return this.subtract(decrease);
  }

  /**
   * Get absolute value
   */
  abs(): Money {
    return new Money(this.amount.abs());
  }

  /**
   * Negate (flip sign)
   */
  negate(): Money {
    return new Money(this.amount.neg());
  }

  // ========================================================================
  // Comparison Operations
  // ========================================================================

  /**
   * Check if greater than other amount
   */
  isGreaterThan(other: Money | number | string): boolean {
    const otherMoney = other instanceof Money ? other : new Money(other);
    return this.amount.greaterThan(otherMoney.amount);
  }

  /**
   * Check if greater than or equal to other amount
   */
  isGreaterThanOrEqual(other: Money | number | string): boolean {
    const otherMoney = other instanceof Money ? other : new Money(other);
    return this.amount.greaterThanOrEqualTo(otherMoney.amount);
  }

  /**
   * Check if less than other amount
   */
  isLessThan(other: Money | number | string): boolean {
    const otherMoney = other instanceof Money ? other : new Money(other);
    return this.amount.lessThan(otherMoney.amount);
  }

  /**
   * Check if less than or equal to other amount
   */
  isLessThanOrEqual(other: Money | number | string): boolean {
    const otherMoney = other instanceof Money ? other : new Money(other);
    return this.amount.lessThanOrEqualTo(otherMoney.amount);
  }

  /**
   * Check if equal to other amount
   */
  equals(other: Money | number | string): boolean {
    const otherMoney = other instanceof Money ? other : new Money(other);
    return this.amount.equals(otherMoney.amount);
  }

  /**
   * Check if amount is zero
   */
  isZero(): boolean {
    return this.amount.isZero();
  }

  /**
   * Check if amount is positive
   */
  isPositive(): boolean {
    return this.amount.isPositive();
  }

  /**
   * Check if amount is negative
   */
  isNegative(): boolean {
    return this.amount.isNegative();
  }

  // ========================================================================
  // Formatting and Conversion
  // ========================================================================

  /**
   * Round to specified decimal places (default: 2 for currency)
   */
  round(decimalPlaces: number = 2): Money {
    return new Money(this.amount.toDecimalPlaces(decimalPlaces));
  }

  /**
   * Convert to number (use with caution - may lose precision)
   */
  toNumber(): number {
    return this.amount.toNumber();
  }

  /**
   * Convert to string with fixed decimal places (default: 2)
   */
  toString(decimalPlaces: number = 2): string {
    return this.amount.toFixed(decimalPlaces);
  }

  /**
   * Convert to JSON-serializable string
   */
  toJSON(): string {
    return this.toString();
  }

  /**
   * Format as currency with symbol
   */
  format(currencySymbol: string = 'Rp', locale: string = 'id-ID'): string {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this.toNumber());
    return `${currencySymbol} ${formatted}`;
  }

  /**
   * Get internal Decimal value (for advanced operations)
   */
  getDecimal(): Decimal {
    return this.amount;
  }

  // ========================================================================
  // Minor Units (for database storage as integers)
  // ========================================================================

  /**
   * Convert to minor units (cents/smallest currency unit)
   * Example: 10.50 IDR = 1050 minor units
   */
  toMinorUnits(): bigint {
    return BigInt(this.amount.mul(100).floor().toString());
  }

  /**
   * Create Money from minor units
   * Example: 1050 minor units = 10.50 IDR
   */
  static fromMinorUnits(minorUnits: bigint | number | string): Money {
    return new Money(new Decimal(minorUnits.toString()).div(100));
  }

  // ========================================================================
  // Validation
  // ========================================================================

  /**
   * Validate amount is within acceptable range
   */
  validate(options: {
    min?: Money | number | string;
    max?: Money | number | string;
    allowNegative?: boolean;
    allowZero?: boolean;
  } = {}): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!options.allowNegative && this.isNegative()) {
      errors.push('Amount cannot be negative');
    }

    if (!options.allowZero && this.isZero()) {
      errors.push('Amount cannot be zero');
    }

    if (options.min !== undefined) {
      const minMoney = options.min instanceof Money ? options.min : new Money(options.min);
      if (this.isLessThan(minMoney)) {
        errors.push(`Amount must be at least ${minMoney.toString()}`);
      }
    }

    if (options.max !== undefined) {
      const maxMoney = options.max instanceof Money ? options.max : new Money(options.max);
      if (this.isGreaterThan(maxMoney)) {
        errors.push(`Amount must not exceed ${maxMoney.toString()}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create Money instance (shorthand)
 */
export const money = (value: number | string | Decimal | Money): Money => {
  return new Money(value);
};

/**
 * Sum multiple Money amounts
 */
export const sumMoney = (amounts: Money[]): Money => {
  return amounts.reduce(
    (sum, amount) => sum.add(amount),
    new Money(0)
  );
};

/**
 * Get minimum of multiple Money amounts
 */
export const minMoney = (...amounts: Money[]): Money => {
  if (amounts.length === 0) {
    throw new Error('At least one amount required');
  }
  return amounts.reduce((min, current) =>
    current.isLessThan(min) ? current : min
  );
};

/**
 * Get maximum of multiple Money amounts
 */
export const maxMoney = (...amounts: Money[]): Money => {
  if (amounts.length === 0) {
    throw new Error('At least one amount required');
  }
  return amounts.reduce((max, current) =>
    current.isGreaterThan(max) ? current : max
  );
};

/**
 * Calculate average of multiple Money amounts
 */
export const averageMoney = (amounts: Money[]): Money => {
  if (amounts.length === 0) {
    throw new Error('At least one amount required');
  }
  return sumMoney(amounts).divide(amounts.length);
};

/**
 * Check if value is a valid money amount
 */
export const isValidMoney = (value: any): boolean => {
  try {
    new Money(value);
    return true;
  } catch {
    return false;
  }
};
