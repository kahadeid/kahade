
import { ConversationType, MessageType, Prisma } from "@prisma/client";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { PrismaService } from "@infrastructure/database/prisma.service";
import { SendMessageDto } from "./dto/send-message.dto";
import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";

// ============================================================================
// MESSAGING SERVICE - Real-time Chat System
// ============================================================================

export interface ConversationWithDetails {
  id: string;
  type: ConversationType;
  title: string | null;
  orderId: string | null;
  lastMessageAt: Date | null;
  participants: {
    userId: string;
    username: string;
    avatarUrl: string | null;
    unreadCount: number;
  }[];
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
}

export interface MessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  type: MessageType;
  content: string;
  attachments: any;
  replyToId: string | null;
  replyTo: {
    id: string;
    content: string;
    senderName: string;
  } | null;
  isEdited: boolean;
  createdAt: Date;
}

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  /**
   * Create a new conversation
   */
  async createConversation(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<ConversationWithDetails> {
    // Validate participants
    if (dto.participantIds.length === 0) {
      throw new BadRequestException("At least one participant is required");
    }

    // For direct conversations, check if one already exists
    if (dto.type === "DIRECT" && dto.participantIds.length === 1) {
      const existingConversation = await this.findDirectConversation(
        userId,
        dto.participantIds[0],
      );
      if (existingConversation) {
        return this.getConversationWithDetails(existingConversation.id, userId);
      }
    }

    // Create conversation with participants
    const allParticipantIds = [userId, ...dto.participantIds];
    const uniqueParticipantIds = [...new Set(allParticipantIds)];

    const conversation = await this.prisma.conversation.create({
      data: {
        type: dto.type as ConversationType,
        title: dto.title,
        orderId: dto.orderId,
        supportTicketId: dto.supportTicketId,
        participants: {
          create: uniqueParticipantIds.map((id, _index) => ({
            userId: id,
            isAdmin: id === userId,
          })),
        },
      },
      include: {
        participants: true,
      },
    });

    this.logger.log(
      `Conversation created: ${conversation.id} by user ${userId}`,
    );

    return this.getConversationWithDetails(conversation.id, userId);
  }

  /**
   * Get or create order conversation
   */
  async getOrCreateOrderConversation(
    orderId: string,
    userId: string,
  ): Promise<ConversationWithDetails> {
    // Check if conversation exists for this order
    let conversation = await this.prisma.conversation.findUnique({
      where: { orderId },
    });

    if (!conversation) {
      // Get order participants
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { initiatorId: true, counterpartyId: true, title: true },
      });

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      const participantIds = [order.initiatorId];
      if (order.counterpartyId) {
        participantIds.push(order.counterpartyId);
      }

      // Create conversation
      conversation = await this.prisma.conversation.create({
        data: {
          type: "ORDER",
          title: `Chat: ${order.title}`,
          orderId,
          participants: {
            create: participantIds.map((id: any) => ({
              userId: id,
            })),
          },
        },
      });

      this.logger.log(`Order conversation created for order ${orderId}`);
    }

    return this.getConversationWithDetails(conversation.id, userId);
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(
    userId: string,
    options: {
      type?: ConversationType;
      page: number;
      limit: number;
    },
  ): Promise<{
    data: ConversationWithDetails[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { type, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ConversationWhereInput = {
      participants: {
        some: {
          userId,
          leftAt: null,
        },
      },
      deletedAt: null,
    };

    if (type) {
      where.type = type;
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: "desc" },
        skip,
        take: limit,
        include: {
          participants: {
            where: { leftAt: null },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    const conversationsWithDetails = await Promise.all(
      conversations.map((conv: any) =>
        this.getConversationWithDetails(conv.id, userId),
      ),
    );

    return {
      data: conversationsWithDetails,
      total,
      page,
      limit,
    };
  }

  /**
   * Get conversation details
   */
  async getConversationWithDetails(
    conversationId: string,
    userId: string,
  ): Promise<ConversationWithDetails> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: { leftAt: null },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          where: { deletedAt: null },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        "You are not a participant of this conversation",
      );
    }

    // Get participant details
    const participantUsers = await this.prisma.user.findMany({
      where: {
        id: { in: conversation.participants.map((p: any) => p.userId) },
      },
      select: { id: true, username: true, avatarUrl: true },
    });

    const participants = conversation.participants.map((p: any) => {
      const user = participantUsers.find((u) => u.id === p.userId);
      return {
        userId: p.userId,
        username: user?.username || "Unknown",
        avatarUrl: user?.avatarUrl || null,
        unreadCount: p.unreadCount,
      };
    });

    const lastMessage = conversation.messages[0]
      ? {
          content: conversation.messages[0].content,
          senderId: conversation.messages[0].senderId,
          createdAt: conversation.messages[0].createdAt,
        }
      : null;

    return {
      id: conversation.id,
      type: conversation.type,
      title: conversation.title,
      orderId: conversation.orderId,
      lastMessageAt: conversation.lastMessageAt,
      participants,
      lastMessage,
    };
  }

  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================

  /**
   * Send a message
   */
  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<MessageWithSender> {
    // Verify user is participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant || participant.leftAt) {
      throw new ForbiddenException(
        "You are not a participant of this conversation",
      );
    }

    // Create message
    const message = await this.prisma.$transaction(async (tx: any) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId: userId,
          type: (dto.type as MessageType) || "TEXT",
          content: dto.content,
          attachments: dto.attachments,
          replyToId: dto.replyToId,
        },
      });

      // Update conversation last message time
      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      // Increment unread count for other participants
      await tx.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId: { not: userId },
        },
        data: {
          unreadCount: { increment: 1 },
        },
      });

      return msg;
    });

    this.logger.log(
      `Message sent: ${message.id} in conversation ${conversationId}`,
    );

    return this.getMessageWithSender(message.id);
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(
    userId: string,
    conversationId: string,
    options: {
      before?: string;
      limit: number;
    },
  ): Promise<{
    data: MessageWithSender[];
    hasMore: boolean;
  }> {
    // Verify user is participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        "You are not a participant of this conversation",
      );
    }

    const where: Prisma.MessageWhereInput = {
      conversationId,
      deletedAt: null,
    };

    if (options.before) {
      const beforeMessage = await this.prisma.message.findUnique({
        where: { id: options.before },
      });
      if (beforeMessage) {
        where.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options.limit + 1, // Get one extra to check if there are more
    });

    const hasMore = messages.length > options.limit;
    const messageData = messages.slice(0, options.limit);

    const messagesWithSender = await Promise.all(
      messageData.map((m: any) => this.getMessageWithSender(m.id)),
    );

    return {
      data: messagesWithSender.reverse(), // Return in chronological order
      hasMore,
    };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(userId: string, conversationId: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx: any) => {
        // Update participant's last read time and reset unread count
        await tx.conversationParticipant.update({
          where: {
            conversationId_userId: {
              conversationId,
              userId,
            },
          },
          data: {
            lastReadAt: new Date(),
            unreadCount: 0,
          },
        });

        // Create read receipts for unread messages
        const unreadMessages = await tx.message.findMany({
          where: {
            conversationId,
            senderId: { not: userId },
            readReceipts: {
              none: { userId },
            },
          },
          select: { id: true },
        });

        if (unreadMessages.length > 0) {
          await tx.messageReadReceipt.createMany({
            data: unreadMessages.map((m: any) => ({
              messageId: m.id,
              userId,
            })),
            skipDuplicates: true,
          });
        }
      });
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Edit a message
   */
  async editMessage(
    userId: string,
    messageId: string,
    content: string,
  ): Promise<MessageWithSender> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException("You can only edit your own messages");
    }

    if (message.deletedAt) {
      throw new BadRequestException("Cannot edit a deleted message");
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    return this.getMessageWithSender(messageId);
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(userId: string, messageId: string): Promise<void> {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new NotFoundException("Message not found");
      }

      if (message.senderId !== userId) {
        throw new ForbiddenException("You can only delete your own messages");
      }

      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async findDirectConversation(
    userId1: string,
    userId2: string,
  ): Promise<{ id: string } | null> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        type: "DIRECT",
        deletedAt: null,
        AND: [
          {
            participants: {
              some: { userId: userId1, leftAt: null },
            },
          },
          {
            participants: {
              some: { userId: userId2, leftAt: null },
            },
          },
        ],
      },
      select: { id: true },
    });

    return conversation;
  }

  private async getMessageWithSender(
    messageId: string,
  ): Promise<MessageWithSender> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        replyTo: {
          select: { id: true, content: true, senderId: true },
        },
      },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    const sender = await this.prisma.user.findUnique({
      where: { id: message.senderId },
      select: { username: true, avatarUrl: true },
    });

    let replyToData: null | { id: any; content: any; senderName: string } = null;
    if (message.replyTo) {
      const replyToSender = await this.prisma.user.findUnique({
        where: { id: message.replyTo.senderId },
        select: { username: true },
      });
      replyToData = {
        id: message.replyTo.id,
        content: message.replyTo.content,
        senderName: replyToSender?.username || "Unknown",
      };
    }

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: sender?.username || "Unknown",
      senderAvatar: sender?.avatarUrl || null,
      type: message.type,
      content: message.content,
      attachments: message.attachments,
      replyToId: message.replyToId,
      replyTo: replyToData,
      isEdited: message.isEdited,
      createdAt: message.createdAt,
    };
  }
}
