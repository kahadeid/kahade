import { Module } from "@nestjs/common";

import { AuthModule } from "@core/auth/auth.module";
import { CacheModule } from "@infrastructure/cache/cache.module";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [CacheModule, AuthModule],
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class GuardsModule {}
