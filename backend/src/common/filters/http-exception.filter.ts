import { Request, Response } from 'express';
import { nanoid } from 'nanoid';


import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * HTTP Exception Filter (CRIT-011)
 *
 * Handles exceptions safely:
 * - NO stack traces in production
 * - Sanitized error messages
 * - Request ID tracking
 * - Comprehensive logging
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Generate or get request ID
    const requestId =
      (request.headers['x-request-id'] as string) || nanoid(12);

    // Get exception response
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'An error occurred';

    // Log error with context
    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} - ${status}: ${message}`,
      {
        requestId,
        method: request.method,
        url: request.url,
        status,
        message,
        userId: (request as any).user?.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        // Include stack trace in logs (but not in response)
        stack:
          process.env.NODE_ENV === 'production'
            ? undefined
            : exception.stack,
      },
    );

    // Prepare error response
    const errorResponse: any = {
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    // NEVER include stack trace in production
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = exception.stack;
    }

    // Sanitize error messages based on status code
    if (status >= 500) {
      // Internal server errors - don't expose details
      errorResponse.message = [
        'An internal error occurred. Please try again later.',
      ];
      errorResponse.error = 'Internal Server Error';
    }

    response.status(status).json(errorResponse);
  }
}
