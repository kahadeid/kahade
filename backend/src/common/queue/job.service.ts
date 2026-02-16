import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';



/**
 * Background Job Processing (HIGH-041)
 *
 * Features:
 * - Queue-based processing
 * - Job retry logic
 * - Job scheduling
 * - Progress tracking
 * - Dead letter queue
 */

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry',
}

export interface Job<T = any> {
  id: string;
  type: string;
  data: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
}

export interface JobOptions {
  priority?: number;
  maxAttempts?: number;
  delay?: number;
  timeout?: number;
}

@Injectable()
export class JobService extends (EventEmitter as new () => EventEmitter) {
  private readonly logger = new Logger(JobService.name);
  private jobs = new Map<string, Job>();
  private queue: Job[] = [];
  private processing = false;
  private deadLetterQueue: Job[] = [];

  constructor() {
    super();
    this.startProcessing();
  }

  /**
   * Add job to queue
   */
  async addJob<T>(
    type: string,
    data: T,
    options: JobOptions = {},
  ): Promise<string> {
    const job: Job<T> = {
      id: this.generateJobId(),
      type,
      data,
      status: JobStatus.PENDING,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      priority: options.priority || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(job.id, job);

    // Add to queue with delay if specified
    if (options.delay) {
      setTimeout(() => {
        this.queue.push(job);
        this.sortQueue();
        this.emit('job:added', job);
      }, options.delay);
    } else {
      this.queue.push(job);
      this.sortQueue();
      this.emit('job:added', job);
    }

    this.logger.log(`Job added: ${job.id} (${type})`);
    return job.id;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): JobStatus | undefined {
    return this.jobs.get(jobId)?.status;
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get dead letter queue
   */
  getDeadLetterQueue(): Job[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Register job handler
   */
  registerHandler(
    type: string,
    handler: (data: unknown) => Promise<any>,
  ): void {
    this.on(`job:process:${type}`, handler);
  }

  /**
   * Start processing queue
   */
  private startProcessing(): void {
    setInterval(() => {
      this.processNextJob();
    }, 100);
  }

  /**
   * Process next job in queue
   */
  private async processNextJob(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    const job = this.queue.shift()!
    job.status = JobStatus.PROCESSING;
    job.attempts++;
    job.processedAt = new Date();
    job.updatedAt = new Date();

    this.logger.log(
      `Processing job: ${job.id} (${job.type}) - Attempt ${job.attempts}/${job.maxAttempts}`,
    );

    try {
      // Emit job processing event
      const result = await this.processJob(job);

      // Job completed
      job.status = JobStatus.COMPLETED;
      job.result = result;
      job.completedAt = new Date();
      job.updatedAt = new Date();

      this.emit('job:completed', job);
      this.logger.log(`Job completed: ${job.id} (${job.type})`);
    } catch (error) {
      // Job failed
      job.error = error.message;
      job.updatedAt = new Date();

      if (job.attempts < job.maxAttempts) {
        // Retry
        job.status = JobStatus.RETRY;
        this.queue.push(job);
        this.sortQueue();

        this.logger.warn(
          `Job retry: ${job.id} (${job.type}) - Attempt ${job.attempts}/${job.maxAttempts}`,
        );
        this.emit('job:retry', job);
      } else {
        // Move to dead letter queue
        job.status = JobStatus.FAILED;
        this.deadLetterQueue.push(job);

        this.logger.error(
          `Job failed: ${job.id} (${job.type}) - ${error.message}`,
        );
        this.emit('job:failed', job);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process job
   */
  private async processJob(job: Job): Promise<any> {
    return new Promise((resolve, reject) => {
      const listeners = this.listeners(`job:process:${job.type}`);

      if (listeners.length === 0) {
        reject(new Error(`No handler registered for job type: ${job.type}`));
        return;
      }

      const handler = listeners[0] as (data: unknown) => Promise<any>;
      handler(job.data)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Sort queue by priority
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Example usage:
 *
 * @Injectable()
 * export class EmailService {
 *   constructor(private jobService: JobService) {
 *     // Register handlers
 *     this.jobService.registerHandler('send-email', this.sendEmail.bind(this));
 *     this.jobService.registerHandler('send-bulk-email', this.sendBulkEmail.bind(this));
 *   }
 *
 *   async queueEmail(to: string, subject: string, body: string) {
 *     const jobId = await this.jobService.addJob(
 *       'send-email',
 *       { to, subject, body },
 *       { priority: 1, maxAttempts: 3 }
 *     );
 *     return jobId;
 *   }
 *
 *   private async sendEmail(data: unknown) {
 *     // Send email logic
 *     await this.mailer.send(data);
 *     return { sent: true };
 *   }
 *
 *   async getJobStatus(jobId: string) {
 *     return this.jobService.getJobStatus(jobId);
 *   }
 * }
 */
