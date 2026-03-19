import { Router } from 'express';
import { historyController } from '../controllers/history.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', historyController.save);
router.get('/workspace/:workspaceId', historyController.getWorkspaceHistory);
router.get('/workspace/:workspaceId/stats', historyController.getStats);
router.get('/:id', historyController.getOne);
router.delete('/workspace/:workspaceId/clear', historyController.clearWorkspaceHistory);
router.delete('/:id', historyController.delete);

export default router;