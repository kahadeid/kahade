import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';



/**
 * WebSocket JWT Guard
 * Verifies that socket connection has valid authentication
 *
 * Usage:
 * ```typescript
 * @SubscribeMessage('sensitive:action')
 * @UseGuards(WsJwtGuard)
 * handleSensitiveAction(@ConnectedSocket() client: Socket) {
 *   // User is authenticated
 * }
 * ```
 *
 * @see Issue #64 - No WebSocket Authentication
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const user = client.data.user;

    if (!user || !client.data.userId) {
      throw new WsException('Unauthorized access');
    }

    return true;
  }
}

/**
 * WebSocket Admin Guard
 * Restricts access to admin-only WebSocket endpoints
 */
@Injectable()
export class WsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const role = client.data.role;

    if (role !== 'ADMIN') {
      throw new WsException('Admin access required');
    }

    return true;
  }
}
