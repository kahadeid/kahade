import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';


import {

  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // SECURITY: Ensure input is properly sanitized
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true, {
        message: 'Database is healthy',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError(
        'Prisma health check failed',
        this.getStatus(key, false, {
          message: `Database is unhealthy: ${errorMessage}`,
        }),
      );
    }
  }
}
