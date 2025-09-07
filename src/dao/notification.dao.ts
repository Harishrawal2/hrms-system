import { Prisma, Notification, NotificationType } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
}

export class NotificationDAO {
  async create(data: CreateNotificationData): Promise<Notification> {
    return prisma.notification.create({
      data
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id }
    });
  }

  async findByUserId(userId: string, filters: {
    isRead?: boolean;
    type?: NotificationType;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: Notification[]; total: number }> {
    const { isRead, type, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = { userId };
    if (isRead !== undefined) where.isRead = isRead;
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    return { notifications, total };
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async delete(id: string): Promise<Notification> {
    return prisma.notification.delete({
      where: { id }
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  }
}