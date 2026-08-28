import { PlaylistModel } from '../models/Playlist';
import { SongModel } from '../models/Song';
import { Playlist, Song } from '@sur-o-jhankaar/shared-types';
import { ThemeResolver } from '@sur-o-jhankaar/theme-engine';
import { RealTimeEvents } from '../sockets/eventEmitters';

export class PlaylistService {
  public static async getPlaylists(filter: any = {}): Promise<Playlist[]> {
    const docs = await PlaylistModel.find(filter).sort({ sortOrder: 1, createdAt: 1 }).lean();
    return docs.map((d: any) => ({
      ...d,
      id: d._id?.toString(),
      themeConfig: d.themeConfig || ThemeResolver.resolveForPlaylist(d.slug)
    })) as unknown as Playlist[];
  }

  public static async getPlaylistBySlug(slug: string): Promise<{ playlist: Playlist; songs: Song[] } | null> {
    const pDoc = await PlaylistModel.findOne({ slug }).lean() as any;
    if (!pDoc) return null;

    const playlist = {
      ...pDoc,
      id: pDoc._id?.toString(),
      themeConfig: pDoc.themeConfig || ThemeResolver.resolveForPlaylist(pDoc.slug)
    } as unknown as Playlist;

    const songDocs = await SongModel.find({ playlists: slug, isActive: true })
      .sort({ score: -1, createdAt: -1 })
      .lean();

    const songs = songDocs.map((s: any) => ({
      ...s,
      id: s._id?.toString()
    })) as unknown as Song[];

    playlist.songCount = songs.length;

    return { playlist, songs };
  }

  public static async createPlaylist(data: Partial<Playlist>): Promise<Playlist> {
    const slug = data.slug || data.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'playlist';
    const themeConfig = data.themeConfig || (data.mood_theme ? ThemeResolver.resolveForPlaylist(data.mood_theme) : ThemeResolver.resolveForPlaylist(slug));

    const doc = await PlaylistModel.create({
      ...data,
      slug,
      themeConfig,
      mood_theme: data.mood_theme || themeConfig.id
    });

    const playlist = { ...doc.toObject(), id: doc._id.toString() } as Playlist;
    RealTimeEvents.emitPlaylistCreated(playlist);
    return playlist;
  }

  public static async updatePlaylist(slugOrId: string, updates: Partial<Playlist>): Promise<Playlist | null> {
    const query = slugOrId.match(/^[0-9a-fA-F]{24}$/) ? { _id: slugOrId } : { slug: slugOrId };

    if (updates.mood_theme) {
      updates.themeConfig = ThemeResolver.resolveForPlaylist(updates.mood_theme);
    }

    const doc = await PlaylistModel.findOneAndUpdate(query, { $set: updates }, { new: true }).lean() as any;
    if (!doc) return null;

    const playlist = { ...doc, id: doc._id?.toString() } as unknown as Playlist;
    RealTimeEvents.emitPlaylistUpdated(playlist);
    return playlist;
  }
}
