import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';


import * as crypto from 'crypto';


@Injectable()
export class CsrfRotationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Rotate CSRF token on every request
    const newToken = crypto.randomBytes(32).toString('hex');

    // Store in session if available
    if ((req as any).session) {
      (req as any).session.csrfToken = newToken;
    }

    res.setHeader('X-CSRF-Token', newToken);

    next();
  }
}
