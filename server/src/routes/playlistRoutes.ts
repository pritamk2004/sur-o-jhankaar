import { Router } from 'express';
import { PlaylistController } from '../controllers/playlistController';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

// Public endpoints
router.get('/', PlaylistController.getPlaylists);
router.get('/:slug', PlaylistController.getPlaylistBySlug);

// Protected Admin endpoints
router.post('/', requireAdminAuth, PlaylistController.createPlaylist);
router.put('/:slug', requireAdminAuth, PlaylistController.updatePlaylist);

export default router;
