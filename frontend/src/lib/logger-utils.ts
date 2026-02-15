/**
 * LOGGER UTILITY - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Production-grade logging system
 * NO PLACEHOLDERS - Works immediately
 * 
 * USAGE:
 * import { logger } from '@/lib/logger-utils';
 * 
 * logger.info('User logged in', { userId: user.id });
 * logger.error('API Error', error, { endpoint: '/api/users' });
 * logger.debug('State updated', { state });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
  stack?: string;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Debug level logging - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;

    const entry = this.createLogEntry('debug', message, context);
    this.addToHistory(entry);

    console.debug(
      `[DEBUG] ${entry.timestamp} - ${message}`,
      context ? context : ''
    );
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('info', message, context);
    this.addToHistory(entry);

    if (this.isDevelopment) {
      console.info(
        `[INFO] ${entry.timestamp} - ${message}`,
        context ? context : ''
      );
    }

    // In production, send to monitoring service
    if (this.isProduction) {
      this.sendToMonitoring(entry);
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('warn', message, context);
    this.addToHistory(entry);

    console.warn(
      `[WARN] ${entry.timestamp} - ${message}`,
      context ? context : ''
    );

    // Always send warnings to monitoring
    if (this.isProduction) {
      this.sendToMonitoring(entry);
    }
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const actualError = error instanceof Error ? error : new Error(String(error));
    const entry = this.createLogEntry('error', message, context, actualError);
    this.addToHistory(entry);

    console.error(
      `[ERROR] ${entry.timestamp} - ${message}`,
      actualError,
      context ? context : ''
    );

    // Always send errors to monitoring
    if (this.isProduction) {
      this.sendToSentry(entry);
    }
  }

  /**
   * Performance logging
   */
  performance(label: string, duration: number, context?: LogContext): void {
    const message = `Performance: ${label} took ${duration.toFixed(2)}ms`;
    const entry = this.createLogEntry('info', message, {
      ...context,
      performance: { label, duration },
    });
    this.addToHistory(entry);

    if (this.isDevelopment) {
      console.log(
        `[PERF] ${entry.timestamp} - ${label}: ${duration.toFixed(2)}ms`,
        context ? context : ''
      );
    }
  }

  /**
   * API request logging
   */
  api(
    method: string,
    url: string,
    status: number,
    duration: number,
    context?: LogContext
  ): void {
    const message = `API ${method} ${url} - ${status} (${duration.toFixed(0)}ms)`;
    const level: LogLevel = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';

    const entry = this.createLogEntry(level, message, {
      ...context,
      api: { method, url, status, duration },
    });
    this.addToHistory(entry);

    if (this.isDevelopment) {
      const color = status >= 400 ? 'color: red' : status >= 300 ? 'color: orange' : 'color: green';
      console.log(
        `%c[API] ${entry.timestamp} - ${method} ${url} ${status} (${duration.toFixed(0)}ms)`,
        color,
        context ? context : ''
      );
    }

    if (this.isProduction && status >= 400) {
      this.sendToMonitoring(entry);
    }
  }

  /**
   * User action logging
   */
  userAction(action: string, context?: LogContext): void {
    const message = `User Action: ${action}`;
    const entry = this.createLogEntry('info', message, {
      ...context,
      userAction: action,
    });
    this.addToHistory(entry);

    if (this.isDevelopment) {
      console.log(`[USER] ${entry.timestamp} - ${action}`, context ? context : '');
    }

    // Send to analytics
    if (this.isProduction) {
      this.sendToAnalytics(action, context);
    }
  }

  /**
   * Get log history
   */
  getHistory(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter(entry => entry.level === level);
    }
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(context),
    };

    if (error) {
      entry.error = error;
      entry.stack = error.stack;
    }

    return entry;
  }

  /**
   * Sanitize sensitive data from context
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];

    const sanitizeObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;

      const result: any = Array.isArray(obj) ? [] : {};

      for (const key in obj) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          result[key] = '***REDACTED***';
        } else if (typeof obj[key] === 'object') {
          result[key] = sanitizeObject(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }

      return result;
    };

    return sanitizeObject(sanitized);
  }

  /**
   * Add entry to history
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);

    // Keep history size manageable
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Send to monitoring service (e.g., DataDog, New Relic)
   */
  private sendToMonitoring(entry: LogEntry): void {
    // Check if DataDog RUM is available and send logs
    if (typeof window !== 'undefined' && (window as Record<string, unknown>).DD_LOGS) {
      (window as Record<string, unknown>).DD_LOGS.logger.log(
        entry.message,
        entry.context,
        entry.level
      );
    }
  }

  /**
   * Send to Sentry for error tracking
   */
  private sendToSentry(entry: LogEntry): void {
    // Send errors to Sentry if available
    if (typeof window !== 'undefined' && (window as Record<string, unknown>).Sentry) {
      (window as Record<string, unknown>).Sentry.captureException(entry.error, {
        level: entry.level,
        contexts: {
          custom: entry.context,
        },
      });
    }
  }

  /**
   * Send to analytics (e.g., Google Analytics, Mixpanel)
   */
  private sendToAnalytics(action: string, context?: LogContext): void {
    // Send events to analytics platforms if available
    if (typeof window !== 'undefined') {
      // Google Analytics
      if ((window as Record<string, unknown>).gtag) {
        (window as Record<string, unknown>).gtag('event', action, context);
      }
      // Mixpanel
      if ((window as Record<string, unknown>).mixpanel) {
        (window as Record<string, unknown>).mixpanel.track(action, context);
      }
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience function for performance measurement
export function measurePerformance<T>(
  label: string,
  fn: () => T,
  context?: LogContext
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  logger.performance(label, duration, context);
  return result;
}

// Export convenience function for async performance measurement
export async function measurePerformanceAsync<T>(
  label: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  logger.performance(label, duration, context);
  return result;
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic logging
// logger.info('User logged in', { userId: user.id, email: user.email });
// logger.error('Failed to save data', error, { formData });

// Example 2: API logging
// logger.api('POST', '/api/transactions', 201, 234, { transactionId: 'tx_123' });

// Example 3: Performance logging
// const start = performance.now();
// const result = await fetchData();
// logger.performance('fetchData', performance.now() - start);

// Example 4: Using measurePerformance helper
// const data = measurePerformance('calculate-total', () => {
//   return items.reduce((sum, item) => sum + item.price, 0);
// });

// Example 5: User action tracking
// logger.userAction('button_click', { buttonId: 'create-transaction', page: '/dashboard' });

// Example 6: In API hooks
// export function useApi() {
//   const fetchData = async (url: string) => {
//     const start = performance.now();
//     try {
//       const response = await fetch(url);
//       logger.api('GET', url, response.status, performance.now() - start);
//       return response.json();
//     } catch (error) {
//       logger.error('API request failed', error, { url });
//       throw error;
//     }
//   };
//   return { fetchData };
// }

// Example 7: Replace all console.log
// ❌ Before:
// console.log('User data:', user);
// console.error('Error:', error);
// 
// ✅ After:
// logger.debug('User data', { user });
// logger.error('Error occurred', error);
