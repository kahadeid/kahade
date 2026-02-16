import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisFallbackService } from './redis-fallback.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        const ttl = 3600; // 1 hour default

        // Use simple memory cache configuration
        return {
          ttl: ttl * 1000, // Convert to milliseconds
          max: 100, // Maximum number of items in cache
        };
      },
    }),
  ],
  providers: [
    CacheService,           // ✅ ADDED - Required by controllers/services
    RedisFallbackService,
  ],
  exports: [
    NestCacheModule,
    CacheService,           // ✅ ADDED - Export for DI
    RedisFallbackService,
  ],
})
export class CacheModule {}
