import { Injectable } from "@nestjs/common";

import { Notification } from "@prisma/client";
import { PrismaService } from "@infrastructure/database/prisma.service";

export interface ICreateNotification {
  userId: string;
  type: string;
  title: string;
  message: string;
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ICreateNotification): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata ?? undefined,
      },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async findByUser(
    userId: string,
    skip: number,
    take: number,
    read?: boolean,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ notifications: Notification[]; total: number }> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };

    if (read !== undefined) {
      if (read) {
        where.readAt = { not: null };
      } else {
        where.readAt = null;
      }
    }

    const [notifications, total] = await Promise.all([
      // OPTIMIZATION: Consider adding select to limit fields
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    // OPTIMIZATION: Consider adding select to limit fields
    return this.prisma.notification.findMany({
      where: {
        userId,
        readAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return result.count;
  }

  async delete(id: string): Promise<Notification> {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async deleteAllByUser(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return result.count;
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }
}
