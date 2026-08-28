import Dexie, { Table } from 'dexie';
import { Song, Playlist } from '@sur-o-jhankaar/shared-types';

export interface LocalFavorite {
  id: string; // songId
  song: Song;
  addedAt: number;
}

export interface LocalHistoryItem {
  id: string; // songId
  song: Song;
  playedAt: number;
}

export interface LocalCustomPlaylist {
  id: string;
  name: string;
  description: string;
  songIds: string[];
  songs: Song[];
  createdAt: number;
  updatedAt: number;
}

export interface LocalUserPreferences {
  key: string;
  value: any;
}

export class SurOJhankaarLocalDB extends Dexie {
  public favorites!: Table<LocalFavorite, string>;
  public history!: Table<LocalHistoryItem, string>;
  public localPlaylists!: Table<LocalCustomPlaylist, string>;
  public preferences!: Table<LocalUserPreferences, string>;

  constructor() {
    super('SurOJhankaarDB');
    this.version(1).stores({
      favorites: 'id, addedAt',
      history: 'id, playedAt',
      localPlaylists: 'id, name, createdAt',
      preferences: 'key'
    });
  }
}

export const localDb = new SurOJhankaarLocalDB();

export class LocalLibraryService {
  public static async isFavorite(songId: string): Promise<boolean> {
    const item = await localDb.favorites.get(songId);
    return !!item;
  }

  public static async toggleFavorite(song: Song): Promise<boolean> {
    const exists = await this.isFavorite(song.id);
    if (exists) {
      await localDb.favorites.delete(song.id);
      return false;
    } else {
      await localDb.favorites.put({
        id: song.id,
        song,
        addedAt: Date.now()
      });
      return true;
    }
  }

  public static async getFavorites(): Promise<Song[]> {
    const records = await localDb.favorites.orderBy('addedAt').reverse().toArray();
    return records.map(r => r.song);
  }

  public static async recordHistory(song: Song): Promise<void> {
    await localDb.history.put({
      id: song.id,
      song,
      playedAt: Date.now()
    });
  }

  public static async getHistory(limit = 50): Promise<Song[]> {
    const records = await localDb.history.orderBy('playedAt').reverse().limit(limit).toArray();
    return records.map(r => r.song);
  }

  public static async createLocalPlaylist(name: string, description = ''): Promise<LocalCustomPlaylist> {
    const id = `local_pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const playlist: LocalCustomPlaylist = {
      id,
      name,
      description,
      songIds: [],
      songs: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await localDb.localPlaylists.add(playlist);
    return playlist;
  }

  public static async getLocalPlaylists(): Promise<LocalCustomPlaylist[]> {
    return localDb.localPlaylists.orderBy('createdAt').reverse().toArray();
  }

  public static async addSongToLocalPlaylist(playlistId: string, song: Song): Promise<void> {
    const pl = await localDb.localPlaylists.get(playlistId);
    if (!pl) return;

    if (!pl.songIds.includes(song.id)) {
      pl.songIds.push(song.id);
      pl.songs.push(song);
      pl.updatedAt = Date.now();
      await localDb.localPlaylists.put(pl);
    }
  }
}
