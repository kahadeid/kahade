
import {
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { MessagingService } from "./messaging.service";
import { SendMessageDto, EditMessageDto } from "./dto/send-message.dto";

  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";

@Controller("messaging")
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // ============================================================================
  // CONVERSATION ENDPOINTS
  // ============================================================================

  @Post("conversations")
  async createConversation(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagingService.createConversation(req.user.id, dto);
  }

  @Get("conversations")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getConversations(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Query("type") type?: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) {
    return this.messagingService.getUserConversations(req.user.id, {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: type as any,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  @Get("conversations/:id")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getConversation(@Request() req: Request, @Param("id") id: string) {
    return this.messagingService.getConversationWithDetails(id, req.user.id);
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  @Get("conversations/order/:orderId")
  async getOrderConversation(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("orderId") orderId: string,
  ) {
    return this.messagingService.getOrCreateOrderConversation(
      orderId,
      req.user.id,
    );
  }

  // ============================================================================
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // MESSAGE ENDPOINTS
  // ============================================================================

  @Post("conversations/:conversationId/messages")
  async sendMessage(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("conversationId") conversationId: string,
    @Body() dto: SendMessageDto,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) {
    return this.messagingService.sendMessage(req.user.id, conversationId, dto);
  }

  @Get("conversations/:conversationId/messages")
  async getMessages(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("conversationId") conversationId: string,
    @Query("before") before?: string,
    @Query("limit") limit: string = "50",
  ) {
    return this.messagingService.getMessages(req.user.id, conversationId, {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      before,
      limit: parseInt(limit, 10),
    });
  }

  @Post("conversations/:conversationId/read")
  async markAsRead(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Param("conversationId") conversationId: string,
  ) {
    await this.messagingService.markAsRead(req.user.id, conversationId);
    return { success: true };
  }

  @Put("messages/:messageId")
  async editMessage(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("messageId") messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.messagingService.editMessage(
      req.user.id,
      messageId,
      dto.content,
    );
  }

  @Delete("messages/:messageId")
  async deleteMessage(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("messageId") messageId: string,
  ) {
    await this.messagingService.deleteMessage(req.user.id, messageId);
    return { success: true };
  }
}
