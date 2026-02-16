import { Injectable, Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';



/**
 * Performance Monitoring Service (HIGH-027)
 *
 * Tracks:
 * - Response times
 * - Memory usage
 * - Database query performance
 * - Error rates
 * - Custom metrics
 */

interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
  type?: 'counter' | 'gauge' | 'histogram';
  count?: number;
  sum?: number;
  avg?: number;
  p95?: number;
  p99?: number;
}

interface Timer {
  startTime: number;
  name: string;
  labels?: Record<string, string>;
}

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private metrics: Metric[] = [];
  private timers = new Map<string, Timer>();
  private readonly MAX_METRICS = 10000;

  /**
   * Start a timer
   */
  startTimer(name: string, labels?: Record<string, string>): string {
    const timerId = `${name}_${Date.now()}_${Math.random()}`;

    this.timers.set(timerId, {
      startTime: performance.now(),
      name,
      labels,
    });

    return timerId;
  }

  /**
   * End a timer and record duration
   */
  endTimer(timerId: string): number | null {
    const timer = this.timers.get(timerId);
    if (!timer) {
      this.logger.warn(`Timer ${timerId} not found`);
      return null;
    }

    const duration = performance.now() - timer.startTime;

    // Record metric
    this.recordMetric(timer.name, duration, timer.labels);

    // Clean up
    this.timers.delete(timerId);

    return duration;
  }

  /**
   * Record a metric
   */
  recordMetric(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    this.metrics.push({
      name,
      value,
      timestamp: new Date(),
      labels,
    });

    // Limit metrics size
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Get metrics by name
   */
  getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.filter((m) => m.name === name);
    }
    return this.metrics;
  }

  /**
   * Get metric statistics
   */
  getStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
    };
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  } {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      rss: Math.round(usage.rss / 1024 / 1024), // MB
    };
  }

  /**
   * Get current CPU usage
   */
  getCpuUsage(): { user: number; system: number } {
    const usage = process.cpuUsage();
    return {
      user: Math.round(usage.user / 1000), // ms
      system: Math.round(usage.system / 1000), // ms
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get metrics as Prometheus-formatted string
   */
  getMetricsAsPrometheus(): string {
    const allMetrics = this.getMetrics();
    const lines: string[] = [];
    for (const metric of allMetrics) {
      const name = metric.name.replace(/[^a-zA-Z0-9_]/g, '_');
      if (metric.type === 'histogram') {
        lines.push(`# TYPE ${name} histogram`);
        lines.push(`${name}_count ${metric.count}`);
        lines.push(`${name}_sum ${metric.sum}`);
        lines.push(`${name}_avg ${metric.avg}`);
        lines.push(`${name}_p95 ${metric.p95}`);
        lines.push(`${name}_p99 ${metric.p99}`);
      } else if (metric.type === 'counter' || metric.type === 'gauge') {
        lines.push(`# TYPE ${name} ${metric.type}`);
        lines.push(`${name} ${metric.value}`);
      }
    }
    return lines.join('\n');
  }

  /**
   * Get metrics as JSON object
   */
  getMetricsAsJson(): Record<string, unknown> {
    const allMetrics = this.getMetrics();
    return {
      timestamp: new Date().toISOString(),
      metrics: allMetrics,
      memory: this.getMemoryUsage(),
      cpu: this.getCpuUsage(),
    };
  }

  /**
   * Get high-level performance summary
   */
  getSummary(): Record<string, unknown> {
    const memory = this.getMemoryUsage();
    const cpu = this.getCpuUsage();
    const allMetrics = this.getMetrics();
    const histograms = allMetrics.filter((m) => m.type === 'histogram');

    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
        rssMB: Math.round(memory.rss / 1024 / 1024),
      },
      cpu: {
        userMs: cpu.user,
        systemMs: cpu.system,
      },
      requests: {
        total: histograms.reduce((sum, m) => sum + (m.count || 0), 0),
        avgDurationMs:
          histograms.length > 0
            ? Math.round(
                histograms.reduce((sum, m) => sum + (m.avg || 0), 0) /
                  histograms.length,
              )
            : 0,
      },
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    const index = Math.ceil((values.length * p) / 100) - 1;
    return values[Math.max(0, index)];
  }
}

/**
 * Performance decorator for methods
 */
export function Measure(metricName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const performanceService: PerformanceService =
        this.performanceService;

      if (!performanceService) {
        // No performance service, execute normally
        return originalMethod.apply(this, args);
      }

      const timerId = performanceService.startTimer(name);

      try {
        const result = await originalMethod.apply(this, args);
        performanceService.endTimer(timerId);
        return result;
      } catch (error) {
        performanceService.endTimer(timerId);
        throw error;
      }
    };

    return descriptor;
  };
}

// =========================================================
// Additional methods required by MetricsController
// =========================================================

export class PerformanceServiceExtensions {
  /**
   * Get metrics formatted as Prometheus text
   */
  static formatAsPrometheus(metrics: Metric[]): string {
    const lines: string[] = [];
    for (const metric of metrics) {
      const name = metric.name.replace(/[^a-zA-Z0-9_]/g, '_');
      if (metric.type === 'counter' || metric.type === 'gauge') {
        lines.push(`# TYPE ${name} ${metric.type}`);
        lines.push(`${name} ${metric.value}`);
      } else if (metric.type === 'histogram') {
        lines.push(`# TYPE ${name} histogram`);
        lines.push(`${name}_count ${metric.count}`);
        lines.push(`${name}_sum ${metric.sum}`);
        lines.push(`${name}_avg ${metric.avg}`);
      }
    }
    return lines.join('\n');
  }
}
