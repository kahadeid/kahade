import { Injectable, Logger } from '@nestjs/common';



/**
 * Database Query Optimization (MEDIUM-005)
 *
 * Utilities:
 * - Batch loading (DataLoader pattern)
 * - Query result caching
 * - Connection pooling
 * - Query analysis
 * - Index suggestions
 */

@Injectable()
export class QueryOptimizerService {
  private readonly logger = new Logger(QueryOptimizerService.name);
  private queryCache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly cacheTTL = 60000; // 1 minute

  /**
   * Batch load entities by IDs
   * Prevents N+1 query problem
   */
  async batchLoad<T>(
    ids: string[],
    loader: (ids: string[]) => Promise<T[]>,
    keyExtractor: (item: T) => string,
  ): Promise<T[]> {
    // Remove duplicates
    const uniqueIds = [...new Set(ids)];

    // Load all at once
    const items = await loader(uniqueIds);

    // Create map for O(1) lookup
    const itemMap = new Map<string, T>();
    items.forEach((item) => {
      itemMap.set(keyExtractor(item), item);
    });

    // Return in original order
    return ids.map((id) => itemMap.get(id)!).filter(Boolean);
  }

  /**
   * Execute query with caching
   */
  async withCache<T>(
    key: string,
    query: () => Promise<T>,
    ttl: number = this.cacheTTL,
  ): Promise<T> {
    const cached = this.queryCache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await query();
    this.queryCache.set(key, { data, timestamp: now });

    // Cleanup old cache entries
    this.cleanupCache();

    return data;
  }

  /**
   * Bulk insert with batching
   */
  async bulkInsert<T>(
    items: T[],
    inserter: (batch: T[]) => Promise<any>,
    batchSize: number = 100,
  ): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await inserter(batch);
    }
  }

  /**
   * Paginate efficiently
   */
  async paginate<T>(
    query: (skip: number, take: number) => Promise<T[]>,
    countQuery: () => Promise<number>,
    page: number = 1,
    perPage: number = 10,
  ): Promise<{ data: T[]; total: number; page: number; perPage: number }> {
    const skip = (page - 1) * perPage;

    const [data, total] = await Promise.all([
      query(skip, perPage),
      countQuery(),
    ]);

    return { data, total, page, perPage };
  }

  /**
   * Analyze slow queries
   */
  async analyzeQuery<T>(
    queryName: string,
    query: () => Promise<T>,
  ): Promise<T> {
    const start = Date.now();
    const result = await query();
    const duration = Date.now() - start;

    if (duration > 1000) {
      this.logger.warn(
        `Slow query detected: ${queryName} took ${duration}ms`,
      );
    }

    return result;
  }

  /**
   * Clear query cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.queryCache.delete(key);
    } else {
      this.queryCache.clear();
    }
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.queryCache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.queryCache.size,
      ttl: this.cacheTTL,
    };
  }
}

/**
 * Usage examples:
 *
 * // Batch loading (prevents N+1)
 * const userIds = orders.map(o => o.userId);
 * const users = await optimizer.batchLoad(
 *   userIds,
 *   (ids) => prisma.user.findMany({ where: { id: { in: ids } } }),
 *   (user) => user.id
 * );
 *
 * // Query caching
 * const popularPosts = await optimizer.withCache(
 *   'popular-posts',
 *   () => prisma.post.findMany({ where: { views: { gt: 1000 } } }),
 *   300000 // 5 minutes
 * );
 *
 * // Bulk insert
 * await optimizer.bulkInsert(
 *   users,
 *   (batch) => prisma.user.createMany({ data: batch }),
 *   100
 * );
 *
 * // Pagination
 * const result = await optimizer.paginate(
 *   (skip, take) => prisma.user.findMany({ skip, take }),
 *   () => prisma.user.count(),
 *   page,
 *   perPage
 * );
 */
