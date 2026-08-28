import { Request, Response, NextFunction } from 'express';
import { RadioEngineService } from '../services/radioEngineService';
import { MoodEngineService } from '../services/moodEngineService';
import { ThemeResolver, THEME_REGISTRY } from '@sur-o-jhankaar/theme-engine';
import { RadioFilterScope, RadioSessionConfig } from '@sur-o-jhankaar/shared-types';

export class RadioController {
  public static async getStations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stations = [
        {
          name: 'SUR O JHANKAAR AIRWAVE',
          language: 'All',
          frequency: 98.7,
          description: 'National frequency covering all Indian classical, melody & folk heritage',
          themeId: 'deep_indigo_radio'
        },
        {
          name: 'HINDI NOSTALGIA & MELODY',
          language: 'Hindi',
          frequency: 92.7,
          description: 'Bollywood cinema classics, highway truck cassettes, and golden melodies',
          themeId: 'dusty_sepia_vhs'
        },
        {
          name: 'BANGLA SANGEET TARANGA',
          language: 'Bangla',
          frequency: 91.9,
          description: 'Rabindra Sangeet, Baul, Purulia Jhumur, and Modern Bengali ballads',
          themeId: 'sepia_ivory_gramophone'
        },
        {
          name: 'BHOJPURI DHAMAKA FM',
          language: 'Bhojpuri',
          frequency: 104.0,
          description: 'High-voltage folk celebrations, stage rhythms and vibrant anthems',
          themeId: 'vibrant_folk_festival'
        }
      ];

      res.status(200).json({
        success: true,
        data: stations
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getNextTrack(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { scope, history, lastArtist, config } = req.body as {
        scope?: RadioFilterScope;
        history?: string[];
        lastArtist?: string;
        config?: RadioSessionConfig;
      };

      const result = await RadioEngineService.getNextRadioTrack(
        scope || { language: 'All' },
        history || [],
        lastArtist,
        config
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export class MoodController {
  public static async getAllMoods(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const { slug } = req.params;
      const { language, limit } = req.query as Record<string, string>;

      const result = await MoodEngineService.getSongsForMood(slug, {
        language,
        limit: limit ? parseInt(limit, 10) : 50
      });

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
  public static async getAllThemes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const themes = Object.values(THEME_REGISTRY);
      res.status(200).json({
        success: true,
        data: themes
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getThemeForPlaylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const theme = ThemeResolver.resolveForPlaylist(slug);
      res.status(200).json({
        success: true,
        data: theme
      });
    } catch (error) {
      next(error);
    }
  }
}
