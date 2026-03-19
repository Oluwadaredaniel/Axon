import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

export const notificationController = {

  // Get all notifications for user
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { unread } = req.query;

      const notifications = await notificationService.getForUser(
        userId,
        unread === 'true'
      );

      return res.json({ notifications });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Mark notification as read
  async markRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await notificationService.markRead(userId, String(id));

      return res.json({ message: 'Notification marked as read' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Mark all as read
  async markAllRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      await notificationService.markRead(userId);

      return res.json({ message: 'All notifications marked as read' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get unread count
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const notifications = await notificationService.getForUser(userId, true);

      return res.json({ count: notifications.length });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};