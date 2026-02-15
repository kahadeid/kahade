/**
 * Result Pattern Implementation
 *
 * Provides type-safe error handling without exceptions.
 * Based on Railway-Oriented Programming paradigm.
 *
 * Benefits:
 * - Explicit error handling
 * - Type-safe errors
 * - Composable operations
 * - No unexpected exceptions
 * - Better code documentation
 *
 * @example
 * ```typescript
 * // Instead of throwing exceptions
 * async function getUserBad(id: string): Promise<User> {
 *   const user = await prisma.user.findUnique({ where: { id } });
 *   if (!user) throw new NotFoundException('User not found');
 *   return user;
 * }
 *
 * // Use Result pattern
 * async function getUserGood(id: string): Promise<Result<User, 'NotFound'>> {
 *   const user = await prisma.user.findUnique({ where: { id } });
 *   if (!user) return Result.err('NotFound');
 *   return Result.ok(user);
 * }
 *
 * // Usage
 * const result = await getUserGood(id);
 * if (result.isErr()) {
 *   // Handle error
 *   return { error: result.error };
 * }
 * const user = result.value; // Type-safe access
 * ```
 */

/**
 * Success result
 */
export class Ok<T> {
  readonly ok: true = true;

  constructor(readonly value: T) {}

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): this is never {
    return false;
  }

  /**
   * Transform the success value
   */
  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Ok(fn(this.value));
  }

  /**
   * Chain operations that return Result
   */
  flatMap<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  /**
   * Get value or throw (use sparingly)
   */
  unwrap(): T {
    return this.value;
  }

  /**
   * Get value or default
   */
  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  /**
   * Execute callback with value
   */
  tap(fn: (value: T) => void): this {
    fn(this.value);
    return this;
  }
}

/**
 * Error result
 */
export class Err<E> {
  readonly ok: false = false;

  constructor(readonly error: E) {}

  isOk(): this is never {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  /**
   * Map does nothing on error
   */
  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as any;
  }

  /**
   * FlatMap does nothing on error
   */
  flatMap<U, F>(_fn: (value: never) => Result<U, F>): Result<U, E | F> {
    return this as any;
  }

  /**
   * Transform the error
   */
  mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return new Err(fn(this.error));
  }

  /**
   * Get value or throw
   */
  unwrap(): never {
    throw new Error(`Called unwrap on an Err: ${JSON.stringify(this.error)}`);
  }

  /**
   * Get value or default
   */
  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  /**
   * Execute callback with error
   */
  tapErr(fn: (error: E) => void): this {
    fn(this.error);
    return this;
  }
}

/**
 * Result type representing success or failure
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Result namespace with helper functions
 */
export const Result = {
  /**
   * Create a success result
   */
  ok<T>(value: T): Ok<T> {
    return new Ok(value);
  },

  /**
   * Create an error result
   */
  err<E>(error: E): Err<E> {
    return new Err(error);
  },

  /**
   * Wrap a function that may throw
   */
  from<T>(fn: () => T): Result<T, Error> {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.err(error as Error);
    }
  },

  /**
   * Wrap an async function that may throw
   */
  async fromAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
      return Result.ok(await fn());
    } catch (error) {
      return Result.err(error as Error);
    }
  },

  /**
   * Combine multiple Results
   * Returns Ok with array of values if all succeed
   * Returns first Err if any fail
   */
  all<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    for (const result of results) {
      if (result.isErr()) {
        return result;
      }
      values.push(result.value);
    }
    return Result.ok(values);
  },

  /**
   * Return first successful Result
   * Returns Err with array of errors if all fail
   */
  any<T, E>(results: Result<T, E>[]): Result<T, E[]> {
    const errors: E[] = [];
    for (const result of results) {
      if (result.isOk()) {
        return result;
      }
      errors.push(result.error);
    }
    return Result.err(errors);
  },
};

/**
 * Common error types for business logic
 */
export enum ErrorType {
  // Domain errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INVALID_INPUT = 'INVALID_INPUT',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Business rule errors
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ESCROW_EXPIRED = 'ESCROW_EXPIRED',
  ESCROW_ALREADY_RELEASED = 'ESCROW_ALREADY_RELEASED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  KYC_NOT_VERIFIED = 'KYC_NOT_VERIFIED',
  WALLET_FROZEN = 'WALLET_FROZEN',

  // System errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Domain error with type and message
 */
export interface DomainError {
  type: ErrorType;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Helper to create domain errors
 */
export const DomainError = {
  notFound(message: string, metadata?: Record<string, unknown>): DomainError {
    return { type: ErrorType.NOT_FOUND, message, metadata };
  },

  alreadyExists(message: string, metadata?: Record<string, unknown>): DomainError {
    return { type: ErrorType.ALREADY_EXISTS, message, metadata };
  },

  invalidInput(message: string, metadata?: Record<string, unknown>): DomainError {
    return { type: ErrorType.INVALID_INPUT, message, metadata };
  },

  forbidden(message: string, metadata?: Record<string, unknown>): DomainError {
    return { type: ErrorType.FORBIDDEN, message, metadata };
  },

  unauthorized(message: string, metadata?: Record<string, unknown>): DomainError {
    return { type: ErrorType.UNAUTHORIZED, message, metadata };
  },
};

/**
 * Example usage in a service:
 *
 * ```typescript
 * @Injectable()
 * export class EscrowService {
 *   async releaseEscrow(
 *     escrowId: string,
 *     userId: string
 *   ): Promise<Result<Escrow, DomainError>> {
 *     // Find escrow
 *     const escrow = await this.prisma.escrow.findUnique({
 *       where: { id: escrowId },
 *     });
 *
 *     if (!escrow) {
 *       return Result.err(
 *         DomainError.notFound('Escrow not found', { escrowId })
 *       );
 *     }
 *
 *     // Check authorization
 *     if (escrow.sellerId !== userId) {
 *       return Result.err(
 *         DomainError.forbidden('Only seller can release escrow')
 *       );
 *     }
 *
 *     // Check status
 *     if (escrow.status === 'RELEASED') {
 *       return Result.err({
 *         type: ErrorType.ESCROW_ALREADY_RELEASED,
 *         message: 'Escrow has already been released',
 *       });
 *     }
 *
 *     // Release escrow
 *     const released = await this.prisma.escrow.update({
 *       where: { id: escrowId },
 *       data: { status: 'RELEASED', releasedAt: new Date() },
 *     });
 *
 *     return Result.ok(released);
 *   }
 * }
 *
 * // In controller
 * @Post(':id/release')
 * async releaseEscrow(
 *   @Param('id') id: string,
 *   @CurrentUser() user: User,
 * ) {
 *   const result = await this.escrowService.releaseEscrow(id, user.id);
 *
 *   if (result.isErr()) {
 *     const error = result.error;
 *     switch (error.type) {
 *       case ErrorType.NOT_FOUND:
 *         throw new NotFoundException(error.message);
 *       case ErrorType.FORBIDDEN:
 *         throw new ForbiddenException(error.message);
 *       default:
 *         throw new BadRequestException(error.message);
 *     }
 *   }
 *
 *   return result.value;
 * }
 * ```
 */
