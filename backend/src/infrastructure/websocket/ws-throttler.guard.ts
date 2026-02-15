import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { WsException } from '@nestjs/websockets';


@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    try {
      return await super.handleRequest(requestProps);
    } catch (error) {
      throw new WsException('Too many requests');
    }
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id || req.ip || req.handshake?.address || 'anonymous';
  }
}
