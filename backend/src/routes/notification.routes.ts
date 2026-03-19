import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', notificationController.getAll);
router.get('/unread/count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markRead);
router.put('/read/all', notificationController.markAllRead);

export default router;