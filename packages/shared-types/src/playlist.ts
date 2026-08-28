import { Language, SongKind } from './song';
import { MoodThemeId, ThemeConfig } from './theme';

export interface Playlist {
  id: string;
  name: string;
  slug: string;
  description: string;
  artworkUrl?: string;
  background?: string;
  languages: Language[];
  genres: string[];
  moods: string[];
  mood_theme: MoodThemeId;
  themeConfig?: ThemeConfig;
  sourceUrl?: string;
  sourceProvider?: string;
  sourceType?: string;
  isFeatured: boolean;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  songCount: number;
  songIds?: string[];
  kind?: SongKind;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistSeedItem {
  name: string;
  slug: string;
  description: string;
  languages: Language[];
  genres: string[];
  moods: string[];
  mood_theme: MoodThemeId;
  kind?: SongKind;
  isFeatured?: boolean;
}
