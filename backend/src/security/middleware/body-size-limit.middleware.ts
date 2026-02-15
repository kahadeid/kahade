import { Injectable, NestMiddleware, PayloadTooLargeException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';



@Injectable()
export class BodySizeLimitMiddleware implements NestMiddleware {
  private readonly MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB

  use(req: Request, _res: Response, next: NextFunction) {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > this.MAX_BODY_SIZE) {
      throw new PayloadTooLargeException(
        `Request body size ${contentLength} exceeds maximum ${this.MAX_BODY_SIZE}`
      );
    }

    let receivedBytes = 0;

    req.on('data', (chunk: Buffer) => {
      receivedBytes += chunk.length;
      if (receivedBytes > this.MAX_BODY_SIZE) {
        req.destroy();
        throw new PayloadTooLargeException('Request body too large');
      }
    });

    next();
  }
}
