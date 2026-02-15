import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { PAGINATION } from '@common/constants/limits.constants';
import { Type } from 'class-transformer';



/**
 * Pagination DTO (MED-003)
 *
 * Standardizes pagination across all list endpoints.
 * Prevents unbounded result sets that can cause memory issues.
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    minimum: PAGINATION.MIN_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(PAGINATION.MIN_LIMIT)
  page?: number = PAGINATION.DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: PAGINATION.MIN_LIMIT,
    maximum: PAGINATION.MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(PAGINATION.MIN_LIMIT)
  @Max(PAGINATION.MAX_LIMIT)
  limit?: number = PAGINATION.DEFAULT_LIMIT;

  // Helper method to get skip value
  get skip(): number {
    return ((this.page || PAGINATION.DEFAULT_PAGE) - 1) *
      (this.limit || PAGINATION.DEFAULT_LIMIT);
  }

  // Helper method to get take value
  get take(): number {
    return this.limit || PAGINATION.DEFAULT_LIMIT;
  }
}

/**
 * Pagination response interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Create pagination metadata
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

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: {
    cursor?: string;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    total?: number;
  };
}

export interface RateLimitConfig {
  ttl: number;
  limit: number;
  skipIf?: (context: unknown) => boolean;
}
