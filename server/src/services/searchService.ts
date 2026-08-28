import mongoose from 'mongoose';
import { SongModel } from '../models/Song';
import { PlaylistModel } from '../models/Playlist';
import { Song, Playlist } from '@sur-o-jhankaar/shared-types';
import { normalizeTitle } from '../utils/titleNormalizer';

export interface SearchResults {
  query: string;
  songs: Song[];
  playlists: Playlist[];
  spokenWord: Song[];
  totalMatches: number;
}

export class SearchService {
  public static async searchAll(
    query: string,
    options: {
      language?: string;
      limit?: number;
    } = {}
  ): Promise<SearchResults> {
    const q = (query || '').trim();
    const limit = options.limit || 20;

    if (mongoose.connection.readyState !== 1) {
      // Offline fallback
      return {
        query: q,
        songs: [],
        playlists: [],
        spokenWord: [],
        totalMatches: 0
      };
    }

    if (!q) {
      // Return top featured playlists and songs if empty query
      const [topSongs, featuredPlaylists, topStories] = await Promise.all([
        SongModel.find({ isActive: true, kind: 'music' }).sort({ score: -1 }).limit(limit).lean(),
        PlaylistModel.find({ isActive: true, isFeatured: true }).limit(8).lean(),
        SongModel.find({ isActive: true, kind: 'spoken_word' }).sort({ score: -1 }).limit(6).lean()
      ]);

      return {
        query: '',
        songs: topSongs.map((s: any) => ({ ...s, id: s._id?.toString() })) as unknown as Song[],
        playlists: featuredPlaylists.map((p: any) => ({ ...p, id: p._id?.toString() })) as unknown as Playlist[],
        spokenWord: topStories.map((s: any) => ({ ...s, id: s._id?.toString() })) as unknown as Song[],
        totalMatches: topSongs.length + featuredPlaylists.length + topStories.length
      };
    }

    const normalized = normalizeTitle(q);
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const songFilter: any = {
      isActive: true,
      $or: [
        { title: regex },
        { normalizedTitle: { $regex: normalized, $options: 'i' } },
        { displayArtist: regex },
        { artists: regex },
        { album: regex }
      ]
    };

    if (options.language && options.language !== 'All') {
      songFilter.languages = options.language;
    }

    const playlistFilter: any = {
      isActive: true,
      $or: [{ name: regex }, { slug: regex }, { description: regex }]
    };

    const [songDocs, playlistDocs] = await Promise.all([
      SongModel.find(songFilter).sort({ score: -1 }).limit(limit * 2).lean(),
      PlaylistModel.find(playlistFilter).limit(8).lean()
    ]);

    const allSongs = songDocs.map((s: any) => ({ ...s, id: s._id?.toString() })) as unknown as Song[];
    const musicSongs = allSongs.filter(s => s.kind !== 'spoken_word').slice(0, limit);
    const spokenWordSongs = allSongs.filter(s => s.kind === 'spoken_word').slice(0, limit);
    const playlists = playlistDocs.map((p: any) => ({ ...p, id: p._id?.toString() })) as unknown as Playlist[];

    return {
      query: q,
      songs: musicSongs,
      playlists,
      spokenWord: spokenWordSongs,
      totalMatches: musicSongs.length + playlists.length + spokenWordSongs.length
    };
  }
}
