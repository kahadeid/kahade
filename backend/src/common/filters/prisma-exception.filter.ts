
import {
import { ErrorResponseDto, ErrorCode } from "@common/dto/response.dto";
import { Request, Response } from "express";

  ArgumentsHost,
  Catch,
  HttpStatus,
  ExceptionFilter,
  Logger,
} from "@nestjs/common";

// ============================================================================
// ENHANCED PRISMA EXCEPTION FILTER
// Implements: Type-safe Prisma error handling, Standardized responses
// ============================================================================

/**
 * Prisma error interface for type safety
 */
interface PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: Record<string, unknown>;
  clientVersion?: string;
}

/**
 * Prisma error code mappings to HTTP status and error codes
 */
const PRISMA_ERROR_MAP: Record<
  string,
  { status: HttpStatus; code: ErrorCode; message: string }
> = {
  // Unique constraint violation
  P2002: {
    status: HttpStatus.CONFLICT,
    code: ErrorCode.ALREADY_EXISTS,
    message: "A record with this value already exists",
  },
  // Foreign key constraint violation
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    code: ErrorCode.VALIDATION_ERROR,
    message: "Referenced record does not exist",
  },
  // Record not found (for update/delete)
  P2025: {
    status: HttpStatus.NOT_FOUND,
    code: ErrorCode.NOT_FOUND,
    message: "Record not found",
  },
  // Required relation violation
  P2014: {
    status: HttpStatus.BAD_REQUEST,
    code: ErrorCode.VALIDATION_ERROR,
    message: "Required relation is missing",
  },
  // Query interpretation error
  P2016: {
    status: HttpStatus.BAD_REQUEST,
    code: ErrorCode.INVALID_INPUT,
    message: "Invalid query parameters",
  },
  // Null constraint violation
  P2011: {
    status: HttpStatus.BAD_REQUEST,
    code: ErrorCode.MISSING_REQUIRED_FIELD,
    message: "Required field is missing",
  },
  // Value too long for column
  P2000: {
    status: HttpStatus.BAD_REQUEST,
    code: ErrorCode.VALIDATION_ERROR,
    message: "Value is too long for the field",
  },
  // Invalid value for field type
  P2006: {
    status: HttpStatus.BAD_REQUEST,
    code: ErrorCode.INVALID_FORMAT,
    message: "Invalid value format for field",
  },
  // Database connection error
  P1001: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    code: ErrorCode.DATABASE_ERROR,
    message: "Unable to connect to database",
  },
  // Database timeout
  P1008: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    code: ErrorCode.DATABASE_ERROR,
    message: "Database operation timed out",
  },
  // Transaction error
  P2034: {
    status: HttpStatus.CONFLICT,
    code: ErrorCode.CONCURRENT_MODIFICATION,
    message: "Transaction conflict, please retry",
  },
};

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    // Check if this is a Prisma error
    if (!this.isPrismaError(exception)) {
      // Re-throw if not a Prisma error
      throw exception;
    }

    const requestId = request.id || (request.headers["x-request-id"] as string);
    const path = request.url;
    const method = request.method;

    const errorResponse = this.buildErrorResponse(exception, path, method);
    errorResponse.requestId = requestId;

    // Log the error
    this.logError(exception, request, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private _buildErrorResponse(
    exception: PrismaClientKnownRequestError,
    path: string,
    method: string,
  ): ErrorResponseDto {
    const errorMapping = PRISMA_ERROR_MAP[exception.code];

    if (errorMapping) {
      const message = this.enrichErrorMessage(exception, errorMapping.message);
      return new ErrorResponseDto(
        errorMapping.status,
        errorMapping.code,
        message,
        path,
        method,
      );
    }

    // Unknown Prisma error code
    this.logger.error(
      `Unhandled Prisma error code: ${exception.code}`,
      exception.stack,
    );

    return new ErrorResponseDto(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DATABASE_ERROR,
      "A database error occurred",
      path,
      method,
    );
  }

  private _enrichErrorMessage(
    exception: PrismaClientKnownRequestError,
    defaultMessage: string,
  ): string {
    const meta = exception.meta;

    if (!meta) {
      return defaultMessage;
    }

    // For unique constraint violations, include the field name
    if (exception.code === "P2002" && meta.target) {
      const fields = Array.isArray(meta.target)
        ? (meta.target as string[]).join(", ")
        : String(meta.target);
      return `A record with this ${fields} already exists`;
    }

    // For not found errors, include the model name
    if (exception.code === "P2025" && meta.cause) {
      return String(meta.cause);
    }

    // For foreign key violations, include the field name
    if (exception.code === "P2003" && meta.field_name) {
      return `Invalid reference: ${meta.field_name}`;
    }

    return defaultMessage;
  }

  private _logError(
    exception: PrismaClientKnownRequestError,
    request: Request & { id?: string },
    errorResponse: ErrorResponseDto,
  ): void {
    const logContext = {
      requestId: errorResponse.requestId,
      method: request.method,
      path: request.url,
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.code,
      prismaCode: exception.code,
    };

    const logMessage = `[${errorResponse.requestId || "no-id"}] Prisma Error: ${errorResponse.message}`;

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        logMessage,
        exception.stack,
        JSON.stringify(logContext),
      );
    } else {
      this.logger.warn(logMessage, JSON.stringify(logContext));
    }
  }

  private _isPrismaError(
    exception: unknown,
  ): exception is PrismaClientKnownRequestError {
    return (
      exception !== null &&
      typeof exception === "object" &&
      "code" in exception &&
      typeof (exception as PrismaClientKnownRequestError).code === "string" &&
      (exception as PrismaClientKnownRequestError).code.startsWith("P")
    );
  }
}
