/**
 * Array Utilities (LOW-003)
 */

export class ArrayUtils {
  /**
   * Get unique values
   */
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Flatten nested arrays
   */
  static flatten<T>(array: unknown[]): T[] {
    return array.reduce(
      (acc, val) => acc.concat(Array.isArray(val) ? this.flatten(val) : val),
      [],
    );
  }

  /**
   * Group array by key
   */
  static groupBy<T, K extends string | number>(
    array: T[],
    keyFn: (item: T) => K,
  ): Record<K, T[]> {
    return array.reduce((acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<K, T[]>);
  }

  /**
   * Shuffle array
   */
  static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Get random item
   */
  static random<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Remove duplicates by key
   */
  static uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
    const seen = new Set<K>();
    return array.filter((item) => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Intersection of arrays
   */
  static intersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((item) => arr2.includes(item));
  }

  /**
   * Difference of arrays
   */
  static difference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((item) => !arr2.includes(item));
  }

  /**
   * Sort by key
   */
  static sortBy<T>(array: T[], keyFn: (item: T) => any, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = keyFn(a);
      const bVal = keyFn(b);
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }
}
