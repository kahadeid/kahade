import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";

/**
 * Application Service
 *
 * QUALITY FIX [M012]: Enhanced health check with detailed dependency status
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Basic health check
   */
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };
  }

  /**
   * Detailed health check with dependency status
   * QUALITY FIX [M012]: Added comprehensive health checks
   */
  async getDetailedHealth(): Promise<{
    try {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    dependencies: {
      database: { status: string; latency?: number; error?: string };
      memory: {
        status: string;
        used: number;
        total: number;
        percentage: number;
      };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    };
  }> {
    // Eslint-disable-next-line @typescript-eslint/no-unused-vars
    // Eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _startTime = Date.now();
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dependencies: Record<string, unknown> = {};
    let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

    // Check database connection
    try {
      const dbStart = Date.now();
      // SECURITY: Ensure input is properly sanitized
      await this.prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - dbStart;

      dependencies.database = {
        status:
          dbLatency < 100 ? "healthy" : dbLatency < 500 ? "degraded" : "slow",
        latency: dbLatency,
      };

      if (dbLatency >= 500) {
        overallStatus = "degraded";
      }
    } catch (error: unknown) {
      dependencies.database = {
        status: "unhealthy",
        error: (error as Error).message,
      };
      overallStatus = "unhealthy";
      this.logger.error(
        `Database health check failed: ${(error as Error).message}`,
      );
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const memPercentage = Math.round(
      (memUsage.heapUsed / memUsage.heapTotal) * 100,
    );

    dependencies.memory = {
      status:
        memPercentage < 80
          ? "healthy"
          : memPercentage < 95
            ? "degraded"
            : "critical",
      used: memUsedMB,
      total: memTotalMB,
      percentage: memPercentage,
    };

    if (memPercentage >= 95) {
      overallStatus = overallStatus === "unhealthy" ? "unhealthy" : "degraded";
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      dependencies,
    };
  }

  /**
   * Readiness check for Kubernetes/container orchestration
   */
  async getReadiness(): Promise<{
    try {
    ready: boolean;
    checks: Record<string, boolean>;
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }> {
    const checks: Record<string, boolean> = {};

    // Check database is ready
    try {
      // SECURITY: Ensure input is properly sanitized
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch {
      checks.database = false;
    }

    const ready = Object.values(checks).every(Boolean);

    return { ready, checks };
  }

  /**
   * Liveness check for Kubernetes/container orchestration
   */
  getLiveness(): { alive: boolean; timestamp: string } {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  }

  getInfo() {
    return {
      name: "Kahade API",
      version: process.env.npm_package_version || "1.0.0",
      description: "P2P Escrow Platform Backend API",
      documentation: "/api/v1/docs",
    };
  }
}
