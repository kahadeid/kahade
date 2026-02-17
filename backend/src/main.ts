import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { AppModule } from './app.module';


import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';


const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bodyParser: true,
  });

  const configService = app.get(ConfigService);
  const NODE_ENV = configService.get<string>('NODE_ENV') || 'development';

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
    }),
  );

  // Compression
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
    }),
  );

  // Cookie Parser - SECURITY FIX: No fallback in production
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  if (!cookieSecret) {
    throw new Error(
      'COOKIE_SECRET environment variable is required. ' +
      'Generate a secure secret using: openssl rand -base64 32'
    );
  }
  app.use(cookieParser(cookieSecret));

  // CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(',').map((origin: string) => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5001'];

  if (NODE_ENV === 'production' && allowedOrigins.includes('*')) {
    logger.error('❌ CRITICAL: Wildcard (*) CORS origin detected in production!');
    process.exit(1);
  }

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (NODE_ENV === 'development') {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS: Blocked origin ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID',
      'X-Idempotency-Key',
    ],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: NODE_ENV === 'production',
      stopAtFirstError: false,
    }),
  );

  // NOTE: Global Exception Filters are registered via APP_FILTER in app.module.ts
  // Using NestJS Dependency Injection (supports constructor injection like ConfigService).
  // Do NOT call app.useGlobalFilters() here to avoid double-processing.

  // API Prefix - MUST be set BEFORE enableVersioning
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // API Versioning - comes AFTER setGlobalPrefix
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const PORT = parseInt(configService.get<string>('PORT') || '3000', 10);

  // Swagger Documentation (never in production unless explicitly enabled)
  const enableSwagger = configService.get<string>('ENABLE_SWAGGER');
  if (enableSwagger === 'true' && NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Kahade API')
      .setDescription('Bank-Grade P2P Escrow Platform API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`📚 Swagger: http://localhost:${PORT}/${apiPrefix}/docs`);
  }

  app.enableShutdownHooks();

  const gracefulShutdown = async (signal: string) => {
    logger.log(`\n🛑 Received ${signal}. Shutting down...`);
    try {
      await app.close();
      logger.log('✅ Shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Shutdown error:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  await app.listen(PORT, '0.0.0.0');

  logger.log(`🚀 Application: http://localhost:${PORT}/${apiPrefix}/v1`);
  logger.log(`🔒 Security headers enabled`);
  logger.log(`🌍 Environment: ${NODE_ENV}`);
  logger.log(`❤️  Health: http://localhost:${PORT}/${apiPrefix}/v1/health`);
}

bootstrap().catch((error) => {
  logger.error('❌ Failed to start:', error);
  process.exit(1);
});
