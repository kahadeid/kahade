/**
 * API Response Helper (LOW-008)
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ResponseHelper {
  /**
   * Success response
   */
  static success<T>(data: T, metadata?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Error response
   */
  static error(
    code: string,
    message: string,
    details?: any,
  ): ApiResponse<never> {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Paginated response
   */
  static paginated<T>(
    data: T[],
    page: number,
    perPage: number,
    total: number,
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  /**
   * Created response (201)
   */
  static created<T>(data: T): ApiResponse<T> {
    return this.success(data);
  }

  /**
   * No content response (204)
   */
  static noContent(): ApiResponse<never> {
    return {
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
