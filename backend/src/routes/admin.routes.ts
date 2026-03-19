import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require auth + admin
router.use(requireAuth, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/revenue', adminController.getRevenue);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id/plan', adminController.updateUserPlan);
router.delete('/users/:id', adminController.banUser);

// Plans
router.get('/plans', adminController.getPlans);
router.put('/plans/:id', adminController.updatePlan);

// Waitlist
router.get('/waitlist', adminController.getWaitlist);

// Extension analytics
router.get('/extension/stats', adminController.getExtensionStats);

// Error logs
router.get('/logs', adminController.getErrorLogs);
router.put('/logs/:id/resolve', adminController.resolveErrorLog);

// Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.sendAnnouncement);

// System health
router.get('/health', adminController.getSystemHealth);

// Coupons
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id/deactivate', adminController.deactivateCoupon);

export default router;