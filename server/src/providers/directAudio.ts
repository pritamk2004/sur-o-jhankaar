import { IMusicProvider, ProviderSongMetadata, ProviderPlaylistMetadata } from './base';
import { Song, PlaybackSourceConfig } from '@sur-o-jhankaar/shared-types';

export class DirectAudioProvider implements IMusicProvider {
  public id: 'direct' = 'direct';

  private readonly AUDIO_REGEX = /\.(mp3|m4a|aac|wav|ogg|flac)(\?.*)?$/i;

  public validateUrl(url: string): boolean {
    return this.AUDIO_REGEX.test(url) || url.endsWith('.m3u') || url.endsWith('.json');
  }

  public parseId(url: string): string | null {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/');
      return parts[parts.length - 1] || null;
    } catch {
      return null;
    }
  }

  public async getMetadata(url: string): Promise<ProviderSongMetadata> {
    const filename = this.parseId(url) || 'audio_stream.mp3';
    const cleanTitle = filename.replace(this.AUDIO_REGEX, '').replace(/[-_]/g, ' ');

    return {
      title: cleanTitle,
      artists: 'Direct Audio Stream',
      durationSeconds: 180,
      provider: 'direct',
      sourceUrl: url
    };
  }

  public async getPlaylist(
    url: string,
    onProgress?: (item: ProviderSongMetadata, index: number, total: number) => void
  ): Promise<ProviderPlaylistMetadata> {
    const track = await this.getMetadata(url);
    if (onProgress) {
      onProgress(track, 1, 1);
    }
    return {
      id: 'direct_stream_list',
      title: track.title,
      description: `Direct Audio Stream from ${url}`,
      trackCount: 1,
      tracks: [track]
    };
  }

  public getPlaybackConfig(song: Song): PlaybackSourceConfig {
    return {
      type: 'html5_audio',
      audioUrl: song.directAudioUrl || song.youtubeUrl || '',
      title: song.title,
      artist: song.displayArtist || song.artists
    };
  }
}
