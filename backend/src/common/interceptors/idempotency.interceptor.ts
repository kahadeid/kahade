import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { Request } from 'express';
import { tap } from 'rxjs/operators';


import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);
  private readonly TTL = 3600; // 1 hour

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const idempotencyKey = request.headers['x-idempotency-key'] as string;

    // Skip if no idempotency key provided
    if (!idempotencyKey) {
      return next.handle();
    }

    // Check if request with this key was already processed
    const cachedResponse = await this.cacheManager.get(idempotencyKey);
    if (cachedResponse) {
      this.logger.log(`Returning cached response for key: ${idempotencyKey}`);
      return of(cachedResponse);
    }

    // Process the request and cache the response
    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.cacheManager.set(idempotencyKey, response, this.TTL * 1000);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorStack = error instanceof Error ? error.stack : undefined;
          this.logger.error(
            `Failed to cache response: ${errorMessage}`,
            errorStack,
          );
        }
      }),
    );
  }
}
