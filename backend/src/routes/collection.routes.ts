import { Router } from 'express';
import { collectionController } from '../controllers/collection.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', collectionController.create);
router.get('/workspace/:workspaceId', collectionController.getAll);
router.get('/:id', collectionController.getOne);
router.put('/:id', collectionController.update);
router.delete('/:id', collectionController.delete);
router.post('/:id/routes', collectionController.addRoute);
router.delete('/:id/routes/:routeId', collectionController.removeRoute);

export default router;