import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';



@Injectable()
export class RateLimitHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userId = (req as any).user?.id;

    if (userId) {
      res.setHeader('X-RateLimit-User', userId);
    }

    next();
  }
}
