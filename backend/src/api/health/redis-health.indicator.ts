import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';


import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const testKey = 'health-check-test';
      const testValue = Date.now().toString();

      await this.cacheManager.set(testKey, testValue, 10);
      const retrieved = await this.cacheManager.get(testKey);

      if (retrieved === testValue) {
        return this.getStatus(key, true, {
          message: 'Redis is healthy',
        });
      }

      throw new Error('Failed to retrieve test value');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError(
        'Redis health check failed',
        this.getStatus(key, false, {
          message: `Redis is unhealthy: ${errorMessage}`,
        }),
      );
    }
  }
}
