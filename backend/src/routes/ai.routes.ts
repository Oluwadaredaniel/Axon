import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/debug', aiController.debug);
router.post('/explain', aiController.explain);
router.get('/usage', aiController.getUsage);

export default router;