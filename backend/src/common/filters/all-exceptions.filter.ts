import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';


import {

  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * Global Exception Filter (HIGH-004)
 *
 * Catches all exceptions and formats them consistently.
 * Provides:
 * - Consistent error response structure
 * - Safe error messages (no sensitive data leak)
 * - Detailed logging for debugging
 * - Prisma error handling
 * - Validation error formatting
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';
    let details: any = undefined;

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      error = exception.name;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || error;
        details = responseObj.details;
      }
    }
    // Handle Prisma errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'DatabaseError';

      switch (exception.code) {
        case 'P2002':
          message = 'A unique constraint would be violated';
          details = {
            fields: exception.meta?.target,
            constraint: 'unique',
          };
          break;
        case 'P2025':
          message = 'Record not found';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = 'Foreign key constraint failed';
          details = {
            field: exception.meta?.field_name,
          };
          break;
        case 'P2014':
          message = 'The change would violate a required relation';
          break;
        case 'P2024':
          message = 'Database connection timeout';
          status = HttpStatus.SERVICE_UNAVAILABLE;
          break;
        default:
          message = 'Database operation failed';
          this.logger.error(`Unhandled Prisma error code: ${exception.code}`, exception);
      }
    }
    // Handle Prisma validation errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'ValidationError';
      message = 'Invalid data provided';
    }
    // Handle validation errors
    else if (Array.isArray(exception) && exception[0] instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'ValidationError';
      message = this.formatValidationErrors(exception as ValidationError[]);
    }
    // Handle unknown errors
    else if (exception instanceof Error) {
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );

      // In production, don't leak error details
      if (process.env.NODE_ENV === 'production') {
        message = 'An unexpected error occurred';
      } else {
        message = exception.message;
        details = { stack: exception.stack };
      }
    }

    // Log the error with full context
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${error}`,
      {
        error,
        message,
        details,
        userId: (request as any).user?.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        body: this.sanitizeBody(request.body),
        query: request.query,
        params: request.params,
      },
    );

    // Send error response
    response.status(status).json({
      statusCode: status,
      error,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(process.env.NODE_ENV !== 'production' && {
        requestId: (request as any).id,
      }),
    });
  }

  /**
   * Format class-validator validation errors
   */
  private _formatValidationErrors(errors: ValidationError[]): string[] {
    return errors.flatMap((error) => {
      if (error.constraints) {
        return Object.values(error.constraints);
      }
      if (error.children && error.children.length > 0) {
        return this.formatValidationErrors(error.children);
      }
      return [`Validation failed for ${error.property}`];
    });
  }

  /**
   * Sanitize request body to remove sensitive data from logs
   */
  private _sanitizeBody(body: unknown): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'passwordHash',
      'currentPassword',
      'newPassword',
      'confirmPassword',
      'token',
      'refreshToken',
      'accessToken',
      'secret',
      'apiKey',
      'creditCard',
      'cvv',
      'ssn',
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
