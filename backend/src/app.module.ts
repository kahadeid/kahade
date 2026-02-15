import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";

import appConfig from "./config/app.config";
import databaseConfig from "./config/database.config";
import emailConfig from "./config/email.config";
import jwtConfig from "./config/jwt.config";
import paymentConfig from "./config/payment.config";
import queueConfig from "./config/queue.config";
import redisConfig from "./config/redis.config";
import securityConfig from "./config/security.config";
import smsConfig from "./config/sms.config";

import { ActivityModule } from "./core/activity/activity.module";
import { AdminModule } from "./core/admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./core/auth/auth.module";
import { BadgeModule } from "./core/badge/badge.module";
import { BankModule } from "./core/bank/bank.module";
import { BankVerificationModule } from "./integrations/bank-verification/bank-verification.module";
import { CacheModule } from "./infrastructure/cache/cache.module";
import { CommonModule } from "./common/common.module";
import { CorePaymentModule } from "./core/payment/payment.module";
import { CronJobsModule } from "./jobs/cron/cron-jobs.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { DeliveryModule } from "./core/delivery/delivery.module";
import { DisputeModule } from "./core/dispute/dispute.module";
import { EmailModule } from "./integrations/email/email.module";
import { EncryptionModule } from "./infrastructure/encryption/encryption.module";
import { EscrowModule } from "./core/escrow/escrow.module";
import { EventModule } from "./infrastructure/events/event.module";
import { FraudModule } from "./core/fraud/fraud.module";
import { HealthModule } from "./api/health/health.module";
import { JobsModule } from "./jobs/jobs.module";
import { KycModule } from "./core/kyc/kyc.module";
import { KycProviderModule } from "./integrations/kyc-provider/kyc-provider.module";
import { LedgerModule } from "./core/ledger/ledger.module";
import { MessagingModule } from "./core/messaging/messaging.module";
import { MonitoringModule } from "./infrastructure/monitoring/monitoring.module";
import { NotificationModule } from "./core/notification/notification.module";
import { OrderModule } from "./core/order/order.module";
import { PaymentGatewayModule } from "./integrations/payment-gateway/payment-gateway.module";
import { PaymentModule as IntegrationPaymentModule } from "./integrations/payment/payment.module";
import { PromoModule } from "./core/promo/promo.module";
import { PushNotificationModule } from "./core/notification/push/push-notification.module";
import { QueueModule } from "./infrastructure/queue/queue.module";
import { RatingModule } from "./core/rating/rating.module";
import { ReferralModule } from "./core/referral/referral.module";
import { SecurityModule } from "./security/security.module";
import { SmsModule } from "./integrations/sms/sms.module";
import { StorageModule } from "./infrastructure/storage/storage.module";
import { SupportModule } from "./core/support/support.module";
import { TransactionModule } from "./core/transaction/transaction.module";
import { UserModule } from "./core/user/user.module";
import { WalletModule } from "./core/wallet/wallet.module";
import { WebhookModule } from "./api/webhooks/webhook.module";
import { WithdrawalModule } from "./core/withdrawal/withdrawal.module";
import { envValidationSchema } from "./config/env.validation";

// Configuration

// Infrastructure

// Core Modules

// New Feature Modules

// Integration Modules

// API Modules

// Security Module

// Jobs

// Common (registers global filters, interceptors, pipes via APP_*)

@Module({
  imports: [
    // Configuration with Joi validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        redisConfig,
        emailConfig,
        paymentConfig,
        queueConfig,
        smsConfig,
        securityConfig,  // CRITICAL: security.jwt.*, security.csrf.*, security.bruteForce.*
      ],
      envFilePath: [`.env.${process.env.NODE_ENV || "development"}`, ".env"],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>("app.rateLimit.ttl") || 60,
            limit: config.get<number>("app.rateLimit.limit") || 100,
          },
        ],
      }),
    }),

    // Infrastructure
    DatabaseModule,
    CacheModule,
    QueueModule,
    StorageModule,
    EncryptionModule,
    EventModule,
    MonitoringModule,

    // Common Module - registers global APP_FILTER, APP_INTERCEPTOR, APP_PIPE
    CommonModule,

    // Security Module
    SecurityModule,

    // Core Modules
    ActivityModule,
    AdminModule,
    AuthModule,
    BankModule,
    DeliveryModule,
    DisputeModule,
    EscrowModule,
    KycModule,
    LedgerModule,
    NotificationModule,
    OrderModule,
    CorePaymentModule,
    PromoModule,
    RatingModule,
    ReferralModule,
    TransactionModule,
    UserModule,
    WalletModule,
    WithdrawalModule,

    // New Feature Modules
    MessagingModule,
    BadgeModule,
    FraudModule,
    SupportModule,
    PushNotificationModule,

    // Integration Modules
    IntegrationPaymentModule,
    EmailModule,
    SmsModule,
    BankVerificationModule,
    KycProviderModule,
    PaymentGatewayModule,

    // API Modules
    WebhookModule,
    HealthModule,

    // Jobs & Cron
    JobsModule,
    CronJobsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // NOTE: APP_FILTER (HttpExceptionFilter, PrismaExceptionFilter),
    //        APP_INTERCEPTOR (TransformInterceptor, TimeoutInterceptor),
    //        APP_PIPE (ValidationPipe)
    //        are all registered in CommonModule to avoid duplication.
    //
    // NOTE: main.ts does NOT call useGlobalFilters/useGlobalPipes either.
    //       CommonModule is the single source of truth for global providers.

    // Global rate limiting guard (only here, not in CommonModule)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {
    // Middleware configuration handled by SecurityModule
  }
}
