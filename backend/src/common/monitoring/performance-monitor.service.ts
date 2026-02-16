import { Injectable, Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';



/**
 * Performance Monitoring Dashboard (MEDIUM-003)
 *
 * Real-time performance tracking:
 * - Request duration
 * - Database query time
 * - Cache hit rate
 * - Memory usage
 * - CPU usage
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  count: number;
  p50: number;
  p95: number;
  p99: number;
}

@Injectable()
export class PerformanceMonitorService {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly maxMetrics = 1000; // Keep last 1000 metrics per name

  /**
   * Start measuring operation
   */
  startMeasure(name: string, metadata?: Record<string, any>): () => void {
    const startTime = performance.now();
    const startMark = `${name}-start-${Date.now()}`;

    performance.mark(startMark);

    // Return function to end measurement
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric({
        name,
        duration,
        timestamp: new Date(),
        metadata,
      });

      // Log slow operations
      if (duration > 1000) {
        this.logger.warn(
          `Slow operation: ${name} took ${duration.toFixed(2)}ms`,
          metadata,
        );
      }

      performance.clearMarks(startMark);
    };
  }

  /**
   * Measure async operation
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>,
  ): Promise<T> {
    const endMeasure = this.startMeasure(name, metadata);
    try {
      return await operation();
    } finally {
      endMeasure();
    }
  }

  /**
   * Measure sync operation
   */
  measure<T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, any>,
  ): T {
    const endMeasure = this.startMeasure(name, metadata);
    try {
      return operation();
    } finally {
      endMeasure();
    }
  }

  /**
   * Record metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const metrics = this.metrics.get(metric.name)!;
    metrics.push(metric);

    // Keep only last N metrics
    if (metrics.length > this.maxMetrics) {
      metrics.shift();
    }
  }

  /**
   * Get statistics for operation
   */
  getStats(name: string): PerformanceStats | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const count = durations.length;

    return {
      avgDuration: durations.reduce((a, b) => a + b, 0) / count,
      minDuration: durations[0],
      maxDuration: durations[count - 1],
      count,
      p50: this.percentile(durations, 50),
      p95: this.percentile(durations, 95),
      p99: this.percentile(durations, 99),
    };
  }

  /**
   * Get all statistics
   */
  getAllStats(): Record<string, PerformanceStats> {
    const stats: Record<string, PerformanceStats> = {};

    for (const [name] of this.metrics) {
      const stat = this.getStats(name);
      if (stat) {
        stats[name] = stat;
      }
    }

    return stats;
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get memory usage
   */
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
    };
  }

  /**
   * Clear metrics
   */
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

/**
 * Decorator for automatic performance monitoring
 */
export function Monitor(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const monitor: PerformanceMonitorService = (this as any)
        .performanceMonitor;

      if (!monitor) {
        return originalMethod.apply(this, args);
      }

      return monitor.measureAsync(
        metricName,
        () => originalMethod.apply(this, args),
      );
    };

    return descriptor;
  };
}

/**
 * Usage:
 *
 * constructor(private performanceMonitor: PerformanceMonitorService) {}
 *
 * // Manual measurement
 * const endMeasure = this.performanceMonitor.startMeasure('database-query');
 * const result = await prisma.user.findMany();
 * endMeasure();
 *
 * // Async measurement
 * const result = await this.performanceMonitor.measureAsync(
 *   'complex-operation',
 *   async () => {
 *     return await this.performComplexOperation();
 *   },
 * );
 *
 * // Decorator
 * @Monitor('user-creation')
 * async createUser(dto: CreateUserDto) {
 *   return await this.prisma.user.create({ data: dto });
 * }
 *
 * // Get statistics
 * const stats = this.performanceMonitor.getStats('database-query');
 * */
