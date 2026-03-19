import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { requireAuth } from '../middleware/auth.middleware';
import express from 'express';

const router = Router();

// Webhook needs raw body — must be before json middleware
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  billingController.webhook
);

// Protected routes
router.use(requireAuth);
router.post('/checkout', billingController.createCheckout);
router.post('/portal', billingController.createPortal);
router.post('/cancel', billingController.cancel);
router.get('/', billingController.getBilling);

export default router;