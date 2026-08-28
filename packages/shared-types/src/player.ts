import { Song } from './song';

export type PlayerMode = 'playlist' | 'mood' | 'radio';

export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;            // Current playback position in seconds
  duration: number;            // Total duration in seconds
  volume: number;              // 0 to 1
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  mode: PlayerMode;
  playbackRate: number;        // 0.75, 1, 1.25, 1.5 (useful for Sunday Suspense)
  sleepTimerMinutes: number | null;
  sleepTimerEndsAt: number | null;
}

export interface PlaybackSourceConfig {
  type: 'youtube_iframe' | 'spotify_embed' | 'html5_audio';
  videoId?: string;
  trackId?: string;
  audioUrl?: string;
  startSeconds?: number;
  title: string;
  artist: string;
}
