import { Notification, NotificationType } from '@prisma/client';
import { NotificationDAO, CreateNotificationData } from '../dao/notification.dao';
import { ApiError } from '../utils/ApiError';

export class NotificationService {
  private notificationDAO: NotificationDAO;

  constructor() {
    this.notificationDAO = new NotificationDAO();
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    return this.notificationDAO.create(data);
  }

  async getUserNotifications(userId: string, filters: {
    isRead?: boolean;
    type?: NotificationType;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: Notification[]; total: number; pagination: any }> {
    const { page = 1, limit = 20 } = filters;
    const result = await this.notificationDAO.findByUserId(userId, filters);

    return {
      ...result,
      pagination: {
        current: page,
        pages: Math.ceil(result.total / limit),
        total: result.total,
        limit
      }
    };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationDAO.findById(id);
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, 'Not authorized to update this notification');
    }

    return this.notificationDAO.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationDAO.markAllAsRead(userId);
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await this.notificationDAO.findById(id);
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, 'Not authorized to delete this notification');
    }

    await this.notificationDAO.delete(id);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationDAO.getUnreadCount(userId);
  }
}