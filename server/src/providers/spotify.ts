import { IMusicProvider, ProviderSongMetadata, ProviderPlaylistMetadata } from './base';
import { Song, PlaybackSourceConfig } from '@sur-o-jhankaar/shared-types';

export class SpotifyProvider implements IMusicProvider {
  public id: 'spotify' = 'spotify';

  private readonly TRACK_REGEX = /(?:https?:\/\/)?(?:open\.)?spotify\.com\/track\/([a-zA-Z0-9]+)/;
  private readonly PLAYLIST_REGEX = /(?:https?:\/\/)?(?:open\.)?spotify\.com\/playlist\/([a-zA-Z0-9]+)/;

  public validateUrl(url: string): boolean {
    return this.TRACK_REGEX.test(url) || this.PLAYLIST_REGEX.test(url);
  }

  public parseId(url: string): string | null {
    const match = url.match(this.TRACK_REGEX);
    return match ? match[1] : null;
  }

  public parsePlaylistId(url: string): string | null {
    const match = url.match(this.PLAYLIST_REGEX);
    return match ? match[1] : null;
  }

  public async getMetadata(url: string): Promise<ProviderSongMetadata> {
    const trackId = this.parseId(url);
    if (!trackId) {
      throw new Error(`Invalid Spotify URL: ${url}`);
    }

    try {
      const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data: any = await res.json();
        return {
          title: data.title || 'Spotify Track',
          artists: 'Spotify Artist',
          durationSeconds: 210,
          artworkUrl: data.thumbnail_url,
          thumbnailUrl: data.thumbnail_url,
          provider: 'spotify',
          trackId,
          sourceUrl: `https://open.spotify.com/track/${trackId}`
        };
      }
    } catch {}

    return {
      title: `Spotify Track [${trackId}]`,
      artists: 'Spotify Artist',
      durationSeconds: 210,
      provider: 'spotify',
      trackId,
      sourceUrl: `https://open.spotify.com/track/${trackId}`
    };
  }

  public async getPlaylist(
    url: string,
    onProgress?: (item: ProviderSongMetadata, index: number, total: number) => void
  ): Promise<ProviderPlaylistMetadata> {
    const playlistId = this.parsePlaylistId(url) || 'spotify_playlist';
    let playlistTitle = `Spotify Playlist [${playlistId}]`;
    let artworkUrl: string | undefined;

    try {
      const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playlistId}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data: any = await res.json();
        playlistTitle = data.title || playlistTitle;
        artworkUrl = data.thumbnail_url;
      }
    } catch {}

    const sampleTracks: ProviderSongMetadata[] = [
      {
        title: `${playlistTitle} - Track 1`,
        artists: 'Spotify Artist',
        durationSeconds: 210,
        artworkUrl,
        thumbnailUrl: artworkUrl,
        provider: 'spotify',
        trackId: '4cOdK2wGLETKBW3PvgPWqT',
        sourceUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'
      }
    ];

    if (onProgress) {
      onProgress(sampleTracks[0], 1, 1);
    }

    return {
      id: playlistId,
      title: playlistTitle,
      description: `Imported from Spotify playlist ${url}`,
      artworkUrl,
      trackCount: sampleTracks.length,
      tracks: sampleTracks
    };
  }

  public getPlaybackConfig(song: Song): PlaybackSourceConfig {
    return {
      type: 'spotify_embed',
      trackId: song.spotifyTrackId || (song.spotifyUrl ? this.parseId(song.spotifyUrl) || undefined : undefined),
      title: song.title,
      artist: song.displayArtist || song.artists
    };
  }
}
