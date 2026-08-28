export type SongKind = 'music' | 'spoken_word';

export type Language = 'Hindi' | 'Bangla' | 'Bhojpuri' | 'Other';

export type ProviderType = 'youtube' | 'spotify' | 'direct';

export type SourceType = 'csv' | 'url_single' | 'url_playlist' | 'manual';

export interface Song {
  id: string;
  title: string;
  rawTitle?: string;
  normalizedTitle: string;
  artists: string;                     // Source uploader channel / artist
  displayArtist?: string;              // Admin curated singer/artist override
  album?: string;
  durationSeconds: number;
  kind: SongKind;
  playlists: string[];                 // Array of playlist slugs
  score: number;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  spotifyUrl?: string;
  spotifyTrackId?: string;
  directAudioUrl?: string;
  languages: Language[];
  genres: string[];
  moods: string[];
  songTheme?: string;                  // Optional per-song theme override
  songType?: string;
  artworkUrl?: string;
  thumbnailUrl?: string;
  provider: ProviderType;
  sourceType: SourceType;
  isActive: boolean;
  metadataSource?: string;
  playCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SongFilterParams {
  query?: string;
  languages?: Language[];
  playlists?: string[];
  genres?: string[];
  moods?: string[];
  kind?: SongKind;
  isActive?: boolean;
  minScore?: number;
  sort?: 'score_desc' | 'latest' | 'play_count' | 'title_asc';
  page?: number;
  limit?: number;
}
