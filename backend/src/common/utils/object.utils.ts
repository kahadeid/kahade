/**
 * Object Utilities (LOW-004)
 */

export class ObjectUtils {
  /**
   * Pick specific keys from object
   */
  static pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  /**
   * Omit specific keys from object
   */
  static omit<T extends object, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Omit<T, K> {
    const result = { ...obj };
    keys.forEach((key) => {
      delete result[key];
    });
    return result;
  }

  /**
   * Deep clone object
   */
  static clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Deep merge objects
   */
  static merge<T extends object>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.merge(target[key] as object, source[key] as object);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.merge(target, ...sources);
  }

  /**
   * Check if value is object
   */
  static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Check if object is empty
   */
  static isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }

  /**
   * Get nested value safely
   */
  static get<T = any>(obj: any, path: string, defaultValue?: T): T {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result?.[key] === undefined) {
        return defaultValue as T;
      }
      result = result[key];
    }

    return result as T;
  }

  /**
   * Set nested value
   */
  static set(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;

    for (const key of keys) {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
  }
}
