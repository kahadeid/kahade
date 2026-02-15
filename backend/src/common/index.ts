/**
 * Common Module Barrel Exports
 *
 * Centralizes all common utilities, decorators, and guards.
 * Use this for clean imports across the application.
 *
 * Usage:
 * ```typescript
 * // ❌ Before
 * import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
 * import { CurrentUser } from '@common/decorators/current-user.decorator';
 * import { Roles } from '@common/decorators/permissions.decorator';
 *
 * // ✅ After
 * import { JwtAuthGuard, CurrentUser, Roles } from '@common';
 * ```
 */

// ============================================================================
// Decorators
// ============================================================================

export * from './decorators/current-user.decorator';
export * from './decorators/public.decorator';
export * from './decorators/permissions.decorator';
export * from './decorators/catch-errors.decorator';
export * from './decorators/rate-limit.decorator';

// ============================================================================
// Guards
// ============================================================================

export * from './guards/jwt-auth.guard';
// Export * from './guards/roles.guard'; // NOTE: Create after review - Tracked in backlog
// Export * from './guards/permissions.guard'; // NOTE: Create after review - Tracked in backlog

// ============================================================================
// Utilities
// ============================================================================

export * from './utils/hash.util';
export * from './utils/logger.util';
export * from './utils/money.util';
export * from './utils/file.util';
export * from './utils/transaction.util';

// ============================================================================
// DTOs
// ============================================================================

export * from './dto/pagination.dto';

// ============================================================================
// Interfaces
// ============================================================================

// Re-export commonly used types
export type {
  PaginatedResponse,
  CursorPaginatedResponse,
  RateLimitConfig,
} from './dto/pagination.dto';

// ============================================================================
// Constants
// ============================================================================

export {
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
} from './decorators/permissions.decorator';

export {
  RateLimitPresets,
} from './decorators/rate-limit.decorator';
