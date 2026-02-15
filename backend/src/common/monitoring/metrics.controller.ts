import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '@common/guards/admin.guard';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PerformanceService } from './performance.service';



/**
 * Metrics Controller (HIGH-024, HIGH-027)
 *
 * Exposes performance metrics for monitoring:
 * - Prometheus format (for Prometheus/Grafana)
 * - JSON format (for custom dashboards)
 * - Performance summary
 *
 * Protected: Only admins can access metrics
 */

@ApiTags('Monitoring')
@Controller({ path: 'metrics', version: '1' })
export class MetricsController {
  constructor(private readonly performanceService: PerformanceService) {}

  /**
   * Get metrics in Prometheus format
   * Access: Admin only
   */
  @Get('prometheus')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get metrics in Prometheus format',
    description: 'Returns all metrics in Prometheus format for scraping',
  })
  async getPrometheusMetrics(): Promise<string> {
    return this.performanceService.getMetricsAsPrometheus();
  }

  /**
   * Get metrics as JSON
   * Access: Admin only
   */
  @Get('json')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get metrics as JSON',
    description: 'Returns all metrics as JSON for custom dashboards',
  })
  async getJsonMetrics(): Promise<Record<string, unknown>> {
    return this.performanceService.getMetricsAsJson();
  }

  /**
   * Get performance summary
   * Access: Admin only
   */
  @Get('summary')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get performance summary',
    description: 'Returns a high-level performance summary',
  })
  async getPerformanceSummary(): Promise<Record<string, unknown>> {
    return this.performanceService.getSummary();
  }
}
