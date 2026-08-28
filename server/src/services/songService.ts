import { SongModel, ISongDocument } from '../models/Song';
import { PlaylistModel } from '../models/Playlist';
import { Song, SongFilterParams } from '@sur-o-jhankaar/shared-types';
import { cleanTitle, normalizeTitle } from '../utils/titleNormalizer';
import { classifyLanguages } from '../utils/languageClassifier';
import { RealTimeEvents } from '../sockets/eventEmitters';

export class SongService {
  public static async getSongs(params: SongFilterParams): Promise<{ songs: Song[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (params.isActive !== undefined) {
      filter.isActive = params.isActive;
    } else {
      filter.isActive = true;
    }

    if (params.kind) {
      filter.kind = params.kind;
    }

    if (params.languages && params.languages.length > 0) {
      filter.languages = { $in: params.languages };
    }

    if (params.playlists && params.playlists.length > 0) {
      filter.playlists = { $in: params.playlists };
    }

    if (params.genres && params.genres.length > 0) {
      filter.genres = { $in: params.genres };
    }

    if (params.moods && params.moods.length > 0) {
      filter.moods = { $in: params.moods };
    }

    if (params.query) {
      const q = params.query.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { displayArtist: { $regex: q, $options: 'i' } },
        { artists: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } }
      ];
    }

    let sort: any = { score: -1, createdAt: -1 };
    if (params.sort === 'latest') {
      sort = { createdAt: -1 };
    } else if (params.sort === 'play_count') {
      sort = { playCount: -1 };
    } else if (params.sort === 'title_asc') {
      sort = { title: 1 };
    }

    const [docs, total] = await Promise.all([
      SongModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      SongModel.countDocuments(filter)
    ]);

    const songs = docs.map((d: any) => ({
      ...d,
      id: d._id?.toString()
    })) as unknown as Song[];

    return {
      songs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  public static async getSongById(id: string): Promise<Song | null> {
    const doc = await SongModel.findById(id).lean() as any;
    if (!doc) return null;
    return { ...doc, id: doc._id?.toString() } as unknown as Song;
  }

  public static async createSong(data: Partial<Song>): Promise<Song> {
    const cleaned = cleanTitle(data.title || '');
    const normalized = normalizeTitle(cleaned);
    const languages = data.languages?.length ? data.languages : classifyLanguages(data.playlists || [], cleaned, data.artists || '');

    const doc = await SongModel.create({
      ...data,
      title: cleaned,
      rawTitle: data.rawTitle || data.title,
      normalizedTitle: normalized,
      languages
    });

    const song = { ...doc.toObject(), id: doc._id.toString() } as Song;
    RealTimeEvents.emitSongCreated(song);

    // Update song count in playlists
    if (song.playlists && song.playlists.length > 0) {
      await PlaylistModel.updateMany(
        { slug: { $in: song.playlists } },
        { $inc: { songCount: 1 } }
      );
    }

    return song;
  }

  public static async updateSong(id: string, updates: Partial<Song>): Promise<Song | null> {
    if (updates.title) {
      updates.title = cleanTitle(updates.title);
      updates.normalizedTitle = normalizeTitle(updates.title);
    }

    const doc = await SongModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean() as any;
    if (!doc) return null;

    const song = { ...doc, id: doc._id?.toString() } as unknown as Song;
    RealTimeEvents.emitSongUpdated(song);
    return song;
  }

  public static async deleteSong(id: string): Promise<boolean> {
    const song = await SongModel.findById(id);
    if (!song) return false;

    // Decrement playlist counts
    if (song.playlists && song.playlists.length > 0) {
      await PlaylistModel.updateMany(
        { slug: { $in: song.playlists } },
        { $inc: { songCount: -1 } }
      );
    }

    await SongModel.findByIdAndDelete(id);
    RealTimeEvents.emitSongDeleted(id);
    return true;
  }
}
