import { Request, Response, NextFunction } from 'express';
import { PlaylistService } from '../services/playlistService';
import { AppError } from '../middleware/errorHandler';

export class PlaylistController {
  public static async getPlaylists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { language, isFeatured } = req.query;
      const filter: any = { isActive: true };

      if (language) {
        filter.languages = language;
      }
      if (isFeatured !== undefined) {
        filter.isFeatured = isFeatured === 'true';
      }

      const playlists = await PlaylistService.getPlaylists(filter);
      res.status(200).json({
        success: true,
        data: playlists
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getPlaylistBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PlaylistService.getPlaylistBySlug(req.params.slug);
      if (!result) {
        throw new AppError('Playlist not found', 404, 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createPlaylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const playlist = await PlaylistService.createPlaylist(req.body);
      res.status(201).json({
        success: true,
        message: 'Playlist created successfully',
        data: playlist
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updatePlaylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const playlist = await PlaylistService.updatePlaylist(req.params.slug, req.body);
      if (!playlist) {
        throw new AppError('Playlist not found', 404, 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        message: 'Playlist updated successfully',
        data: playlist
      });
    } catch (error) {
      next(error);
    }
  }
}
