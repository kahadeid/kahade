import { Injectable, OnModuleInit } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';



/**
 * Prometheus Metrics Collection (MEDIUM-008)
 *
 * Metrics:
 * - HTTP request duration
 * - HTTP request count
 * - Database query duration
 * - Cache hit rate
 * - Active connections
 * - Error rate
 * - Business metrics
 */

@Injectable()
export class PrometheusMetricsService implements OnModuleInit {
  private registry: Registry;

  // HTTP metrics
  private httpRequestDuration: Histogram;
  private httpRequestCount: Counter;
  private httpErrorCount: Counter;

  // Database metrics
  private dbQueryDuration: Histogram;
  private dbConnectionPoolSize: Gauge;
  private dbQueryCount: Counter;

  // Cache metrics
  private cacheHitCount: Counter;
  private cacheMissCount: Counter;

  // Application metrics
  private activeUsers: Gauge;
  private memoryUsage: Gauge;
  private cpuUsage: Gauge;

  // Business metrics
  private escrowCreated: Counter;
  private transactionAmount: Histogram;
  private walletBalance: Gauge;

  onModuleInit() {
    this.registry = new Registry();
    this.initializeMetrics();

    // Start collecting default metrics
    this.collectDefaultMetrics();
  }

  private _initializeMetrics() {
    // HTTP metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });

    this.httpRequestCount = new Counter({
      name: 'http_request_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
    });

    this.httpErrorCount = new Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status'],
    });

    // Database metrics
    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2],
    });

    this.dbConnectionPoolSize = new Gauge({
      name: 'db_connection_pool_size',
      help: 'Current database connection pool size',
      labelNames: ['state'], // 'active', 'idle'
    });

    this.dbQueryCount = new Counter({
      name: 'db_query_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table', 'status'],
    });

    // Cache metrics
    this.cacheHitCount = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_name'],
    });

    this.cacheMissCount = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_name'],
    });

    // Application metrics
    this.activeUsers = new Gauge({
      name: 'active_users',
      help: 'Number of currently active users',
    });

    this.memoryUsage = new Gauge({
      name: 'process_memory_usage_bytes',
      help: 'Process memory usage in bytes',
      labelNames: ['type'], // 'heap_used', 'heap_total', 'rss'
    });

    this.cpuUsage = new Gauge({
      name: 'process_cpu_usage_percent',
      help: 'Process CPU usage percentage',
    });

    // Business metrics
    this.escrowCreated = new Counter({
      name: 'escrow_created_total',
      help: 'Total number of escrows created',
      labelNames: ['status'],
    });

    this.transactionAmount = new Histogram({
      name: 'transaction_amount',
      help: 'Transaction amounts',
      labelNames: ['type'], // 'deposit', 'withdrawal', 'escrow'
      buckets: [1000, 10000, 50000, 100000, 500000, 1000000, 5000000],
    });

    this.walletBalance = new Gauge({
      name: 'wallet_balance_total',
      help: 'Total wallet balance across all users',
    });

    // Register all metrics
    this.registry.registerMetric(this.httpRequestDuration);
    this.registry.registerMetric(this.httpRequestCount);
    this.registry.registerMetric(this.httpErrorCount);
    this.registry.registerMetric(this.dbQueryDuration);
    this.registry.registerMetric(this.dbConnectionPoolSize);
    this.registry.registerMetric(this.dbQueryCount);
    this.registry.registerMetric(this.cacheHitCount);
    this.registry.registerMetric(this.cacheMissCount);
    this.registry.registerMetric(this.activeUsers);
    this.registry.registerMetric(this.memoryUsage);
    this.registry.registerMetric(this.cpuUsage);
    this.registry.registerMetric(this.escrowCreated);
    this.registry.registerMetric(this.transactionAmount);
    this.registry.registerMetric(this.walletBalance);
  }

  private _collectDefaultMetrics() {
    // Update memory usage every 10 seconds
    setInterval(() => {
      const usage = process.memoryUsage();
      this.memoryUsage.set({ type: 'heap_used' }, usage.heapUsed);
      this.memoryUsage.set({ type: 'heap_total' }, usage.heapTotal);
      this.memoryUsage.set({ type: 'rss' }, usage.rss);
    }, 10000);

    // Update CPU usage every 10 seconds
    setInterval(() => {
      const usage = process.cpuUsage();
      const percent = (usage.user + usage.system) / 1000000 / 10; // Rough estimate
      this.cpuUsage.set(percent);
    }, 10000);
  }

  // HTTP metric methods
  recordHttpRequest(
    method: string,
    route: string,
    status: number,
    duration: number,
  ) {
    this.httpRequestDuration
      .labels(method, route, status.toString())
      .observe(duration / 1000); // Convert to seconds

    this.httpRequestCount.labels(method, route, status.toString()).inc();

    if (status >= 400) {
      this.httpErrorCount.labels(method, route, status.toString()).inc();
    }
  }

  // Database metric methods
  recordDbQuery(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
  ) {
    this.dbQueryDuration.labels(operation, table).observe(duration / 1000);
    this.dbQueryCount
      .labels(operation, table, success ? 'success' : 'error')
      .inc();
  }

  setDbConnectionPoolSize(active: number, idle: number) {
    this.dbConnectionPoolSize.set({ state: 'active' }, active);
    this.dbConnectionPoolSize.set({ state: 'idle' }, idle);
  }

  // Cache metric methods
  recordCacheHit(cacheName: string) {
    this.cacheHitCount.labels(cacheName).inc();
  }

  recordCacheMiss(cacheName: string) {
    this.cacheMissCount.labels(cacheName).inc();
  }

  // Application metric methods
  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  // Business metric methods
  recordEscrowCreated(status: string) {
    this.escrowCreated.labels(status).inc();
  }

  recordTransaction(type: string, amount: number) {
    this.transactionAmount.labels(type).observe(amount);
  }

  setTotalWalletBalance(balance: number) {
    this.walletBalance.set(balance);
  }

  // Get metrics
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // Get registry
  getRegistry(): Registry {
    return this.registry;
  }
}

/**
 * Usage:
 *
 * // In middleware or interceptor
 * const start = Date.now();
 * // ... handle request
 * const duration = Date.now() - start;
 * this.metricsService.recordHttpRequest('GET', '/api/users', 200, duration);
 *
 * // In database service
 * const start = Date.now();
 * try {
 *   const result = await prisma.user.findMany();
 *   const duration = Date.now() - start;
 *   this.metricsService.recordDbQuery('findMany', 'user', duration, true);
 *   return result;
 * } catch (error) {
 *   const duration = Date.now() - start;
 *   this.metricsService.recordDbQuery('findMany', 'user', duration, false);
 *   throw error;
 * }
 *
 * // Metrics endpoint (in controller)
 * @Get('metrics')
 * async getMetrics(@Res() res: Response) {
 *   res.set('Content-Type', this.metricsService.getRegistry().contentType);
 *   const metrics = await this.metricsService.getMetrics();
 *   res.send(metrics);
 * }
 *
 * // Prometheus scrape config:
 * scrape_configs:
 *   - job_name: 'kahade-api'
 *     static_configs:
 *       - targets: ['localhost:3000']
 *     metrics_path: '/metrics'
 *     scrape_interval: 15s
 */
