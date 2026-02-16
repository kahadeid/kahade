import { Reflector } from '@nestjs/core';
import { IDEMPOTENT_KEY, IdempotencyOptions } from '../decorators/idempotent.decorator';
import { IdempotencyService } from '../../infrastructure/idempotency/idempotency.service';


import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';

/**
 * Guard that enforces idempotency key requirement
 * and checks for duplicate requests
 */
@Injectable()
export class IdempotencyGuard implements CanActivate {
  private readonly logger = new Logger(IdempotencyGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if endpoint requires idempotency
    const options = this.reflector.get<IdempotencyOptions>(
      IDEMPOTENT_KEY,
      context.getHandler(),
    );

    if (!options) {
      // No idempotency required
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const idempotencyKey = request.headers['x-idempotency-key'];

    // Check if idempotency key is provided
    if (!idempotencyKey) {
      if (options.required) {
        this.logger.warn(
          `Missing idempotency key for ${request.method} ${request.url}`,
        );
        throw new BadRequestException(
          'X-Idempotency-Key header is required for this operation',
        );
      }
      return true;
    }

    // Validate idempotency key format
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 16) {
      throw new BadRequestException(
        'X-Idempotency-Key must be at least 16 characters',
      );
    }

    const userId = request.user?.id || 'anonymous';
    const method = request.method;
    const url = request.url;

    this.logger.debug(
      `Idempotency check: key=${idempotencyKey}, user=${userId}, ${method} ${url}`,
    );

    // Check if request is being processed
    const isProcessing = await this.idempotencyService.isProcessing(
      idempotencyKey,
      userId,
    );

    if (isProcessing) {
      this.logger.warn(
        `Duplicate request detected (processing): key=${idempotencyKey}`,
      );
      throw new ConflictException(
        'Request is currently being processed. Please wait.',
      );
    }

    // Check for cached response
    const cachedResponse = await this.idempotencyService.getCachedResponse(
      idempotencyKey,
      userId,
    );

    if (cachedResponse) {
      this.logger.log(
        `Returning cached response: key=${idempotencyKey}, status=${cachedResponse.statusCode}`,
      );

      // Return cached response
      response.status(cachedResponse.statusCode).json(cachedResponse.data);
      return false; // Prevent handler execution
    }

    // Mark request as processing
    await this.idempotencyService.markProcessing(
      idempotencyKey,
      userId,
      options.ttl || 86400,
    );

    // Store idempotency info in request for interceptor
    request.idempotency = {
      key: idempotencyKey,
      userId,
      ttl: options.ttl || 86400,
    };

    return true; // Allow handler execution
  }
}
