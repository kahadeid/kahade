import { Injectable } , Logger from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry } from 'prom-client';



/**
 * Prometheus Metrics Service
 * Exposes business and technical metrics
 *
 * Metrics:
 * - Request duration
 * - Active orders
 * - Payment success rate
 * - User registrations
 * - Error rates
 *
 * @see Issue #72 M-008: Missing Prometheus Metrics
 */
@Injectable()
export class PrometheusService {
  public readonly registry: Registry;

  // HTTP Metrics
  public httpRequestDuration: Histogram;
  public httpRequestTotal: Counter;
  public httpErrorTotal: Counter;

  // Business Metrics
  public activeOrders: Gauge;
  public completedOrders: Counter;
  public userRegistrations: Counter;
  public paymentAttempts: Counter;
  public paymentSuccesses: Counter;
  public paymentFailures: Counter;
  public disputesOpened: Counter;
  public withdrawalRequests: Counter;

  // System Metrics
  public databaseConnections: Gauge;
  public redisConnections: Gauge;
  public cacheHits: Counter;
  public cacheMisses: Counter;

  constructor(, private readonly logger: Logger) {
    this.registry = new Registry();

    // HTTP Metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpErrorTotal = new Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    // Business Metrics
    this.activeOrders = new Gauge({
      name: 'kahade_active_orders',
      help: 'Number of currently active orders',
      registers: [this.registry],
    });

    this.completedOrders = new Counter({
      name: 'kahade_completed_orders_total',
      help: 'Total number of completed orders',
      registers: [this.registry],
    });

    this.userRegistrations = new Counter({
      name: 'kahade_user_registrations_total',
      help: 'Total number of user registrations',
      registers: [this.registry],
    });

    this.paymentAttempts = new Counter({
      name: 'kahade_payment_attempts_total',
      help: 'Total payment attempts',
      labelNames: ['gateway'],
      registers: [this.registry],
    });

    this.paymentSuccesses = new Counter({
      name: 'kahade_payment_successes_total',
      help: 'Total successful payments',
      labelNames: ['gateway'],
      registers: [this.registry],
    });

    this.paymentFailures = new Counter({
      name: 'kahade_payment_failures_total',
      help: 'Total failed payments',
      labelNames: ['gateway', 'reason'],
      registers: [this.registry],
    });

    this.disputesOpened = new Counter({
      name: 'kahade_disputes_opened_total',
      help: 'Total disputes opened',
      registers: [this.registry],
    });

    this.withdrawalRequests = new Counter({
      name: 'kahade_withdrawal_requests_total',
      help: 'Total withdrawal requests',
      labelNames: ['status'],
      registers: [this.registry],
    });

    // System Metrics
    this.databaseConnections = new Gauge({
      name: 'kahade_database_connections',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    this.redisConnections = new Gauge({
      name: 'kahade_redis_connections',
      help: 'Number of active Redis connections',
      registers: [this.registry],
    });

    this.cacheHits = new Counter({
      name: 'kahade_cache_hits_total',
      help: 'Total cache hits',
      registers: [this.registry],
    });

    this.cacheMisses = new Counter({
      name: 'kahade_cache_misses_total',
      help: 'Total cache misses',
      registers: [this.registry],
    });
  }

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get metrics as JSON
   */
  async getMetricsJSON(): Promise<any> {
    return this.registry.getMetricsAsJSON();
  }
}
