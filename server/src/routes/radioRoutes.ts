import { Router } from 'express';
import { RadioController } from '../controllers/radioController';
import { MoodController, ThemeController } from '../controllers/moodController';
import { requireAdminAuth } from '../middleware/auth';

export const radioRouter = Router();
radioRouter.get('/stations', RadioController.getStations);
radioRouter.post('/next', RadioController.getNextTrack);

export const moodRouter = Router();
moodRouter.get('/', MoodController.getMoods);
moodRouter.get('/:moodSlug/songs', MoodController.getMoodSongs);

export const themeRouter = Router();
themeRouter.get('/', ThemeController.getThemes);
themeRouter.put('/:themeId', requireAdminAuth, ThemeController.updateTheme);
