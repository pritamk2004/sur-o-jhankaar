'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Song, RepeatMode, PlayerState, PlaybackSourceConfig } from '@sur-o-jhankaar/shared-types';
import { QueueManager } from '@sur-o-jhankaar/player-core';
import { localDb } from '../lib/indexedDb';
import { Api } from '../lib/api';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  repeat: RepeatMode;
  queue: Song[];
  currentIndex: number;
  isFullPlayerOpen: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  isRadioMode: boolean;
  mode: 'player' | 'radio';
  isFavorite: boolean;

  playSong: (song: Song, playlist?: Song[], startIndex?: number, isRadio?: boolean) => void;
  togglePlayPause: () => void;
  togglePlay: () => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  prevSong: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  addToQueue: (song: Song) => void;
  addToQueueNext: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  setFullPlayerOpen: (open: boolean) => void;
  setIsFullPlayerOpen: (open: boolean) => void;
  setSleepTimer: (minutes: number | null) => void;
  toggleFavoriteCurrentSong: () => void;
  toggleFavorite: (song?: Song) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Song[]>([]);
  const [isFullPlayerOpen, setFullPlayerOpen] = useState<boolean>(false);
  const [isRadioMode, setIsRadioMode] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // References
  const ytPlayerRef = useRef<any>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Song[]>([]);
  const currentSongRef = useRef<Song | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const repeatModeRef = useRef<RepeatMode>('off');
  const isRadioModeRef = useRef<boolean>(false);

  queueRef.current = queue;
  currentSongRef.current = currentSong;
  isPlayingRef.current = isPlaying;
  repeatModeRef.current = repeatMode;
  isRadioModeRef.current = isRadioMode;

  const toggleFavorite = useCallback(async (song?: Song) => {
    const target = song || currentSongRef.current;
    if (!target) return;
    const exists = await localDb.favorites.get(target.id);
    if (exists) {
      await localDb.favorites.delete(target.id);
      if (target.id === currentSongRef.current?.id) setIsFavorite(false);
    } else {
      await localDb.favorites.put({
        id: target.id,
        song: target,
        addedAt: Date.now()
      });
      if (target.id === currentSongRef.current?.id) setIsFavorite(true);
    }
  }, []);

  const toggleFavoriteCurrentSong = useCallback(() => {
    toggleFavorite();
  }, [toggleFavorite]);

  // Initialize HTML5 Audio Element & YouTube IFrame API Script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. HTML5 Audio Element
    const audio = new Audio();
    audio.volume = volume;
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    });
    audio.addEventListener('waiting', () => setIsBuffering(true));
    audio.addEventListener('playing', () => {
      setIsBuffering(false);
      setIsPlaying(true);
    });
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', handleTrackEnded);
    htmlAudioRef.current = audio;

    // 2. Load YouTube IFrame API script
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // 3. Load persisted preferences
    localDb.preferences.get('volume').then(s => {
      if (s && typeof s.value === 'number') {
        setVolumeState(s.value);
        if (audio) audio.volume = s.value;
      }
    }).catch(() => {});

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update Favorite State when song changes
  useEffect(() => {
    if (currentSong?.id) {
      localDb.favorites.get(currentSong.id).then(fav => {
        setIsFavorite(!!fav);
      }).catch(() => {});
    } else {
      setIsFavorite(false);
    }
  }, [currentSong]);

  // YouTube Time Tracking Polling
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const time = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration();
          if (time !== undefined && !isNaN(time)) setCurrentTime(time);
          if (dur !== undefined && !isNaN(dur) && dur > 0) setDuration(dur);
        } catch {}
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sleep Timer Countdown
  useEffect(() => {
    if (!sleepTimerRemaining || sleepTimerRemaining <= 0) return;

    const interval = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (!prev || prev <= 1) {
          pauseSong();
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining]);

  // Media Session API Sync
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.displayArtist || currentSong.artists || 'Sur o Jhankaar',
      album: currentSong.album || 'Har Sur Mein Ek Kahaani',
      artwork: currentSong.artworkUrl
        ? [{ src: currentSong.artworkUrl, sizes: '512x512', type: 'image/jpeg' }]
        : []
    });

    navigator.mediaSession.setActionHandler('play', () => resumeSong());
    navigator.mediaSession.setActionHandler('pause', () => pauseSong());
    navigator.mediaSession.setActionHandler('previoustrack', () => previousSong());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) seekTo(details.seekTime);
    });
  }, [currentSong]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(currentTime + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(Math.max(0, currentTime - 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyL':
          toggleFavoriteCurrentSong();
          break;
        case 'KeyS':
          toggleShuffle();
          break;
        case 'KeyR':
          toggleRepeat();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, volume, isMuted, isPlaying, isShuffle, repeatMode, currentSong, toggleFavoriteCurrentSong]);

  // Track Ended Handler
  const handleTrackEnded = useCallback(async () => {
    if (repeatModeRef.current === 'one') {
      seekTo(0);
      resumeSong();
      return;
    }

    if (isRadioModeRef.current) {
      try {
        const next = await Api.getNextRadioTrack({
          scope: { language: 'All' },
          history: currentSongRef.current ? [currentSongRef.current.id] : []
        });
        if (next?.song) {
          playSong(next.song, undefined, undefined, true);
          return;
        }
      } catch {}
    }

    nextSong();
  }, []);

  // Initialize or Update YouTube IFrame Instance
  const initOrPlayYouTube = (videoId: string) => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }

    if (!window.YT || !window.YT.Player) {
      setTimeout(() => initOrPlayYouTube(videoId), 200);
      return;
    }

    let ytContainer = document.getElementById('youtube-player-container');
    if (!ytContainer) {
      ytContainer = document.createElement('div');
      ytContainer.id = 'youtube-player-container';
      ytContainer.style.position = 'fixed';
      ytContainer.style.bottom = '-9999px';
      ytContainer.style.left = '-9999px';
      ytContainer.style.width = '1px';
      ytContainer.style.height = '1px';
      ytContainer.style.opacity = '0.01';
      ytContainer.style.pointerEvents = 'none';
      document.body.appendChild(ytContainer);
    }

    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.loadVideoById(videoId);
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
        return;
      } catch {}
    }

    ytPlayerRef.current = new window.YT.Player('youtube-player-container', {
      height: '1',
      width: '1',
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume * 100);
          event.target.playVideo();
          setIsPlaying(true);
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setIsBuffering(false);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.BUFFERING) {
            setIsBuffering(true);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            handleTrackEnded();
          }
        },
        onError: () => {
          setIsBuffering(false);
          nextSong();
        }
      }
    });
  };

  // Play Song
  const playSong = (song: Song, playlist?: Song[], startIndex = 0, isRadio = false) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setIsBuffering(true);
    setCurrentTime(0);
    setDuration(song.durationSeconds || 240);
    setIsRadioMode(isRadio);

    if (playlist && playlist.length > 0) {
      const reordered = isShuffle
        ? QueueManager.shuffleWithCurrentPinned(playlist, song)
        : [...playlist.slice(startIndex), ...playlist.slice(0, startIndex)];
      setQueue(reordered);
    } else if (queue.length === 0) {
      setQueue([song]);
    }

    if (song.directAudioUrl && htmlAudioRef.current) {
      if (ytPlayerRef.current?.pauseVideo) ytPlayerRef.current.pauseVideo();
      htmlAudioRef.current.src = song.directAudioUrl;
      htmlAudioRef.current.play().catch(() => {});
    } else {
      const videoId = song.youtubeVideoId || (song.youtubeUrl ? song.youtubeUrl.split('v=')[1]?.substring(0, 11) : null);
      if (videoId) {
        initOrPlayYouTube(videoId);
      }
    }

    localDb.history.put({
      id: song.id,
      song,
      playedAt: Date.now()
    }).catch(() => {});

    Api.recordPlayback(song.id, song.playlists?.[0], isRadio ? 'radio' : 'player').catch(() => {});
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  const pauseSong = () => {
    setIsPlaying(false);
    if (htmlAudioRef.current && !htmlAudioRef.current.paused) {
      htmlAudioRef.current.pause();
    }
    if (ytPlayerRef.current?.pauseVideo) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    }
  };

  const resumeSong = () => {
    if (!currentSong && queue.length > 0) {
      playSong(queue[0]);
      return;
    }
    setIsPlaying(true);
    if (htmlAudioRef.current && htmlAudioRef.current.src) {
      htmlAudioRef.current.play().catch(() => {});
    }
    if (ytPlayerRef.current?.playVideo) {
      try {
        ytPlayerRef.current.playVideo();
      } catch {}
    }
  };

  const nextSong = () => {
    if (queue.length <= 1) {
      if (repeatMode === 'all' && queue.length === 1) {
        playSong(queue[0]);
      } else {
        pauseSong();
      }
      return;
    }

    const nextIndex = 1;
    const nextItem = queue[nextIndex];
    const newQueue = queue.slice(nextIndex);
    setQueue(newQueue);
    playSong(nextItem);
  };

  const previousSong = () => {
    if (currentTime > 4) {
      seekTo(0);
      return;
    }
    seekTo(0);
  };

  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    if (htmlAudioRef.current && htmlAudioRef.current.src) {
      htmlAudioRef.current.currentTime = seconds;
    }
    if (ytPlayerRef.current?.seekTo) {
      try {
        ytPlayerRef.current.seekTo(seconds, true);
      } catch {}
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (val > 0) setIsMuted(false);
    if (htmlAudioRef.current) htmlAudioRef.current.volume = val;
    if (ytPlayerRef.current?.setVolume) {
      try {
        ytPlayerRef.current.setVolume(val * 100);
      } catch {}
    }
    localDb.preferences.put({ key: 'volume', value: val }).catch(() => {});
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(volume || 0.8);
    } else {
      setIsMuted(true);
      if (htmlAudioRef.current) htmlAudioRef.current.volume = 0;
      if (ytPlayerRef.current?.setVolume) {
        try {
          ytPlayerRef.current.setVolume(0);
        } catch {}
      }
    }
  };

  const toggleShuffle = () => {
    const next = !isShuffle;
    setIsShuffle(next);
    if (currentSong && queue.length > 1) {
      if (next) {
        setQueue(QueueManager.shuffleWithCurrentPinned(queue, currentSong));
      }
    }
  };

  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIdx = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const addToQueueNext = (song: Song) => {
    setQueue(prev => [prev[0], song, ...prev.slice(1)]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    if (currentSong) {
      setQueue([currentSong]);
    } else {
      setQueue([]);
    }
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    setQueue(prev => QueueManager.reorder(prev, fromIndex, toIndex));
  };

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes ? minutes * 60 : null);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        progress,
        volume,
        isMuted,
        isShuffle,
        shuffle: isShuffle,
        repeatMode,
        repeat: repeatMode,
        queue,
        currentIndex: 0,
        isFullPlayerOpen,
        sleepTimerMinutes,
        sleepTimerRemaining,
        isRadioMode,
        mode: isRadioMode ? 'radio' : 'player',
        isFavorite,
        playSong,
        togglePlayPause,
        togglePlay: togglePlayPause,
        pauseSong,
        resumeSong,
        nextSong,
        previousSong,
        prevSong: previousSong,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        setRepeatMode,
        addToQueue,
        addToQueueNext,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        setFullPlayerOpen,
        setIsFullPlayerOpen: setFullPlayerOpen,
        setSleepTimer,
        toggleFavoriteCurrentSong,
        toggleFavorite
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
