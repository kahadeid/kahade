import { DomainException } from '../exceptions/domain-exceptions';
import { Request, Response } from 'express';


import {

  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * Error Boundaries (HIGH-040)
 *
 * Features:
 * - Global error handler
 * - Unhandled rejection handler
 * - Process crash prevention
 * - Error recovery
 * - Stack trace sanitization
 */

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: string | undefined;
    let context: any;

    // Handle different exception types
    if (exception instanceof DomainException) {
      // Domain-specific exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message;
      errorCode = exceptionResponse.errorCode;
      context = exceptionResponse.context;
    } else if (exception instanceof HttpException) {
      // HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;
    } else if (exception instanceof Error) {
      // Regular errors
      message = exception.message;

      // Log with stack trace
      this.logger.error(
        `Unhandled error: ${message}`,
        exception.stack,
        {
          method: request.method,
          url: request.url,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          correlationId: (request as any).correlationId,
        },
      );
    } else {
      // Unknown error
      this.logger.error('Unknown error occurred', JSON.stringify(exception));
    }

    // Sanitize error message for production
    if (process.env.NODE_ENV === 'production' && status === 500) {
      message = 'An unexpected error occurred. Please try again later.';
    }

    // Build error response
    const errorResponse = {
      statusCode: status,
      message,
      errorCode,
      context,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId: (request as any).correlationId,
    };

    // Remove undefined fields
    Object.keys(errorResponse).forEach(
      (key) =>
        errorResponse[key as keyof typeof errorResponse] === undefined &&
        delete errorResponse[key as keyof typeof errorResponse],
    );

    response.status(status).json(errorResponse);
  }
}

/**
 * Setup process error handlers
 */
export function setupProcessErrorHandlers(logger: Logger) {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection:', reason?.stack || reason, {
      promise: promise.toString(),
    });

    // Don't exit process - log and continue
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error.stack, {
      name: error.name,
      message: error.message,
    });

    // Exit gracefully
    process.exit(1);
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    logger.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    logger.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
  });
}

/**
 * Example usage in main.ts:
 *
 * import { GlobalExceptionFilter, setupProcessErrorHandlers } from './common/filters/global-exception.filter';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *
 *   // Apply global exception filter
 *   app.useGlobalFilters(new GlobalExceptionFilter());
 *
 *   // Setup process error handlers
 *   const logger = new Logger('Bootstrap');
 *   setupProcessErrorHandlers(logger);
 *
 *   await app.listen(3000);
 * }
 */
