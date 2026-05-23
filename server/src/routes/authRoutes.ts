import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate, adminAuthenticate } from '../middleware/auth';
import { authLimiter, apiLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from '../utils/validators';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/social-login', authLimiter, authController.socialLogin);
router.post('/clerk-login', authLimiter, authController.clerkLogin);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.get('/users/search', authenticate, authController.searchUsers);

// Admin Routes
// Admin endpoints use the general `apiLimiter` (higher threshold) to avoid
// accidental lockouts during development and testing.
router.post('/admin/login', apiLimiter, authController.requestAdminAccess);
router.post('/admin/verify', apiLimiter, authController.verifyAdminAccess);
router.get('/admin/users', adminAuthenticate, authController.getAllUsers);
router.delete('/admin/users/:userId', adminAuthenticate, authController.deleteUser);

export default router;
