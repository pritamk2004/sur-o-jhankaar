import { Language } from './song';

export interface RadioFilterScope {
  language?: 'All' | Language;
  includedPlaylists?: string[];
  excludedPlaylists?: string[];
  includedArtists?: string[];
  excludedArtists?: string[];
  includedGenres?: string[];
  excludedGenres?: string[];
  includedMoods?: string[];
  excludedMoods?: string[];
}

export interface RadioSessionConfig {
  historyWindowSize: number;   // 10 | 20 | 50 | 100
  recentSongPenalty: number;
  artistRepeatPenalty: number;
}

export interface RadioState {
  currentStation: string;
  scope: RadioFilterScope;
  frequency: number;           // e.g. 98.3, 91.9, 104.0
  isTuning: boolean;
  history: string[];           // List of recent song IDs
}
