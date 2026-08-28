import { Router } from 'express';
import { SongController } from '../controllers/songController';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

// Public endpoints (Zero-login access model)
router.get('/', SongController.getSongs);
router.get('/:id', SongController.getSongById);
router.post('/playback', SongController.recordPlayback);

// Protected Admin endpoints
router.post('/', requireAdminAuth, SongController.createSong);
router.put('/:id', requireAdminAuth, SongController.updateSong);
router.delete('/:id', requireAdminAuth, SongController.deleteSong);

export default router;
