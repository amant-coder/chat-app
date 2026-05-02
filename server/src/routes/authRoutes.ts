import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate, adminAuthenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from '../utils/validators';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.get('/users/search', authenticate, authController.searchUsers);

// Admin Routes
router.post('/admin/login', authLimiter, authController.requestAdminAccess);
router.post('/admin/verify', authLimiter, authController.verifyAdminAccess);
router.get('/admin/users', adminAuthenticate, authController.getAllUsers);

export default router;
