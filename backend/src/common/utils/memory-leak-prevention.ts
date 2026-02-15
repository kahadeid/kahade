import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';


import * as EventEmitter from 'events';

/**
 * Memory Leak Prevention (HIGH-039)
 *
 * Features:
 * - Event listener cleanup
 * - Timer cleanup
 * - Stream cleanup
 * - Memory monitoring
 * - Leak detection
 */

@Injectable()
export class MemoryLeakPreventionService implements OnModuleDestroy {
  private readonly logger = new Logger(MemoryLeakPreventionService.name);
  private timers = new Set<NodeJS.Timeout>();
  private intervals = new Set<NodeJS.Timeout>();
  private listeners = new Map<EventEmitter, Map<string, Function>>();
  private streams = new Set<NodeJS.ReadableStream | NodeJS.WritableStream>();

  /**
   * Register timer for cleanup
   */
  registerTimer(timer: NodeJS.Timeout): NodeJS.Timeout {
    this.timers.add(timer);
    return timer;
  }

  /**
   * Register interval for cleanup
   */
  registerInterval(interval: NodeJS.Timeout): NodeJS.Timeout {
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Register event listener for cleanup
   */
  registerListener(
    emitter: EventEmitter,
    event: string,
    listener: Function,
  ): void {
    if (!this.listeners.has(emitter)) {
      this.listeners.set(emitter, new Map());
    }
    this.listeners.get(emitter)!.set(event, listener);
  }

  /**
   * Register stream for cleanup
   */
  registerStream(
    stream: NodeJS.ReadableStream | NodeJS.WritableStream,
  ): void {
    this.streams.add(stream);
  }

  /**
   * Clear specific timer
   */
  clearTimer(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  /**
   * Clear specific interval
   */
  clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  /**
   * Remove specific listener
   */
  removeListener(
    emitter: EventEmitter,
    event: string,
    listener: Function,
  ): void {
    emitter.removeListener(event, listener as any);
    const listeners = this.listeners.get(emitter);
    if (listeners) {
      listeners.delete(event);
      if (listeners.size === 0) {
        this.listeners.delete(emitter);
      }
    }
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy() {
    this.logger.log('Cleaning up resources...');

    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();

    // Remove all listeners
    this.listeners.forEach((events, emitter) => {
      events.forEach((listener, event) => {
        emitter.removeListener(event, listener as any);
      });
    });
    this.listeners.clear();

    // Close all streams
    this.streams.forEach((stream) => {
      if ('destroy' in stream && typeof stream.destroy === 'function') {
        stream.destroy();
      }
    });
    this.streams.clear();

    this.logger.log('Cleanup complete');
  }

  /**
   * Get memory usage
   */
  getMemoryUsage(): ReturnType<typeof process.memoryUsage> {
    return process.memoryUsage();
  }

  /**
   * Monitor memory usage
   */
  monitorMemory(thresholdMB: number = 500): void {
    const intervalId = setInterval(() => {
      const usage = this.getMemoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);

      if (heapUsedMB > thresholdMB) {
        this.logger.warn(
          `High memory usage detected: ${heapUsedMB}MB (threshold: ${thresholdMB}MB)`,
          {
            heapUsed: heapUsedMB,
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
            external: Math.round(usage.external / 1024 / 1024),
            rss: Math.round(usage.rss / 1024 / 1024),
          },
        );

        // Force garbage collection if available
        if (global.gc) {
          this.logger.log('Running garbage collection...');
          global.gc();
        }
      }
    }, 30000); // Check every 30 seconds

    this.registerInterval(intervalId);
  }
}

/**
 * Decorator for automatic cleanup
 */
export function AutoCleanup() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const timers: NodeJS.Timeout[] = [];
      const intervals: NodeJS.Timeout[] = [];

      try {
        // Wrap setTimeout
        const originalSetTimeout = global.setTimeout;
        (global as any).setTimeout = function (...args: unknown[]) {
          const timer = originalSetTimeout(...args);
          timers.push(timer);
          return timer;
        };

        // Wrap setInterval
        const originalSetInterval = global.setInterval;
        (global as any).setInterval = function (...args: unknown[]) {
          const interval = originalSetInterval(...args);
          intervals.push(interval);
          return interval;
        };

        // Execute method
        return await originalMethod.apply(this, args);
      } finally {
        // Cleanup
        timers.forEach((timer) => clearTimeout(timer));
        intervals.forEach((interval) => clearInterval(interval));

        // Restore original functions
        global.setTimeout = setTimeout;
        global.setInterval = setInterval;
      }
    };

    return descriptor;
  };
}

/**
 * Example usage:
 *
 * constructor(private memoryService: MemoryLeakPreventionService) {
 *   // Start memory monitoring
 *   this.memoryService.monitorMemory(500); // Alert at 500MB
 * }
 *
 * // Register resources
 * const timer = this.memoryService.registerTimer(
 *   setTimeout(() => {}, 5000)
 * );
 *
 * const interval = this.memoryService.registerInterval(
 *   setInterval(() => {}, 1000)
 * );
 *
 * // Or use decorator
 * @AutoCleanup()
 * async processData() {
 *   // Any timers created here will be automatically cleaned up
 *   setTimeout(() => {}, 5000);
 *   setInterval(() => {}, 1000);
 * }
 */
