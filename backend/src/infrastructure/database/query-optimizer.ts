import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';



/**
 * Database Query Optimization Utilities (HIGH-021)
 *
 * Provides tools for:
 * - Query performance monitoring
 * - Batch operations
 * - Index hints
 * - Query result caching
 * - Slow query detection
 */

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  affectedRows?: number;
}

export class QueryOptimizer {
  private readonly logger = new Logger(QueryOptimizer.name);
  private queryMetrics: QueryMetrics[] = [];
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private readonly MAX_METRICS = 1000; // Keep last 1000 queries

  /**
   * Execute query with performance tracking
   */
  async trackQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;

      // Log slow queries
      if (duration > this.SLOW_QUERY_THRESHOLD) {
        this.logger.warn(
          `Slow query detected: ${queryName} took ${duration}ms`,
        );
      }

      // Store metrics
      this.addMetric({
        query: queryName,
        duration,
        timestamp: new Date(),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Query failed: ${queryName} after ${duration}ms`,
        error,
      );
      throw error;
    }
  }

  /**
   * Batch insert optimization
   * Inserts records in chunks to avoid memory issues
   */
  async batchInsert<T>(
    prisma: PrismaClient,
    model: string,
    data: unknown[],
    chunkSize: number = 100,
  ): Promise<void> {
    const chunks = this.chunkArray(data, chunkSize);

    this.logger.log(
      `Batch inserting ${data.length} records in ${chunks.length} chunks`,
    );

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      await this.trackQuery(
        `batchInsert-${model}-chunk-${i + 1}`,
        async () => {
          return await (prisma as any)[model].createMany({
            data: chunk,
            skipDuplicates: true,
          });
        },
      );

      this.logger.debug(
        `Inserted chunk ${i + 1}/${chunks.length} (${chunk.length} records)`,
      );
    }
  }

  /**
   * Batch update optimization
   */
  async batchUpdate<T>(
    prisma: PrismaClient,
    model: string,
    updates: Array<{ where: any; data: unknown }>,
    chunkSize: number = 50,
  ): Promise<void> {
    const chunks = this.chunkArray(updates, chunkSize);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      await this.trackQuery(
        `batchUpdate-${model}-chunk-${i + 1}`,
        async () => {
          return await prisma.$transaction(
            chunk.map((update) =>
              (prisma as any)[model].update(update),
            ),
          );
        },
      );
    }
  }

  /**
   * Batch delete optimization
   */
  async batchDelete(
    prisma: PrismaClient,
    model: string,
    ids: string[],
    chunkSize: number = 100,
  ): Promise<void> {
    const chunks = this.chunkArray(ids, chunkSize);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      await this.trackQuery(
        `batchDelete-${model}-chunk-${i + 1}`,
        async () => {
          return await (prisma as any)[model].deleteMany({
            where: { id: { in: chunk } },
          });
        },
      );
    }
  }

  /**
   * Get query performance metrics
   */
  getMetrics(): {
    totalQueries: number;
    averageDuration: number;
    slowQueries: number;
    recentQueries: QueryMetrics[];
  } {
    const totalQueries = this.queryMetrics.length;
    const averageDuration =
      this.queryMetrics.reduce((sum, m) => sum + m.duration, 0) /
      totalQueries;
    const slowQueries = this.queryMetrics.filter(
      (m) => m.duration > this.SLOW_QUERY_THRESHOLD,
    ).length;

    return {
      totalQueries,
      averageDuration,
      slowQueries,
      recentQueries: this.queryMetrics.slice(-10), // Last 10 queries
    };
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.queryMetrics = [];
  }

  /**
   * Helper: Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Helper: Add metric with size limit
   */
  private addMetric(metric: QueryMetrics): void {
    this.queryMetrics.push(metric);

    // Keep only last N metrics
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS);
    }
  }
}

/**
 * Query Builder with index hints
 */
export class OptimizedQueryBuilder {
  /**
   * Build query with index hint
   * Note: Prisma doesn't support index hints directly
   * This is a placeholder for raw query optimization
   */
  static withIndexHint(
    tableName: string,
    indexName: string,
    query: string,
  ): string {
    // PostgreSQL doesn't have index hints like MySQL
    // But we can use query hints in comments
    return `/* INDEX(${tableName} ${indexName}) */ ${query}`;
  }

  /**
   * Build optimized pagination query
   */
  static buildPaginationQuery(
    page: number,
    limit: number,
  ): { skip: number; take: number } {
    // Validate inputs
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    return {
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    };
  }
}
