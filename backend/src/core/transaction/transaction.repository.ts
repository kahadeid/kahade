import { Injectable } from "@nestjs/common";

import { PrismaService } from "@infrastructure/database/prisma.service";
import { Transaction } from "../../common/shims/prisma-types.shim";

interface CreateTransactionData {
  orderNumber: string;
  initiatorId: string;
  initiatorRole: string;
  counterpartyId?: string | null;
  title: string;
  description: string;
  category: string;
  amountMinor: bigint;
  feePayer: string;
  platformFeeMinor: bigint;
  holdingPeriodDays: number;
  status: string;
  inviteToken: string;
  inviteExpiresAt: Date;
  terms?: string | null;
}

interface UpdateTransactionData {
  status?: string;
  counterpartyId?: string;
  acceptedAt?: Date;
  paidAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  autoReleaseAt?: Date;
}

interface FindByUserOptions {
  status?: string;
  role?: string;
}

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTransactionData): Promise<Transaction> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).order.create({
      data: {
        orderNumber: data.orderNumber,
        initiatorId: data.initiatorId,
        initiatorRole: data.initiatorRole,
        counterpartyId: data.counterpartyId,
        title: data.title,
        description: data.description,
        category: data.category,
        amountMinor: data.amountMinor,
        feePayer: data.feePayer,
        platformFeeMinor: data.platformFeeMinor,
        holdingPeriodDays: data.holdingPeriodDays,
        status: data.status,
        inviteToken: data.inviteToken,
        inviteExpiresAt: data.inviteExpiresAt,
        customTerms: data.terms,
      },
      include: {
        initiator: { select: { id: true, username: true, email: true } },
        counterparty: { select: { id: true, username: true, email: true } },
      },
    });
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findById(id: string): Promise<Transaction | null> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).order.findUnique({
      where: { id },
      include: {
        initiator: { select: { id: true, username: true, email: true } },
        counterparty: { select: { id: true, username: true, email: true } },
        escrowHold: true,
        deliveryProof: true,
        dispute: true,
        ratings: true,
      },
    });
  }
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any

  async findByOrderNumber(orderNumber: string): Promise<Transaction | null> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).order.findUnique({
      where: { orderNumber },
      include: {
        initiator: { select: { id: true, username: true, email: true } },
        counterparty: { select: { id: true, username: true, email: true } },
      },
    });
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  async findByInviteToken(inviteToken: string): Promise<Transaction | null> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).order.findFirst({
      where: {
        inviteToken,
        inviteExpiresAt: { gt: new Date() },
      },
      include: {
        initiator: { select: { id: true, username: true, email: true } },
        counterparty: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async findByUser(
    userId: string,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    skip: number,
    take: number,
    options?: FindByUserOptions,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      OR: [{ initiatorId: userId }, { counterpartyId: userId }],
      deletedAt: null,
    };

    // Filter by status (supports comma-separated values from frontend tabs)
    if (options?.status) {
      const normalizedStatuses = options.status
        .split(",")
        .map((status) => status.trim().toUpperCase())
        .filter((status) => status.length > 0);

      if (normalizedStatuses.length === 1) {
        where.status = normalizedStatuses[0];
      } else if (normalizedStatuses.length > 1) {
        where.status = { in: normalizedStatuses };
      }
    }

    // Filter by role
    if (options?.role) {
      if (options.role === "buyer") {
        where.OR = [
          { initiatorId: userId, initiatorRole: "BUYER" },
          { counterpartyId: userId, initiatorRole: "SELLER" },
        ];
      } else if (options.role === "seller") {
        where.OR = [
          { initiatorId: userId, initiatorRole: "SELLER" },
          { counterpartyId: userId, initiatorRole: "BUYER" },
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        ];
      }
    }

    const [transactions, total] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.findMany({
        where,
        skip,
        take,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderBy: { createdAt: "desc" },
        include: {
          initiator: { select: { id: true, username: true, email: true } },
          counterparty: { select: { id: true, username: true, email: true } },
        },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.count({ where }),
    ]);

    return { transactions, total };
  }

  async update(id: string, data: UpdateTransactionData): Promise<Transaction> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).order.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      include: {
        initiator: { select: { id: true, username: true, email: true } },
        counterparty: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async softDelete(id: string, deletedByUserId: string): Promise<Transaction> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).order.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      },
    });
  }

  async findAll(
    skip: number,
    take: number,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: { status?: string },
  ): Promise<{ transactions: Transaction[]; total: number }> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { deletedAt: null };

    if (options?.status) {
      const normalizedStatuses = options.status
        .split(",")
        .map((status) => status.trim().toUpperCase())
        .filter((status) => status.length > 0);

      if (normalizedStatuses.length === 1) {
        where.status = normalizedStatuses[0];
      } else if (normalizedStatuses.length > 1) {
        where.status = { in: normalizedStatuses };
      }
    }

    const [transactions, total] = await Promise.all([
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          initiator: { select: { id: true, username: true, email: true } },
          counterparty: { select: { id: true, username: true, email: true } },
        },
      }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any).order.count({ where }),
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    ]);

    return { transactions, total };
  }

  async countByStatus(): Promise<Record<string, number>> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (this.prisma as any).order.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { deletedAt: null },
    });

    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});
  }

  async findPendingAutoRelease(): Promise<Transaction[]> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).order.findMany({
      where: {
        status: "PAID",
        autoReleaseAt: { lte: new Date() },
        deletedAt: null,
      },
      include: {
        initiator: { select: { id: true, username: true, email: true } },
        counterparty: { select: { id: true, username: true, email: true } },
        escrowHold: true,
      },
    });
  }
}
