import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All workspace routes require authentication
router.use(requireAuth);

router.post('/', workspaceController.create);
router.get('/', workspaceController.getAll);
router.get('/:id', workspaceController.getOne);
router.put('/:id', workspaceController.update);
router.delete('/:id', workspaceController.delete);

// Routes management
router.post('/:id/routes', workspaceController.saveRoutes);
router.get('/:id/routes', workspaceController.getRoutes);

export default router;