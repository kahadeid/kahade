import { Module, Global } from "@nestjs/common";

import {
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";
import { PrismaExceptionFilter } from "./filters/prisma-exception.filter";
import { TimeoutInterceptor } from "./interceptors/timeout.interceptor";
import { TransformInterceptor } from "./interceptors/transform.interceptor";

  APP_FILTER,
  APP_INTERCEPTOR,
} from "@nestjs/core";

// Filters

// Interceptors

/**
 * Common Module
 *
 * Single source of truth for global NestJS providers:
 * - Exception filters (HTTP, Prisma)
 * - Response transformation interceptors
 * - Logging interceptor
 *
 * NOTE: ValidationPipe is registered in main.ts via app.useGlobalPipes()
 *       with full options (whitelist, forbidNonWhitelisted, transform, etc).
 *       Do NOT register APP_PIPE here – the custom ValidationPipe in
 *       common/pipes/validation.pipe.ts does not support those options,
 *       and double-registering would run validation twice.
 *
 * NOTE: ThrottlerGuard (APP_GUARD) lives in app.module.ts because it
 *       requires ThrottlerModule to be imported first.
 */
@Global()
@Module({
  providers: [
    // Global exception filters
    // Last registered = outermost wrapper (processes errors first)
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter, // inner
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,   // outer (handles everything incl. re-throws from Prisma filter)
    },

    // Global interceptors (executed in registration order, outermost first)
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,    // outermost – logs all requests
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,  // wraps responses in standard envelope
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,    // innermost – handles request timeouts
    },
  ],
  exports: [],
})
export class CommonModule {}
