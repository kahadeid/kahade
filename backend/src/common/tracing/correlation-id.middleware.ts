import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';



/**
 * Distributed Tracing with Correlation IDs (HIGH-026)
 *
 * Features:
 * - Correlation ID generation/propagation
 * - Request flow tracking
 * - Microservice tracing
 * - Log aggregation support
 * - Performance profiling
 *
 * Headers:
 * - X-Correlation-ID: Unique ID for request flow
 * - X-Request-ID: Unique ID for this specific request
 */

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Get or generate correlation ID
    // This ID follows the request across multiple services
    let correlationId = req.headers['x-correlation-id'] as string;
    if (!correlationId) {
      correlationId = `corr_${nanoid(21)}`;
    }

    // Get or generate request ID
    // This ID is unique to this specific request
    let requestId = req.headers['x-request-id'] as string;
    if (!requestId) {
      requestId = `req_${nanoid(21)}`;
    }

    // Attach to request object
    (req as any).correlationId = correlationId;
    (req as any).requestId = requestId;

    // Add to response headers
    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('X-Request-ID', requestId);

    // Store in async local storage for access anywhere
    // NOTE: Implement AsyncLocalStorage for Node.js - Tracked in backlog

    next();
  }
}

/**
 * Get correlation ID from request
 */
export function getCorrelationId(req: Request): string {
  return (req as any).correlationId || 'unknown';
}

/**
 * Get request ID from request
 */
export function getRequestId(req: Request): string {
  return (req as any).requestId || 'unknown';
}
