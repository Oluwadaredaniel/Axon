import { Router } from 'express';
import { docsController } from '../controllers/docs.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public route — no auth needed
router.get('/public/:slug', docsController.getPublic);

// Protected routes
router.use(requireAuth);

router.post('/generate', docsController.generate);
router.get('/workspace/:workspaceId', docsController.getForWorkspace);
router.put('/:id/toggle-public', docsController.togglePublic);
router.get('/:id/export', docsController.exportJSON);

export default router;