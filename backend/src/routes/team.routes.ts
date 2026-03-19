import { Router } from 'express';
import { teamController } from '../controllers/team.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', teamController.create);
router.get('/', teamController.getAll);
router.get('/:id', teamController.getOne);
router.delete('/:id', teamController.delete);

// Members
router.post('/:id/members', teamController.inviteMember);
router.put('/:id/members/:memberId', teamController.updateMemberRole);
router.delete('/:id/members/:memberId', teamController.removeMember);

export default router;