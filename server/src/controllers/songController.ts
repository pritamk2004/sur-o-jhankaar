import { Request, Response, NextFunction } from 'express';
import { SongService } from '../services/songService';
import { AnalyticsService } from '../services/analyticsService';
import { AppError } from '../middleware/errorHandler';

export class SongController {
  public static async getSongs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        query,
        language,
        playlist,
        genre,
        mood,
        kind,
        sort,
        page = '1',
        limit = '20'
      } = req.query as Record<string, string>;

      const result = await SongService.getSongs({
        query,
        languages: language ? [language as any] : undefined,
        playlists: playlist ? [playlist] : undefined,
        genres: genre ? [genre] : undefined,
        moods: mood ? [mood] : undefined,
        kind: kind as any,
        sort: sort as any,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSongById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const song = await SongService.getSongById(req.params.id);
      if (!song) {
        throw new AppError('Song not found', 404, 'NOT_FOUND');
      }
      res.status(200).json({
        success: true,
        data: song
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createSong(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const song = await SongService.createSong(req.body);
      res.status(201).json({
        success: true,
        message: 'Song created successfully',
        data: song
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateSong(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const song = await SongService.updateSong(req.params.id, req.body);
      if (!song) {
        throw new AppError('Song not found', 404, 'NOT_FOUND');
      }
      res.status(200).json({
        success: true,
        message: 'Song updated successfully',
        data: song
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteSong(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const success = await SongService.deleteSong(req.params.id);
      if (!success) {
        throw new AppError('Song not found', 404, 'NOT_FOUND');
      }
      res.status(200).json({
        success: true,
        message: 'Song deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async recordPlayback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { songId, playlistSlug, source, playbackDuration, completed, devicePlatform } = req.body;
      if (!songId) {
        throw new AppError('songId is required', 400, 'BAD_REQUEST');
      }

      await AnalyticsService.recordPlayback({
        songId,
        playlistSlug,
        source,
        playbackDuration,
        completed,
        devicePlatform
      });

      res.status(200).json({
        success: true,
        message: 'Playback recorded'
      });
    } catch (error) {
      next(error);
    }
  }
}
