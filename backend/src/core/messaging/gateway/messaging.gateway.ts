import { JwtService } from "@nestjs/jwt";
import { Logger } from "@nestjs/common";

import { MessagingService } from "../messaging.service";
import { Server } from "socket.io";
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
// Eslint-disable-next-line @typescript-eslint/no-unused-vars
// Eslint-disable-next-line @typescript-eslint/no-unused-vars
// Eslint-disable-next-line @typescript-eslint/no-unused-vars

interface AuthenticatedSocket {
  userId?: string;
  id: string;
  handshake: {
    auth?: { token?: string };
    headers?: { authorization?: string };
  };
  join: (room: string) => void;
  leave: (room: string) => void;
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  to: (room: string) => { emit: (event: string, data: unknown) => void };
  disconnect: () => void;
}

@WebSocketGateway({
  namespace: "/messaging",
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagingService: MessagingService,
  ) {}

  // ============================================================================
  // CONNECTION HANDLING
  // ============================================================================

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify token
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;

      // Track user socket
      const userId = client.userId;
      if (!userId) {
        client.disconnect();
        return;
      }
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user's personal room
      client.join(`user:${userId}`);

      this.logger.log(`User ${userId} connected (socket: ${client.id})`);
    } catch (error: unknown) {
      this.logger.error(`Connection error: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSocketSet = this.userSockets.get(client.userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
      this.logger.log(
        `User ${client.userId} disconnected (socket: ${client.id})`,
      );
    }
  }

  // ============================================================================
  // MESSAGE EVENTS
  // ============================================================================

  @SubscribeMessage("join_conversation")
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) return;

    try {
      // Verify user is participant
      await this.messagingService.getConversationWithDetails(
        data.conversationId,
        client.userId,
      );

      client.join(`conversation:${data.conversationId}`);
      this.logger.debug(
        `User ${client.userId} joined conversation ${data.conversationId}`,
      );

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: (error as Error).message };
    }
  }

  @SubscribeMessage("leave_conversation")
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      type?: string;
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      attachments?: any;
      replyToId?: string;
    },
  ) {
    if (!client.userId) return { success: false, error: "Not authenticated" };

    try {
      const message = await this.messagingService.sendMessage(
        client.userId,
        data.conversationId,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        {
          content: data.content,
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: data.type as any,
          attachments: data.attachments,
          replyToId: data.replyToId,
        },
      );

      // Broadcast to all participants in the conversation
      this.server
        .to(`conversation:${data.conversationId}`)
        .emit("new_message", message);

      // Also notify users who aren't in the conversation room
      const conversation =
        await this.messagingService.getConversationWithDetails(
          data.conversationId,
          client.userId,
        );

      for (const participant of conversation.participants) {
        if (participant.userId !== client.userId) {
          this.server
            .to(`user:${participant.userId}`)
            .emit("message_notification", {
              conversationId: data.conversationId,
              message,
            });
        }
      }

      return { success: true, message };
    } catch (error: unknown) {
      return { success: false, error: (error as Error).message };
    }
  }

  @SubscribeMessage("typing_start")
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) return;

    client.to(`conversation:${data.conversationId}`).emit("user_typing", {
      userId: client.userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage("typing_stop")
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) return;

    client
      .to(`conversation:${data.conversationId}`)
      .emit("user_stopped_typing", {
        userId: client.userId,
        conversationId: data.conversationId,
      });
  }

  @SubscribeMessage("mark_read")
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) return;

    try {
      await this.messagingService.markAsRead(
        client.userId,
        data.conversationId,
      );

      // Notify other participants about read status
      client.to(`conversation:${data.conversationId}`).emit("messages_read", {
        userId: client.userId,
        conversationId: data.conversationId,
      });

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: (error as Error).message };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Send notification to specific user
   */
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any

  /**
   * Send to all participants in a conversation
   */
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendToConversation(conversationId: string, event: string, data: unknown) {
    this.server.to(`conversation:${conversationId}`).emit(event, data);
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }
}
