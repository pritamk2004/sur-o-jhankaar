import { Request, Response, NextFunction } from 'express';
import { MoodEngineService } from '../services/moodEngineService';
import { ThemeModel } from '../models/Theme';
import { THEME_REGISTRY } from '@sur-o-jhankaar/theme-engine';
import { RealTimeEvents } from '../sockets/eventEmitters';

export class MoodController {
  public static async getMoods(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moods = await MoodEngineService.getAllMoods();
      res.status(200).json({
        success: true,
        data: moods
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMoodSongs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { moodSlug } = req.params;
      const result = await MoodEngineService.getSongsForMood(moodSlug);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export class ThemeController {
  public static async getThemes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dbThemes = await ThemeModel.find().lean();
      const themes = dbThemes.length > 0 ? dbThemes : Object.values(THEME_REGISTRY);

      res.status(200).json({
        success: true,
        data: themes
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { themeId } = req.params;
      const updated = await ThemeModel.findOneAndUpdate(
        { themeId },
        { $set: req.body },
        { new: true, upsert: true }
      ).lean();

      RealTimeEvents.emitThemeUpdated(updated as any);

      res.status(200).json({
        success: true,
        message: 'Theme updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}
