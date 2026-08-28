import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAdminAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authRateLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.get('/profile', requireAdminAuth, AuthController.getProfile);

export default router;
