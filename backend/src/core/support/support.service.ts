
import { CreateResponseDto } from "./dto/create-response.dto";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { PrismaService } from "@infrastructure/database/prisma.service";
import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  Prisma,
} from "@prisma/client";

// ============================================================================
// SUPPORT TICKETING SERVICE
// Customer support and issue tracking
// ============================================================================

// SLA configurations (in hours)
const SLA_CONFIG = {
  CRITICAL: { firstResponse: 1, resolution: 4 },
  URGENT: { firstResponse: 2, resolution: 8 },
  HIGH: { firstResponse: 4, resolution: 24 },
  MEDIUM: { firstResponse: 8, resolution: 48 },
  LOW: { firstResponse: 24, resolution: 72 },
};

export interface TicketWithDetails {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  user: {
    id: string;
    username: string;
    email: string;
  };
  assignedTo: {
    id: string;
    displayName: string;
  } | null;
  responseCount: number;
  lastResponseAt: Date | null;
  slaDeadline: Date | null;
  slaBreach: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // TICKET MANAGEMENT
  // ============================================================================

  /**
   * Create a new support ticket
   */
  async createTicket(
    userId: string,
    dto: CreateTicketDto,
  ): Promise<TicketWithDetails> {
    // Generate ticket number
    const ticketNumber = await this.generateTicketNumber();

    // Calculate SLA deadline
    const slaConfig = SLA_CONFIG[dto.priority || "MEDIUM"];
    const slaDeadline = new Date(
      Date.now() + slaConfig.firstResponse * 60 * 60 * 1000,
    );

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        subject: dto.subject,
        description: dto.description,
        category: dto.category as TicketCategory,
        priority: (dto.priority as TicketPriority) || "MEDIUM",
        orderId: dto.orderId,
        disputeId: dto.disputeId,
        withdrawalId: dto.withdrawalId,
        tags: dto.tags,
        slaDeadline,
      },
    });

    // Auto-assign if possible
    await this.autoAssignTicket(ticket.id, dto.category as TicketCategory);

    this.logger.log(`Ticket created: ${ticketNumber} by user ${userId}`);

    return this.getTicketWithDetails(ticket.id);
  }

  /**
   * Get ticket with details
   */
  async getTicketWithDetails(ticketId: string): Promise<TicketWithDetails> {
    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          responses: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!ticket) {
        throw new NotFoundException("Ticket not found");
      }

      // Get user info
      const user = await this.prisma.user.findUnique({
        where: { id: ticket.userId },
        select: { id: true, username: true, email: true },
      });

      // Get assigned agent info
      let assignedTo: null | { id: any; displayName: any } = null;
      if (ticket.assignedToId) {
        const agent = await this.prisma.supportAgent.findUnique({
          where: { userId: ticket.assignedToId },
          select: { userId: true, displayName: true },
        });
        if (agent) {
          assignedTo = { id: agent.userId, displayName: agent.displayName };
        }
      }

      // Get response count
      const responseCount = await this.prisma.ticketResponse.count({
        where: { ticketId },
      });

      return {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        user: user!,
        assignedTo,
        responseCount,
        lastResponseAt: ticket.responses[0]?.createdAt || null,
        slaDeadline: ticket.slaDeadline,
        slaBreach: ticket.slaBreach,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user's tickets
   */
  async getUserTickets(
    userId: string,
    options: {
      status?: TicketStatus;
      page: number;
      limit: number;
    },
  ): Promise<{
    data: TicketWithDetails[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.SupportTicketWhereInput = { userId };
    if (status) {
      where.status = status;
    }

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    const ticketsWithDetails = await Promise.all(
      tickets.map((t: any) => this.getTicketWithDetails(t.id)),
    );

    return {
      data: ticketsWithDetails,
      total,
      page,
      limit,
    };
  }

  /**
   * Get all tickets (admin)
   */
  async getAllTickets(options: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedToId?: string;
    page: number;
    limit: number;
  }): Promise<{
    data: TicketWithDetails[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, priority, category, assignedToId, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.SupportTicketWhereInput = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assignedToId) where.assignedToId = assignedToId;

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    const ticketsWithDetails = await Promise.all(
      tickets.map((t: any) => this.getTicketWithDetails(t.id)),
    );

    return {
      data: ticketsWithDetails,
      total,
      page,
      limit,
    };
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    performedBy: string,
  ): Promise<void> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    const previousStatus = ticket.status;

    await this.prisma.$transaction(async (tx: any) => {
      // Update ticket
      const updateData: any = { status };

      if (status === "RESOLVED" || status === "CLOSED") {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = performedBy;
        if (status === "CLOSED") {
          updateData.closedAt = new Date();
        }
      }

      await tx.supportTicket.update({
        where: { id: ticketId },
        data: updateData,
      });

      // Record history
      await tx.ticketHistory.create({
        data: {
          ticketId,
          action: "STATUS_CHANGED",
          previousValue: previousStatus,
          newValue: status,
          performedBy,
        },
      });

      // Update agent stats if resolved
      if (
        (status === "RESOLVED" || status === "CLOSED") &&
        ticket.assignedToId
      ) {
        await tx.supportAgent.update({
          where: { userId: ticket.assignedToId },
          data: {
            currentTickets: { decrement: 1 },
            totalResolved: { increment: 1 },
          },
        });
      }
    });

    this.logger.log(
      `Ticket ${ticket.ticketNumber} status changed: ${previousStatus} -> ${status}`,
    );
  }

  /**
   * Assign ticket to agent
   */
  async assignTicket(
    ticketId: string,
    agentUserId: string,
    performedBy: string,
  ): Promise<void> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    const agent = await this.prisma.supportAgent.findUnique({
      where: { userId: agentUserId },
    });

    if (!agent) {
      throw new NotFoundException("Agent not found");
    }

    if (agent.currentTickets >= agent.maxTickets) {
      throw new BadRequestException(
        "Agent has reached maximum ticket capacity",
      );
    }

    await this.prisma.$transaction(async (tx: any) => {
      // Decrement previous agent's count
      if (ticket.assignedToId) {
        await tx.supportAgent.update({
          where: { userId: ticket.assignedToId },
          data: { currentTickets: { decrement: 1 } },
        });
      }

      // Update ticket
      await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          assignedToId: agentUserId,
          assignedAt: new Date(),
          status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
        },
      });

      // Increment new agent's count
      await tx.supportAgent.update({
        where: { userId: agentUserId },
        data: { currentTickets: { increment: 1 } },
      });

      // Record history
      await tx.ticketHistory.create({
        data: {
          ticketId,
          action: "ASSIGNED",
          previousValue: ticket.assignedToId,
          newValue: agentUserId,
          performedBy,
        },
      });
    });

    this.logger.log(
      `Ticket ${ticket.ticketNumber} assigned to agent ${agentUserId}`,
    );
  }

  // ============================================================================
  // TICKET RESPONSES
  // ============================================================================

  /**
   * Add response to ticket
   */
  async addResponse(
    ticketId: string,
    userId: string,
    dto: CreateResponseDto,
    isStaff: boolean = false,
  ): Promise<any> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    // Check permission
    if (!isStaff && ticket.userId !== userId) {
      throw new ForbiddenException("You can only respond to your own tickets");
    }

    const response = await this.prisma.$transaction(async (tx: any) => {
      // Create response
      const resp = await tx.ticketResponse.create({
        data: {
          ticketId,
          userId,
          message: dto.message,
          isStaff,
          isInternal: dto.isInternal || false,
        },
      });

      // Update ticket status
      let newStatus = ticket.status;
      if (isStaff && ticket.status === "OPEN") {
        newStatus = "IN_PROGRESS";
      } else if (isStaff && ticket.status === "WAITING_CUSTOMER") {
        newStatus = "IN_PROGRESS";
      } else if (!isStaff && ticket.status === "WAITING_CUSTOMER") {
        newStatus = "IN_PROGRESS";
      }

      // Track first response time
      const updateData: any = { status: newStatus };
      if (isStaff && !ticket.firstResponseAt) {
        updateData.firstResponseAt = new Date();
      }

      await tx.supportTicket.update({
        where: { id: ticketId },
        data: updateData,
      });

      return resp;
    });

    this.logger.log(
      `Response added to ticket ${ticket.ticketNumber} by ${isStaff ? "staff" : "user"} ${userId}`,
    );

    return response;
  }

  /**
   * Get ticket responses
   */
  async getTicketResponses(
    ticketId: string,
    userId: string,
    isStaff: boolean = false,
  ): Promise<any[]> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    // Check permission
    if (!isStaff && ticket.userId !== userId) {
      throw new ForbiddenException("You can only view your own tickets");
    }

    const where: Prisma.TicketResponseWhereInput = { ticketId };

    // Non-staff can't see internal notes
    if (!isStaff) {
      where.isInternal = false;
    }

    const responses = await this.prisma.ticketResponse.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    // Get user info for each response
    const userIds = [...new Set(responses.map((r: any) => r.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, avatarUrl: true },
    });
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    return responses.map((r: any) => ({
      id: r.id,
      message: r.message,
      isStaff: r.isStaff,
      isInternal: r.isInternal,
      user: userMap.get(r.userId),
      createdAt: r.createdAt,
    }));
  }

  // ============================================================================
  // ESCALATION
  // ============================================================================

  /**
   * Escalate ticket
   */
  async escalateTicket(
    ticketId: string,
    escalatedTo: string,
    reason: string,
    performedBy: string,
  ): Promise<void> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          isEscalated: true,
          escalatedAt: new Date(),
          escalatedTo,
          escalationReason: reason,
          priority: "URGENT",
        },
      });

      await tx.ticketHistory.create({
        data: {
          ticketId,
          action: "ESCALATED",
          newValue: escalatedTo,
          performedBy,
          notes: reason,
        },
      });
    });

    this.logger.log(
      `Ticket ${ticket.ticketNumber} escalated to ${escalatedTo}`,
    );
  }

  // ============================================================================
  // CANNED RESPONSES
  // ============================================================================

  /**
   * Get canned responses
   */
  async getCannedResponses(category?: TicketCategory): Promise<any[]> {
    try {
      const where: Prisma.CannedResponseWhereInput = { isActive: true };
      if (category) {
        where.category = category;
      }

      return this.prisma.cannedResponse.findMany({
        where,
        orderBy: { usageCount: "desc" },
      });
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create canned response
   */
  async createCannedResponse(
    createdBy: string,
    data: {
      title: string;
      content: string;
      category?: TicketCategory;
      shortcut?: string;
    },
  ): Promise<any> {
    return this.prisma.cannedResponse.create({
      data: {
        ...data,
        createdBy,
      },
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Generate unique ticket number
   */
  private async generateTicketNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const count = await this.prisma.supportTicket.count({
        where: {
          createdAt: {
            gte: new Date(`${year}-01-01`),
          },
        },
      });
      return `TKT-${year}-${String(count + 1).padStart(6, "0")}`;
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Auto-assign ticket to available agent
   */
  private async autoAssignTicket(
    ticketId: string,
    _category: TicketCategory,
  ): Promise<void> {
    // Find available agent with matching skills
    const agent = await this.prisma.supportAgent.findFirst({
      where: {
        isAvailable: true,
        currentTickets: { lt: this.prisma.supportAgent.fields.maxTickets },
      },
      orderBy: [{ currentTickets: "asc" }, { satisfactionScore: "desc" }],
    });

    if (agent) {
      await this.assignTicket(ticketId, agent.userId, "SYSTEM");
    }
  }

  /**
   * Get ticket statistics
   */
  async getTicketStats(): Promise<any> {
    try {
      const [
        totalOpen,
        totalInProgress,
        totalResolved,
        _avgResolutionTime,
        slaBreach,
      ] = await Promise.all([
        this.prisma.supportTicket.count({ where: { status: "OPEN" } }),
        this.prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
        this.prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
        this.prisma.supportTicket.aggregate({
          where: { resolvedAt: { not: null } },
          _avg: {
            // This would need a computed field for resolution time
          },
        }),
        this.prisma.supportTicket.count({ where: { slaBreach: true } }),
      ]);

      return {
        totalOpen,
        totalInProgress,
        totalResolved,
        slaBreach,
      };
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
  }
}
