import { Injectable } from '@nestjs/common';
import { Request } from 'express';


import * as winston from 'winston';


/**
 * Structured Logging with Winston (HIGH-030)
 *
 * Features:
 * - Multiple log levels
 * - JSON structured logging
 * - Log rotation
 * - Context enrichment
 * - Request tracking
 * - Error stack traces
 */

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: {
        service: 'kahade-api',
        environment: process.env.NODE_ENV,
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),

        // Error log file
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        // Combined log file
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });
  }

  /**
   * Log with context enrichment
   */
  private logWithContext(
    level: string,
    message: string,
    context?: any,
    trace?: string,
  ) {
    const logData: any = {
      message,
      ...context,
    };

    if (trace) {
      logData.trace = trace;
    }

    this.logger.log(level, logData);
  }

  log(message: string, context?: any) {
    this.logWithContext('info', message, context);
  }

  error(message: string, trace?: string, context?: any) {
    this.logWithContext('error', message, context, trace);
  }

  warn(message: string, context?: any) {
    this.logWithContext('warn', message, context);
  }

  debug(message: string, context?: any) {
    this.logWithContext('debug', message, context);
  }

  verbose(message: string, context?: any) {
    this.logWithContext('verbose', message, context);
  }

  /**
   * Log HTTP request
   */
  logRequest(req: Request, statusCode: number, duration: number) {
    this.log('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: (req as any).correlationId,
      requestId: (req as any).requestId,
    });
  }

  /**
   * Log database query
   */
  logQuery(query: string, duration: number, params?: any) {
    this.debug('Database Query', {
      query,
      duration: `${duration}ms`,
      params,
    });
  }

  /**
   * Log business event
   */
  logEvent(event: string, data?: any) {
    this.log('Business Event', {
      event,
      ...data,
    });
  }

  /**
   * Log security event
   */
  logSecurity(event: string, severity: 'low' | 'medium' | 'high', data?: any) {
    this.warn('Security Event', {
      event,
      severity,
      ...data,
    });
  }
}

/**
 * Example usage:
 *
 * constructor(private logger: LoggerService) {}
 *
 * // Simple log
 * this.logger.log('User created', { userId, email });
 *
 * // Error log
 * this.logger.error('Payment failed', error.stack, {
 *   userId,
 *   amount,
 *   gateway: 'xendit',
 * });
 *
 * // Business event
 * this.logger.logEvent('ESCROW_CREATED', {
 *   escrowId,
 *   amount,
 *   buyer,
 *   seller,
 * });
 *
 * // Security event
 * this.logger.logSecurity('SUSPICIOUS_LOGIN', 'high', {
 *   userId,
 *   ip,
 *   attempts: 5,
 * });
 */
