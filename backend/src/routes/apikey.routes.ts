import { Router } from 'express';
import { apiKeyController } from '../controllers/apikey.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', apiKeyController.create);
router.get('/', apiKeyController.list);
router.put('/:id/revoke', apiKeyController.revoke);
router.delete('/:id', apiKeyController.delete);

export default router;