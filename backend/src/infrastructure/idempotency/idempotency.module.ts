import { Module, Global } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { IdempotencyService } from './idempotency.service';



@Global()
@Module({
  imports: [CacheModule],
  providers: [IdempotencyService],
  exports: [IdempotencyService],
})
export class IdempotencyModule {}
