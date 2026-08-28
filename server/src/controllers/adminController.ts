import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { SongModel } from '../models/Song';
import { PlaylistModel } from '../models/Playlist';
import { ImportJobModel } from '../models/ImportJob';
import { RealTimeEvents } from '../sockets/eventEmitters';

export class AdminController {
  public static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AnalyticsService.getDashboardStats();
      const recentImports = await ImportJobModel.find().sort({ createdAt: -1 }).limit(5).lean();

      res.status(200).json({
        success: true,
        data: {
          ...stats,
          recentImports
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async bulkUpdateSongs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { songIds, updateFields } = req.body;
      if (!Array.isArray(songIds) || songIds.length === 0) {
        res.status(400).json({ success: false, message: 'songIds array is required' });
        return;
      }

      await SongModel.updateMany(
        { _id: { $in: songIds } },
        { $set: updateFields }
      );

      res.status(200).json({
        success: true,
        message: `Successfully updated ${songIds.length} songs`
      });
    } catch (error) {
      next(error);
    }
  }

  public static async bulkDeleteSongs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { songIds } = req.body;
      if (!Array.isArray(songIds) || songIds.length === 0) {
        res.status(400).json({ success: false, message: 'songIds array is required' });
        return;
      }

      await SongModel.deleteMany({ _id: { $in: songIds } });

      // Refresh playlist counts
      const playlists = await PlaylistModel.find();
      for (const pl of playlists) {
        pl.songCount = await SongModel.countDocuments({ playlists: pl.slug, isActive: true });
        await pl.save();
      }

      res.status(200).json({
        success: true,
        message: `Successfully deleted ${songIds.length} songs`
      });
    } catch (error) {
      next(error);
    }
  }
}
