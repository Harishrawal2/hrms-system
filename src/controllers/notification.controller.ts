import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.notificationService.getUserNotifications(req.user!.id, req.query as any);
      sendResponse(res, 200, result, 'Notifications fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.markAsRead(id, req.user!.id);
      sendResponse(res, 200, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.markAllAsRead(req.user!.id);
      sendResponse(res, 200, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.notificationService.deleteNotification(id, req.user!.id);
      sendResponse(res, 200, null, 'Notification deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const count = await this.notificationService.getUnreadCount(req.user!.id);
      sendResponse(res, 200, { count }, 'Unread count fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}