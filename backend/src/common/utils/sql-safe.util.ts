import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';



/**
 * SQL Safe Utility
 *
 * SECURITY IMPROVEMENT (CRIT-003):
 * - Prevents SQL injection attacks
 * - Whitelists allowed columns for raw queries
 * - Validates and sanitizes all user inputs
 * - Uses parameterized queries exclusively
 */

/**
 * Allowed columns for different tables
 * SECURITY: Whitelist approach - only explicitly allowed columns can be used in raw queries
 */
const ALLOWED_COLUMNS = {
  user: ['id', 'email', 'username', 'createdAt', 'updatedAt', 'isAdmin'] as const,
  wallet: ['id', 'userId', 'balanceMinor', 'currency', 'createdAt', 'updatedAt'] as const,
  order: ['id', 'buyerId', 'sellerId', 'status', 'createdAt', 'updatedAt'] as const,
  transaction: ['id', 'userId', 'type', 'status', 'createdAt'] as const,
  deposit: ['id', 'walletId', 'status', 'createdAt'] as const,
  withdrawal: ['id', 'walletId', 'status', 'requestedAt'] as const,
} as const;

type TableName = keyof typeof ALLOWED_COLUMNS;
type ColumnName<T extends TableName> = typeof ALLOWED_COLUMNS[T][number];

/**
 * Allowed sort directions
 */
const ALLOWED_SORT_DIRECTIONS = ['ASC', 'DESC', 'asc', 'desc'] as const;
type SortDirection = typeof ALLOWED_SORT_DIRECTIONS[number];

/**
 * Validate if a column is allowed for a table
 * @param table - Table name
 * @param column - Column name
 * @returns True if column is allowed
 */
export function isColumnAllowed(table: TableName, column: string): column is ColumnName<typeof table> {
  const allowedColumns = ALLOWED_COLUMNS[table];
  return allowedColumns.includes(column as any);
}

/**
 * Validate sort direction
 * @param direction - Sort direction
 * @returns True if direction is valid
 */
export function isValidSortDirection(direction: string): direction is SortDirection {
  return ALLOWED_SORT_DIRECTIONS.includes(direction as any);
}

/**
 * Create a safe ILIKE query for search
 * @param table - Table name
 * @param column - Column name (must be whitelisted)
 * @param value - Search value (will be sanitized)
 * @returns Prisma SQL query
 * @throws BadRequestException if column is not whitelisted
 */
export function safeILike(
  table: TableName,
  column: string,
  value: string
): Prisma.Sql {
  // Validate column is in whitelist
  if (!isColumnAllowed(table, column)) {
    throw new BadRequestException(`Invalid column '${column}' for table '${table}'`);
  }

  // Sanitize value - escape special characters for ILIKE
  const sanitizedValue = sanitizeForILike(value);

  // Use parameterized query - Prisma automatically escapes the value
  return Prisma.sql`${Prisma.raw(column)} ILIKE ${`%${sanitizedValue}%`}`;
}

/**
 * Create a safe ORDER BY clause
 * @param table - Table name
 * @param column - Column name (must be whitelisted)
 * @param direction - Sort direction (ASC/DESC)
 * @returns Prisma SQL query
 * @throws BadRequestException if column or direction is invalid
 */
export function safeOrderBy(
  table: TableName,
  column: string,
  direction: string = 'ASC'
): Prisma.Sql {
  // Validate column
  if (!isColumnAllowed(table, column)) {
    throw new BadRequestException(`Invalid column '${column}' for table '${table}'`);
  }

  // Validate direction
  if (!isValidSortDirection(direction)) {
    throw new BadRequestException(`Invalid sort direction '${direction}'`);
  }

  // Safe to use Prisma.raw here because we've validated the values
  return Prisma.sql`ORDER BY ${Prisma.raw(column)} ${Prisma.raw(direction.toUpperCase())}`;
}

/**
 * Create a safe WHERE IN clause
 * @param table - Table name
 * @param column - Column name (must be whitelisted)
 * @param values - Array of values (will be parameterized)
 * @returns Prisma SQL query
 * @throws BadRequestException if column is not whitelisted or values is empty
 */
export function safeWhereIn(
  table: TableName,
  column: string,
  values: (string | number)[]
): Prisma.Sql {
  // Validate column
  if (!isColumnAllowed(table, column)) {
    throw new BadRequestException(`Invalid column '${column}' for table '${table}'`);
  }

  // Validate values array is not empty
  if (!values || values.length === 0) {
    throw new BadRequestException('Values array cannot be empty');
  }

  // Use Prisma's parameterization - completely safe from injection
  return Prisma.sql`${Prisma.raw(column)} IN (${Prisma.join(values)})`;
}

/**
 * Sanitize value for ILIKE query
 * Escapes special characters that have meaning in LIKE patterns
 * @param value - Input value
 * @returns Sanitized value
 */
export function sanitizeForILike(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }

  // Remove or escape special characters
  return value
    .replace(/\\/g, '\\\\') // Escape backslash
    .replace(/%/g, '\\%')    // Escape percent
    .replace(/_/g, '\\_')    // Escape underscore
    .replace(/'/g, "''")     // Escape single quote
    .trim();
}

/**
 * Sanitize table name
 * Only allows alphanumeric and underscore
 * @param tableName - Table name to sanitize
 * @returns Sanitized table name
 * @throws BadRequestException if table name is invalid
 */
export function sanitizeTableName(tableName: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    throw new BadRequestException('Invalid table name');
  }
  return tableName;
}

/**
 * Create safe pagination clause
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Object with skip and take values
 * @throws BadRequestException if values are invalid
 */
export function safePagination(page: number = 1, limit: number = 20): { skip: number; take: number } {
  // Validate page
  const pageNum = parseInt(String(page), 10);
  if (isNaN(pageNum) || pageNum < 1) {
    throw new BadRequestException('Invalid page number');
  }

  // Validate limit
  const limitNum = parseInt(String(limit), 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new BadRequestException('Invalid limit (must be between 1 and 100)');
  }

  return {
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
  };
}

/**
 * Validate UUID format
 * @param uuid - UUID string to validate
 * @returns True if valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate and sanitize UUID
 * @param uuid - UUID string
 * @returns Sanitized UUID
 * @throws BadRequestException if UUID is invalid
 */
export function sanitizeUUID(uuid: string): string {
  if (!isValidUUID(uuid)) {
    throw new BadRequestException('Invalid UUID format');
  }
  return uuid.toLowerCase();
}

/**
 * Create a safe full-text search query
 * @param table - Table name
 * @param columns - Array of column names to search
 * @param searchTerm - Search term
 * @returns Prisma SQL query
 * @throws BadRequestException if any column is not whitelisted
 */
export function safeFullTextSearch(
  table: TableName,
  columns: string[],
  searchTerm: string
): Prisma.Sql {
  // Validate all columns
  for (const column of columns) {
    if (!isColumnAllowed(table, column)) {
      throw new BadRequestException(`Invalid column '${column}' for table '${table}'`);
    }
  }

  if (columns.length === 0) {
    throw new BadRequestException('At least one column is required for search');
  }

  // Sanitize search term
  const sanitizedTerm = sanitizeForILike(searchTerm);

  // Build safe search conditions
  const conditions = columns.map(col =>
    Prisma.sql`${Prisma.raw(col)} ILIKE ${`%${sanitizedTerm}%`}`
  );

  // Join conditions with OR
  return Prisma.sql`(${Prisma.join(conditions, ' OR ')})`;
}

/**
 * Export types for use in other modules
 */
export type { TableName, ColumnName, SortDirection };
