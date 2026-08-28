import { Song, PlaybackSourceConfig, ProviderType } from '@sur-o-jhankaar/shared-types';

export interface ProviderSongMetadata {
  title: string;
  artists: string;
  album?: string;
  durationSeconds: number;
  artworkUrl?: string;
  thumbnailUrl?: string;
  provider: ProviderType;
  videoId?: string;
  trackId?: string;
  sourceUrl: string;
}

export interface ProviderPlaylistMetadata {
  id: string;
  title: string;
  description: string;
  artworkUrl?: string;
  trackCount: number;
  tracks: ProviderSongMetadata[];
}

export interface IMusicProvider {
  id: ProviderType;
  validateUrl(url: string): boolean;
  parseId(url: string): string | null;
  parsePlaylistId?(url: string): string | null;
  getMetadata(url: string): Promise<ProviderSongMetadata>;
  getPlaylist(url: string, onProgress?: (item: ProviderSongMetadata, index: number, total: number) => void): Promise<ProviderPlaylistMetadata>;
  getPlaybackConfig(song: Song): PlaybackSourceConfig;
}
