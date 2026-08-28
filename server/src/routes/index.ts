import { Router } from 'express';
import authRoutes from './authRoutes';
import songRoutes from './songRoutes';
import playlistRoutes from './playlistRoutes';
import { radioRouter, moodRouter, themeRouter } from './radioRoutes';
import importRoutes from './importRoutes';
import adminRoutes from './adminRoutes';
import { SearchController } from '../controllers/searchController';

const apiRouter = Router();

apiRouter.use('/auth/admin', authRoutes);
apiRouter.use('/songs', songRoutes);
apiRouter.use('/playlists', playlistRoutes);
apiRouter.use('/radio', radioRouter);
apiRouter.use('/moods', moodRouter);
apiRouter.use('/themes', themeRouter);
apiRouter.use('/admin/import', importRoutes);
apiRouter.use('/admin', adminRoutes);

// Dedicated Categorized Search Endpoint
apiRouter.get('/search', SearchController.search);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'sur-o-jhankaar-api',
    status: 'HEALTHY',
    timestamp: new Date().toISOString()
  });
});

export default apiRouter;
