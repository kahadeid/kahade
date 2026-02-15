
import {
import { Observable } from "rxjs";
import { Request, Response as ExpressResponse } from "express";
import { map } from "rxjs/operators";

  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";

// ============================================================================
// ENHANCED TRANSFORM INTERCEPTOR
// Implements: Standardized response wrapping, Request ID propagation
// ============================================================================

/**
 * Standard API response interface
 */
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  requestId?: string;
}

/**
 * Paginated response data structure
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Check if data is already wrapped in our response format
 */
function isAlreadyWrapped<T>(data: unknown): data is ApiResponse<T> {
  return (
    data !== null &&
    typeof data === "object" &&
    "statusCode" in data &&
    "success" in data &&
    "data" in data
  );
}

/**
 * Check if data contains pagination info
 */
function hasPagination(
  data: unknown,
): data is { data: unknown[]; pagination: unknown } {
  return (
    data !== null &&
    typeof data === "object" &&
    "data" in data &&
    "pagination" in data &&
    Array.isArray((data as { data: unknown[] }).data)
  );
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { id?: string }>();
    const response = context.switchToHttp().getResponse<ExpressResponse>();
    const requestId = request.id || (request.headers["x-request-id"] as string);

    return next.handle().pipe(
      map((data) => {
        // If data is already in our response format, just add requestId
        if (isAlreadyWrapped<T>(data)) {
          return {
            ...data,
            requestId,
          };
        }

        const statusCode = response.statusCode;
        const timestamp = new Date().toISOString();

        // Handle paginated responses
        if (hasPagination(data)) {
          return {
            statusCode,
            success: true,
            message: "Success",
            data: data.data as T,
            pagination: data.pagination,
            timestamp,
            requestId,
          } as ApiResponse<T>;
        }

        // Handle null/undefined data
        if (data === null || data === undefined) {
          return {
            statusCode,
            success: true,
            message: "Success",
            data: null as T,
            timestamp,
            requestId,
          };
        }

        // Handle data with custom message
        if (
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as { message: unknown }).message === "string"
        ) {
          const { message, ...rest } = data as { message: string } & Record<
            string,
            unknown
          >;
          const responseData =
            Object.keys(rest).length === 1 && "data" in rest ? rest.data : rest;

          return {
            statusCode,
            success: true,
            message,
            data: responseData as T,
            timestamp,
            requestId,
          };
        }

        // Standard response wrapping
        return {
          statusCode,
          success: true,
          message: "Success",
          data,
          timestamp,
          requestId,
        };
      }),
    );
  }
}
