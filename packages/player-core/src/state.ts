import { PlayerState, PlayerMode, RepeatMode, Song } from '@sur-o-jhankaar/shared-types';

export const INITIAL_PLAYER_STATE: PlayerState = {
  currentSong: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.85,
  isMuted: false,
  shuffle: false,
  repeat: 'off',
  mode: 'playlist',
  playbackRate: 1.0,
  sleepTimerMinutes: null,
  sleepTimerEndsAt: null
};

export type PlayerAction =
  | { type: 'PLAY_SONG'; payload: { song: Song; queue?: Song[]; index?: number; mode?: PlayerMode } }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_REPEAT'; payload: RepeatMode }
  | { type: 'SET_MODE'; payload: PlayerMode }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }
  | { type: 'SET_SLEEP_TIMER'; payload: number | null }
  | { type: 'NEXT_SONG' }
  | { type: 'PREV_SONG' }
  | { type: 'SET_QUEUE'; payload: Song[] }
  | { type: 'ADD_TO_QUEUE'; payload: Song }
  | { type: 'PLAY_NEXT'; payload: Song }
  | { type: 'REMOVE_FROM_QUEUE'; payload: number }
  | { type: 'REORDER_QUEUE'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'CLEAR_QUEUE' };

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped';

export class PlayerStateMachine {
  private status: PlaybackStatus = 'idle';
  private currentSong: Song | null = null;

  public getState(): { status: PlaybackStatus; currentSong: Song | null } {
    return {
      status: this.status,
      currentSong: this.currentSong
    };
  }

  public transition(event: 'LOAD_START' | 'PLAY' | 'PAUSE' | 'STOP' | 'RESET', song?: Song): PlaybackStatus {
    switch (event) {
      case 'LOAD_START':
        this.status = 'loading';
        if (song) this.currentSong = song;
        break;
      case 'PLAY':
        this.status = 'playing';
        if (song) this.currentSong = song;
        break;
      case 'PAUSE':
        this.status = 'paused';
        break;
      case 'STOP':
      case 'RESET':
        this.status = 'stopped';
        break;
    }
    return this.status;
  }
}
