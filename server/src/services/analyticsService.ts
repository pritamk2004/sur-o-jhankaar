import mongoose from 'mongoose';
import { PlaybackEventModel } from '../models/PlaybackEvent';
import { SongModel } from '../models/Song';
import { PlaylistModel } from '../models/Playlist';
import { getActiveListenersCount } from '../sockets/socketManager';

export class AnalyticsService {
  public static async recordPlayback(data: {
    songId: string;
    playlistSlug?: string;
    source?: 'player' | 'radio' | 'mood' | 'search';
    playbackDuration?: number;
    completed?: boolean;
    devicePlatform?: 'web' | 'android';
  }) {
    if (mongoose.connection.readyState !== 1) {
      return null;
    }

    try {
      await SongModel.findByIdAndUpdate(data.songId, { $inc: { playCount: 1 } });
      return PlaybackEventModel.create({
        songId: data.songId,
        playlistSlug: data.playlistSlug,
        source: data.source || 'player',
        playbackDuration: data.playbackDuration || 0,
        completed: data.completed || false,
        devicePlatform: data.devicePlatform || 'web'
      });
    } catch {
      return null;
    }
  }

  public static async getDashboardStats() {
    if (mongoose.connection.readyState !== 1) {
      return {
        totalSongs: 1894,
        totalPlaylists: 14,
        totalPlays: 0,
        spokenWordCount: 149,
        activeListeners: getActiveListenersCount(),
        mostPlayed: [],
        languageDistribution: [
          { language: 'Bangla', count: 1304 },
          { language: 'Hindi', count: 388 },
          { language: 'Bhojpuri', count: 129 }
        ]
      };
    }

    const [totalSongs, totalPlaylists, totalPlays, mostPlayed, spokenWordCount] = await Promise.all([
      SongModel.countDocuments({ isActive: true }),
      PlaylistModel.countDocuments({ isActive: true }),
      PlaybackEventModel.countDocuments(),
      SongModel.find({ isActive: true }).sort({ playCount: -1, score: -1 }).limit(10).lean(),
      SongModel.countDocuments({ kind: 'spoken_word', isActive: true })
    ]);

    // Aggregate by language
    const languageAggregation = await SongModel.aggregate([
      { $unwind: '$languages' },
      { $group: { _id: '$languages', count: { $sum: 1 } } }
    ]);

    const languageDistribution = languageAggregation.map(item => ({
      language: item._id,
      count: item.count
    }));

    return {
      totalSongs,
      totalPlaylists,
      totalPlays,
      spokenWordCount,
      activeListeners: getActiveListenersCount(),
      mostPlayed,
      languageDistribution
    };
  }
}
