import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "@core/auth/auth.module";
import { BodySizeLimitMiddleware } from "./middleware/body-size-limit.middleware";
import { CsrfMiddleware } from "./middleware/csrf.middleware";
import { DatabaseModule } from "@infrastructure/database/database.module";
import { EncryptionService } from "./encryption.service";
import { RequestIdMiddleware } from "./middleware/request-id.middleware";
import {
  Module,
  Global,
  MiddlewareConsumer,
  NestModule,
  Type,
  NestMiddleware,
} from "@nestjs/common";

// Audit

// Auth - Required for MfaGuard to inject MfaService

// Middleware

// Encryption

/**
 * Security Module
 *
 * Central module for all security-related functionality:
 * - Authentication strategies (JWT, Local) — registered in AuthModule
 * - Audit logging
 * - Security middleware (CSRF, Request ID, Body Size Limit)
 * - Encryption services
 *
 * NOTE: JwtStrategy and LocalStrategy are NOT registered here.
 *       The real implementations live in core/auth/strategies/ and are
 *       provided by AuthModule. The placeholder files in security/strategies/
 *       are NOT used to avoid Passport strategy name conflicts.
 *
 * NOTE: This module imports AuthModule to re-export it so that MfaService
 *       is available for injection across all modules that import SecurityModule.
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuditModule,
    AuthModule, // Required for MfaGuard to inject MfaService
  ],
  providers: [
    // Services
    EncryptionService,
  ],
  exports: [
    AuditModule,
    AuthModule, // Re-export to make MfaService available to other modules
    EncryptionService,
  ],
})
export class SecurityModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const csrfEnabled =
      this.configService.get<boolean>("security.csrf.enabled") !== false;
    const middlewares: Array<Type<NestMiddleware>> = [
      RequestIdMiddleware,
      BodySizeLimitMiddleware,
    ];

    if (csrfEnabled) {
      middlewares.push(CsrfMiddleware);
    }

    // Apply security middleware to all routes
    consumer.apply(...middlewares).forRoutes("*");
  }
}
