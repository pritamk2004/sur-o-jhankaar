import { Song } from './song';
import { Playlist } from './playlist';
import { ThemeConfig } from './theme';
import { ImportJob } from './import';

export interface ServerToClientEvents {
  'song:created': (song: Song) => void;
  'song:updated': (song: Song) => void;
  'song:deleted': (payload: { songId: string }) => void;
  'playlist:created': (playlist: Playlist) => void;
  'playlist:updated': (playlist: Playlist) => void;
  'playlist:deleted': (payload: { playlistId: string }) => void;
  'theme:updated': (theme: ThemeConfig) => void;
  'radio:configUpdated': (config: any) => void;
  'import:started': (payload: { jobId: string; type: string; total: number }) => void;
  'import:progress': (payload: { jobId: string; processed: number; total: number; currentItem?: string }) => void;
  'import:songImported': (payload: { jobId: string; song: Song }) => void;
  'import:songFailed': (payload: { jobId: string; row?: number; error: string }) => void;
  'import:completed': (payload: { jobId: string; job: ImportJob }) => void;
  'import:cancelled': (payload: { jobId: string }) => void;
}

export interface ClientToServerEvents {
  'join:admin': () => void;
  'leave:admin': () => void;
  'join:playlist': (playlistSlug: string) => void;
  'leave:playlist': (playlistSlug: string) => void;
}
