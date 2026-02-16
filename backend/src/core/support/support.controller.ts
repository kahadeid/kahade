
import { AdminGuard } from "@common/guards/admin.guard";
import { CreateResponseDto } from "./dto/create-response.dto";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { SupportService } from "./support.service";
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from "@nestjs/common";

@Controller("support")
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  @Post("tickets")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createTicket(@Request() req: Request, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(req.user.id, dto);
  }

  @Get("tickets/my")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMyTickets(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Query("status") status?: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) {
    return this.supportService.getUserTickets(req.user.id, {
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: status as any,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  @Get("tickets/:ticketId")
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getTicket(@Request() req: Request, @Param("ticketId") ticketId: string) {
    const ticket = await this.supportService.getTicketWithDetails(ticketId);
    // Check if user owns the ticket or is admin
    if (ticket.user.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException("Forbidden");
    }
    return ticket;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  @Get("tickets/:ticketId/responses")
  async getTicketResponses(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("ticketId") ticketId: string,
  ) {
    return this.supportService.getTicketResponses(
      ticketId,
      req.user.id,
      req.user.isAdmin,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    );
  }

  @Post("tickets/:ticketId/responses")
  async addResponse(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("ticketId") ticketId: string,
    @Body() dto: CreateResponseDto,
  ) {
    return this.supportService.addResponse(
      ticketId,
      req.user.id,
      dto,
      req.user.isAdmin,
    );
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @Get("admin/tickets")
  @UseGuards(AdminGuard)
  async getAllTickets(
    @Query("status") status?: string,
    @Query("priority") priority?: string,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Query("category") category?: string,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Query("assignedToId") assignedToId?: string,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.supportService.getAllTickets({
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: status as any,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      priority: priority as any,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      category: category as any,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      assignedToId,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Put("admin/tickets/:ticketId/status")
  @UseGuards(AdminGuard)
  async updateTicketStatus(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("ticketId") ticketId: string,
    @Body() body: { status: string },
  ) {
    await this.supportService.updateTicketStatus(
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      ticketId,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      body.status as any,
      req.user.id,
    );
    return { success: true };
  }

  @Put("admin/tickets/:ticketId/assign")
  @UseGuards(AdminGuard)
  async assignTicket(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("ticketId") ticketId: string,
    @Body() body: { agentUserId: string },
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) {
    await this.supportService.assignTicket(
      ticketId,
      body.agentUserId,
      req.user.id,
    );
    return { success: true };
  }

  @Post("admin/tickets/:ticketId/escalate")
  @UseGuards(AdminGuard)
  async escalateTicket(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Param("ticketId") ticketId: string,
    @Body() body: { escalatedTo: string; reason: string },
  ) {
    await this.supportService.escalateTicket(
      ticketId,
      body.escalatedTo,
      body.reason,
      req.user.id,
    );
    return { success: true };
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Get("admin/stats")
  @UseGuards(AdminGuard)
  async getTicketStats() {
    return this.supportService.getTicketStats();
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // ============================================================================
  // CANNED RESPONSES
  // ============================================================================

  @Get("canned-responses")
  @UseGuards(AdminGuard)
  async getCannedResponses(@Query("category") category?: string) {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.supportService.getCannedResponses(category as any);
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Post("canned-responses")
  @UseGuards(AdminGuard)
  async createCannedResponse(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: Request,
    @Body()
    body: {
      title: string;
      content: string;
      category?: string;
      shortcut?: string;
    },
  ) {
    return this.supportService.createCannedResponse(req.user.id, {
      ...body,
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      category: body.category as any,
    });
  }
}
