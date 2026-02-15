import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// ============================================================================
// STANDARDIZED API RESPONSE DTOs
// Implements: Consistent response structure, Type safety, Correlation tracking
// ============================================================================

/**
 * Standard error codes for consistent error handling across the application
 */
export enum ErrorCode {
  // Authentication errors (1xxx)
  UNAUTHORIZED = "AUTH_001",
  INVALID_CREDENTIALS = "AUTH_002",
  TOKEN_EXPIRED = "AUTH_003",
  MFA_REQUIRED = "AUTH_004",
  ACCOUNT_LOCKED = "AUTH_005",
  SESSION_EXPIRED = "AUTH_006",

  // Validation errors (2xxx)
  VALIDATION_ERROR = "VAL_001",
  INVALID_INPUT = "VAL_002",
  MISSING_REQUIRED_FIELD = "VAL_003",
  INVALID_FORMAT = "VAL_004",

  // Resource errors (3xxx)
  NOT_FOUND = "RES_001",
  ALREADY_EXISTS = "RES_002",
  CONFLICT = "RES_003",
  GONE = "RES_004",

  // Business logic errors (4xxx)
  INSUFFICIENT_BALANCE = "BIZ_001",
  TRANSACTION_LIMIT_EXCEEDED = "BIZ_002",
  KYC_REQUIRED = "BIZ_003",
  OPERATION_NOT_ALLOWED = "BIZ_004",
  CONCURRENT_MODIFICATION = "BIZ_005",
  WALLET_FROZEN = "BIZ_006",

  // External service errors (5xxx)
  PAYMENT_GATEWAY_ERROR = "EXT_001",
  EMAIL_SERVICE_ERROR = "EXT_002",
  SMS_SERVICE_ERROR = "EXT_003",
  KYC_PROVIDER_ERROR = "EXT_004",

  // System errors (9xxx)
  INTERNAL_ERROR = "SYS_001",
  DATABASE_ERROR = "SYS_002",
  RATE_LIMIT_EXCEEDED = "SYS_003",
  SERVICE_UNAVAILABLE = "SYS_004",
}

/**
 * Pagination metadata for list responses
 */
export class PaginationMeta {
  @ApiProperty({ description: "Current page number", example: 1 })
  page: number;

  @ApiProperty({ description: "Number of items per page", example: 20 })
  limit: number;

  @ApiProperty({ description: "Total number of items", example: 100 })
  total: number;

  @ApiProperty({ description: "Total number of pages", example: 5 })
  totalPages: number;

  @ApiProperty({ description: "Whether there are more pages", example: true })
  hasNext: boolean;

  @ApiProperty({
    description: "Whether there are previous pages",
    example: false,
  })
  hasPrev: boolean;
}

/**
 * Standard success response wrapper
 */
export class SuccessResponseDto<T> {
  @ApiProperty({ description: "HTTP status code", example: 200 })
  statusCode: number;

  @ApiProperty({ description: "Success indicator", example: true })
  success: boolean;

  @ApiProperty({
    description: "Response message",
    example: "Operation successful",
  })
  message: string;

  @ApiProperty({ description: "Response data" })
  data: T;

  @ApiPropertyOptional({
    description: "Pagination metadata for list responses",
  })
  pagination?: PaginationMeta;

  @ApiProperty({
    description: "Response timestamp",
    example: "2026-02-02T10:00:00.000Z",
  })
  timestamp: string;

  @ApiPropertyOptional({ description: "Request correlation ID for tracing" })
  requestId?: string;

  constructor(data: T, message = "Success", statusCode = 200) {
    this.statusCode = statusCode;
    this.success = true;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message = "Success",
  ): SuccessResponseDto<T[]> {
    const response = new SuccessResponseDto(data, message);
    response.pagination = pagination;
    return response;
  }
}

/**
 * Validation error detail
 */
export class ValidationErrorDetail {
  @ApiProperty({
    description: "Field name that failed validation",
    example: "email",
  })
  field: string;

  @ApiProperty({
    description: "Validation error message",
    example: "Invalid email format",
  })
  message: string;

  @ApiPropertyOptional({
    description: "Validation constraint that failed",
    example: "isEmail",
  })
  constraint?: string;

  @ApiPropertyOptional({ description: "Value that was provided" })
  value?: unknown;
}

/**
 * Standard error response wrapper
 */
export class ErrorResponseDto {
  @ApiProperty({ description: "HTTP status code", example: 400 })
  statusCode: number;

  @ApiProperty({ description: "Success indicator", example: false })
  success: boolean;

  @ApiProperty({
    description: "Error code for programmatic handling",
    example: "VAL_001",
  })
  code: ErrorCode | string;

  @ApiProperty({
    description: "Human-readable error message",
    example: "Validation failed",
  })
  message: string;

  @ApiPropertyOptional({
    description: "Detailed error information",
    type: [ValidationErrorDetail],
  })
  errors?: ValidationErrorDetail[];

  @ApiProperty({ description: "Request path", example: "/api/v1/users" })
  path: string;

  @ApiProperty({ description: "HTTP method", example: "POST" })
  method: string;

  @ApiProperty({
    description: "Error timestamp",
    example: "2026-02-02T10:00:00.000Z",
  })
  timestamp: string;

  @ApiPropertyOptional({ description: "Request correlation ID for tracing" })
  requestId?: string;

  @ApiPropertyOptional({ description: "Stack trace (development only)" })
  stack?: string;

  constructor(
    statusCode: number,
    code: ErrorCode | string,
    message: string,
    path: string,
    method: string,
  ) {
    this.statusCode = statusCode;
    this.success = false;
    this.code = code;
    this.message = message;
    this.path = path;
    this.method = method;
    this.timestamp = new Date().toISOString();
  }

  static validation(
    errors: ValidationErrorDetail[],
    path: string,
    method: string,
  ): ErrorResponseDto {
    const response = new ErrorResponseDto(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Validation failed",
      path,
      method,
    );
    response.errors = errors;
    return response;
  }

  static notFound(
    resource: string,
    path: string,
    method: string,
  ): ErrorResponseDto {
    return new ErrorResponseDto(
      404,
      ErrorCode.NOT_FOUND,
      `${resource} not found`,
      path,
      method,
    );
  }

  static unauthorized(
    message = "Unauthorized",
    path: string,
    method: string,
  ): ErrorResponseDto {
    return new ErrorResponseDto(
      401,
      ErrorCode.UNAUTHORIZED,
      message,
      path,
      method,
    );
  }

  static forbidden(
    message = "Access denied",
    path: string,
    method: string,
  ): ErrorResponseDto {
    return new ErrorResponseDto(
      403,
      ErrorCode.OPERATION_NOT_ALLOWED,
      message,
      path,
      method,
    );
  }

  static conflict(
    message: string,
    path: string,
    method: string,
  ): ErrorResponseDto {
    return new ErrorResponseDto(409, ErrorCode.CONFLICT, message, path, method);
  }

  static internal(path: string, method: string): ErrorResponseDto {
    return new ErrorResponseDto(
      500,
      ErrorCode.INTERNAL_ERROR,
      "An unexpected error occurred",
      path,
      method,
    );
  }
}

/**
 * Helper function to create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
