import { Router } from 'express';
import { environmentController } from '../controllers/environment.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', environmentController.create);
router.get('/workspace/:workspaceId', environmentController.getAll);
router.get('/:id', environmentController.getOne);
router.put('/:id', environmentController.update);
router.put('/:id/activate', environmentController.setActive);
router.post('/:id/duplicate', environmentController.duplicate);
router.delete('/:id', environmentController.delete);

export default router;