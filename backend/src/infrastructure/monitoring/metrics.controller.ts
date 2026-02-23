import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Controller, Get, Header, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { AdminGuard } from "@common/guards/admin.guard";

import { MetricsService } from "./metrics.service";

// ============================================================================
// METRICS CONTROLLER
// ============================================================================
// Fix #89: Expose Prometheus-compatible metrics endpoint
// ============================================================================

@ApiTags("Monitoring")
@Controller("metrics")
@UseGuards(JwtAuthGuard, AdminGuard) // SECURITY FIX: require admin auth
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header("Content-Type", "text/plain; charset=utf-8")
  @ApiOperation({ summary: "Get Prometheus metrics" })
  @ApiResponse({
    status: 200,
    description: "Prometheus metrics in text format",
  })
  getMetrics(): string {
    return this.metricsService.getPrometheusMetrics();
  }
}
