import express from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateParams } from '../middleware/validation.middleware';
import { notificationValidation } from '../validations/notification.validation';

const router = express.Router();
const notificationController = new NotificationController();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.patch('/:id/read', validateParams(notificationValidation.params), notificationController.markAsRead);
router.delete('/:id', validateParams(notificationValidation.params), notificationController.deleteNotification);

export default router;