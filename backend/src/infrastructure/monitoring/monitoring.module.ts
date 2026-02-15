import { Module, Global } from "@nestjs/common";

import { MetricsController } from "./metrics.controller";
import { MetricsService } from "./metrics.service";

// ============================================================================
// MONITORING MODULE
// ============================================================================
// Exposes Prometheus-compatible metrics endpoint.
//
// NOTE: Do NOT register HealthController here.
//       The comprehensive health check is provided by:
//         src/api/health/health.module.ts (uses @nestjs/terminus)
//       which is registered in AppModule and resolves to /api/v1/health.
//
//       infrastructure/monitoring/health.controller.ts is a legacy stub
//       and must NOT be registered to avoid route conflicts.
// ============================================================================

@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MonitoringModule {}
