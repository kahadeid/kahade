import { ConfigService } from '@nestjs/config';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';



export class WsAuthAdapter extends IoAdapter {
  private readonly logger = new Logger(WsAuthAdapter.name);

  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any): Server {
    const corsOrigin = this.configService.get('CORS_ORIGIN');
    const allowedOrigins = corsOrigin
      ? corsOrigin.split(',').map((origin: string) => origin.trim())
      : ['http://localhost:3000'];

    const serverOptions: any = {
      ...options,
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    };

    const server = super.createIOServer(port, serverOptions);

    server.use(async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

        if (!token) {
          return next(new Error('Authentication token missing'));
        }

        const bearerToken = token.startsWith('Bearer ')
          ? token.substring(7)
          : token;

        const payload = this.jwtService.verify(bearerToken);
        (socket as any).user = payload;

        next();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        this.logger.error('WebSocket authentication failed:', errorMessage);
        next(new Error('Invalid authentication token'));
      }
    });

    server.on('connection', (socket: Socket) => {
      this.logger.log(`Client connected: ${socket.id}`);

      socket.on('disconnect', (reason: string) => {
        this.logger.log(`Client disconnected: ${socket.id} - ${reason}`);
      });
    });

    return server;
  }
}
