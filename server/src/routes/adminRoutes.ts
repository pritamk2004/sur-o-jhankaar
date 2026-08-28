import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

router.use(requireAdminAuth);

router.get('/analytics', AdminController.getAnalytics);
router.post('/songs/bulk-update', AdminController.bulkUpdateSongs);
router.post('/songs/bulk-delete', AdminController.bulkDeleteSongs);

export default router;
