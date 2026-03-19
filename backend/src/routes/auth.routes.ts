import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/signout', authController.signOut);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/waitlist', authController.joinWaitlist);

// GitHub OAuth
router.get('/github', authController.githubAuth);
router.get('/github/callback', authController.authCallback);

// Protected routes
router.get('/me', requireAuth, authController.getMe);

export default router;