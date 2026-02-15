import { Injectable, Logger } from "@nestjs/common";

import { Currency } from "@prisma/client";
import { Prisma, EscrowHoldStatus } from "@prisma/client";
import { PrismaService } from "@infrastructure/database/prisma.service";

export interface CreateEscrowData {
  orderId: string;
  buyerWalletId: string;
  sellerWalletId?: string;
  amountMinor: bigint;
  currency?: Currency;
  timeoutHours: number;
}

export interface EscrowFilterOptions {
  walletId: string;
  status?: EscrowHoldStatus;
  role?: "as_buyer" | "as_seller";
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface PaginatedEscrows {
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class EscrowRepository {
  private readonly logger = new Logger(EscrowRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new escrow hold
   */
  async create(
    data: CreateEscrowData,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx?: Prisma.TransactionClient,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const prisma = tx ?? this.prisma;
    const timeoutAt = new Date(Date.now() + data.timeoutHours * 60 * 60 * 1000);

    const escrow = await prisma.escrowHold.create({
      data: {
        orderId: data.orderId,
        buyerWalletId: data.buyerWalletId,
        sellerWalletId: data.sellerWalletId,
        amountMinor: data.amountMinor,
        currency: data.currency || "IDR",
        status: "ACTIVE",
        timeoutAt,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
          },
        },
        buyerWallet: {
          select: {
            id: true,
            userId: true,
          },
        },
        sellerWallet: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    this.logger.log(`Created escrow ${escrow.id} for order ${data.orderId}`);
    return escrow;
  }

  /**
   * Find escrow by ID
   */
  async findById(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    id: string,
    tx?: Prisma.TransactionClient,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any | null> {
    const prisma = tx ?? this.prisma;

    return prisma.escrowHold.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
            status: true,
            initiatorId: true,
            counterpartyId: true,
          },
        },
        buyerWallet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        sellerWallet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Find escrow by order ID
   */
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findByOrderId(orderId: string): Promise<any | null> {
    return this.prisma.escrowHold.findUnique({
      where: { orderId },
      include: {
        order: true,
        buyerWallet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        sellerWallet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find escrows with filters and pagination
   */
  async findMany(options: EscrowFilterOptions): Promise<PaginatedEscrows> {
    const {
      walletId,
      status,
      role,
      dateFrom,
      dateTo,
      page,
      limit,
      sortBy,
      sortOrder,
    } = options;

    const where: Prisma.EscrowHoldWhereInput = {
      OR: [{ buyerWalletId: walletId }, { sellerWalletId: walletId }],
    };

    if (status) {
      where.status = status;
    }

    if (role === "as_buyer") {
      where.buyerWalletId = walletId;
      delete where.OR;
    } else if (role === "as_seller") {
      where.sellerWalletId = walletId;
      delete where.OR;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const total = await this.prisma.escrowHold.count({ where });

    const data = await this.prisma.escrowHold.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
            status: true,
          },
        },
        buyerWallet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        sellerWallet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update escrow status
   // Eslint-disable-next-line @typescript-eslint/no-explicit-any
   */
  async updateStatus(
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    id: string,
    status: EscrowHoldStatus,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData?: Record<string, any>,
    tx?: Prisma.TransactionClient,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const prisma = tx ?? this.prisma;

    const updateData: Prisma.EscrowHoldUpdateInput = {
      status,
      ...additionalData,
    };

    // Set timestamp based on status
    if (
      status === "RELEASED" ||
      status === "REFUNDED" ||
      status === "DISPUTED"
    ) {
      updateData.resolvedAt = new Date();
    }

    return prisma.escrowHold.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
          },
        },
        buyerWallet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        sellerWallet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   // Eslint-disable-next-line @typescript-eslint/no-explicit-any
   * Extend escrow timeout
   */
  async extendTimeout(
    id: string,
    additionalHours: number,
    tx?: Prisma.TransactionClient,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const prisma = tx ?? this.prisma;

    const escrow = await prisma.escrowHold.findUnique({ where: { id } });
    if (!escrow) {
      throw new Error("Escrow not found");
    }

    const currentTimeout = escrow.timeoutAt || new Date();
    const newTimeout = new Date(
      currentTimeout.getTime() + additionalHours * 60 * 60 * 1000,
    );

    return prisma.escrowHold.update({
      where: { id },
      data: {
        timeoutAt: newTimeout,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      },
    });
  }

  /**
   * Find escrows pending timeout
   */
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findPendingTimeout(): Promise<any[]> {
    return this.prisma.escrowHold.findMany({
      where: {
        status: "ACTIVE",
        timeoutAt: {
          lte: new Date(),
        },
      },
      include: {
        order: true,
        buyerWallet: {
          include: {
            user: true,
          },
        },
        sellerWallet: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Get escrow statistics for wallet
   */
  async getStats(walletId: string): Promise<{
    totalActive: number;
    totalCompleted: number;
    totalDisputed: number;
    totalAmountHeld: bigint;
    totalAmountReleased: bigint;
  }> {
    const [activeCount, completedCount, disputedCount, activeSum, releasedSum] =
      await Promise.all([
        this.prisma.escrowHold.count({
          where: {
            OR: [{ buyerWalletId: walletId }, { sellerWalletId: walletId }],
            status: "ACTIVE",
          },
        }),
        this.prisma.escrowHold.count({
          where: {
            OR: [{ buyerWalletId: walletId }, { sellerWalletId: walletId }],
            status: "RELEASED",
          },
        }),
        this.prisma.escrowHold.count({
          where: {
            OR: [{ buyerWalletId: walletId }, { sellerWalletId: walletId }],
            status: "DISPUTED",
          },
        }),
        this.prisma.escrowHold.aggregate({
          where: {
            OR: [{ buyerWalletId: walletId }, { sellerWalletId: walletId }],
            status: "ACTIVE",
          },
          _sum: { amountMinor: true },
        }),
        this.prisma.escrowHold.aggregate({
          where: {
            OR: [{ buyerWalletId: walletId }, { sellerWalletId: walletId }],
            status: "RELEASED",
          },
          _sum: { amountMinor: true },
        }),
      ]);

    return {
      totalActive: activeCount,
      totalCompleted: completedCount,
      totalDisputed: disputedCount,
      totalAmountHeld: activeSum._sum.amountMinor || 0n,
      totalAmountReleased: releasedSum._sum.amountMinor || 0n,
    };
  }
}
