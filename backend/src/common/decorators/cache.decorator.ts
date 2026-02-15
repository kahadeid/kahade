import { SetMetadata } from '@nestjs/common';


/**
 * Cache metadata key
 */
export const CACHE_KEY = 'cache';
export const CACHE_EVICT_KEY = 'cache_evict';
export const CACHE_PUT_KEY = 'cache_put';

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /**
   * Cache key or key generator function
   * If function, receives method arguments
   */
  key?: string | ((...args: unknown[]) => string);

  /**
   * Time to live in seconds
   * @default 300 (5 minutes)
   */
  ttl?: number;

  /**
   * Cache namespace/prefix
   */
  namespace?: string;

  /**
   * Condition function to determine if result should be cached
   * @default Always cache
   */
  condition?: (result: unknown) => boolean;
}

/**
 * Cache eviction options
 */
export interface CacheEvictOptions {
  /**
   * Cache key(s) to evict
   */
  key?: string | string[] | ((...args: unknown[]) => string | string[]);

  /**
   * Whether to evict all keys in namespace
   * @default false
   */
  allEntries?: boolean;

  /**
   * Cache namespace to evict from
   */
  namespace?: string;

  /**
   * Whether to evict before or after method execution
   * @default 'after'
   */
  timing?: 'before' | 'after';
}

/**
 * Decorator to cache method results
 *
 * Automatically caches the return value of a method.
 * Subsequent calls with the same arguments return cached value.
 *
 * @example
 * ```typescript
 * @Cacheable({
 *   key: (userId: string) => `user:${userId}`,
 *   ttl: 600, // 10 minutes
 *   namespace: 'users',
 * })
 * async getUserById(userId: string): Promise<User> {
 *   return this.prisma.user.findUnique({ where: { id: userId } });
 * }
 *
 * // With condition
 * @Cacheable({
 *   key: (query: string) => `search:${query}`,
 *   condition: (results) => results.length > 0, // Only cache non-empty results
 * })
 * async searchUsers(query: string): Promise<User[]> {
 *   return this.prisma.user.findMany({ where: { name: { contains: query } } });
 * }
 * ```
 */
export const Cacheable = (options: CacheOptions = {}): MethodDecorator => {
  return SetMetadata(CACHE_KEY, {
    ttl: 300, // 5 minutes default
    condition: () => true,
    ...options,
  });
};

/**
 * Decorator to evict cache entries
 *
 * Removes cached values when method is called.
 * Useful for invalidating cache after data modifications.
 *
 * @example
 * ```typescript
 * @CacheEvict({
 *   key: (userId: string) => `user:${userId}`,
 *   namespace: 'users',
 * })
 * async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
 *   return this.prisma.user.update({ where: { id: userId }, data });
 * }
 *
 * // Evict all entries in namespace
 * @CacheEvict({
 *   namespace: 'users',
 *   allEntries: true,
 * })
 * async deleteAllUsers(): Promise<void> {
 *   await this.prisma.user.deleteMany();
 * }
 *
 * // Evict before execution
 * @CacheEvict({
 *   key: 'active-sessions',
 *   timing: 'before',
 * })
 * async logout(userId: string): Promise<void> {
 *   // Cache cleared before logout
 *   await this.sessionService.destroy(userId);
 * }
 * ```
 */
export const CacheEvict = (options: CacheEvictOptions = {}): MethodDecorator => {
  return SetMetadata(CACHE_EVICT_KEY, {
    timing: 'after',
    allEntries: false,
    ...options,
  });
};

/**
 * Decorator to update cache with method result
 *
 * Always executes the method and updates cache with the result.
 * Unlike @Cacheable, this doesn't check cache before execution.
 *
 * @example
 * ```typescript
 * @CachePut({
 *   key: (userId: string) => `user:${userId}`,
 *   namespace: 'users',
 * })
 * async refreshUserCache(userId: string): Promise<User> {
 *   // Always fetches fresh data and updates cache
 *   return this.prisma.user.findUnique({ where: { id: userId } });
 * }
 * ```
 */
export const CachePut = (options: CacheOptions = {}): MethodDecorator => {
  return SetMetadata(CACHE_PUT_KEY, {
    ttl: 300,
    ...options,
  });
};

/**
 * Cache key generator utilities
 */
export class CacheKeyGenerator {
  /**
   * Generate cache key from method arguments
   */
  static fromArgs(...args: unknown[]): string {
    return args.map((arg) => this.stringify(arg)).join(':');
  }

  /**
   * Generate cache key with prefix
   */
  static withPrefix(prefix: string, ...args: unknown[]): string {
    return `${prefix}:${this.fromArgs(...args)}`;
  }

  /**
   * Generate cache key for paginated results
   */
  static paginated(page: number, limit: number, ...filters: unknown[]): string {
    return `page:${page}:limit:${limit}:${this.fromArgs(...filters)}`;
  }

  /**
   * Stringify value for cache key
   */
  private static stringify(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }
}

/**
 * Common cache TTL constants (in seconds)
 */
export const CacheTTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
  THIRTY_MINUTES: 1800,
  ONE_HOUR: 3600,
  SIX_HOURS: 21600,
  TWELVE_HOURS: 43200,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
} as const;

/**
 * Cache namespaces for organization
 */
export const CacheNamespace = {
  USERS: 'users',
  ORDERS: 'orders',
  ESCROW: 'escrow',
  PAYMENTS: 'payments',
  WALLETS: 'wallets',
  KYC: 'kyc',
  SETTINGS: 'settings',
  RATES: 'rates',
  STATISTICS: 'statistics',
} as const;

/**
 * Example usage in a service:
 *
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(private readonly prisma: PrismaService) {}
 *
 *   @Cacheable({
 *     key: (id: string) => `user:${id}`,
 *     namespace: CacheNamespace.USERS,
 *     ttl: CacheTTL.FIVE_MINUTES,
 *   })
 *   async findById(id: string): Promise<User> {
 *     return this.prisma.user.findUnique({ where: { id } });
 *   }
 *
 *   @CacheEvict({
 *     key: (id: string) => `user:${id}`,
 *     namespace: CacheNamespace.USERS,
 *   })
 *   async update(id: string, data: UpdateUserDto): Promise<User> {
 *     return this.prisma.user.update({ where: { id }, data });
 *   }
 *
 *   @CacheEvict({
 *     namespace: CacheNamespace.USERS,
 *     allEntries: true,
 *   })
 *   async clearAllUserCache(): Promise<void> {
 *     // All user cache entries will be cleared
 *   }
 * }
 * ```
 */
