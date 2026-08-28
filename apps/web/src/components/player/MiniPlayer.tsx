'use client';

import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  Play,
  Pause,
  SkipForward,
  Heart,
  Volume2,
  VolumeX,
  Maximize2,
  Radio
} from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';

export const MiniPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isRadioMode,
    isFavorite,
    togglePlayPause,
    nextSong,
    setVolume,
    toggleMute,
    setFullPlayerOpen,
    toggleFavoriteCurrentSong,
    seekTo
  } = usePlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isStoryMode = currentSong.kind === 'spoken_word';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 shadow-2xl transition-all select-none">
      {/* Top Scrubber Line */}
      <div
        className="w-full h-1 bg-white/10 cursor-pointer hover:h-2 transition-all relative group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          seekTo(pos * duration);
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-theme-accent to-amber-300 transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left Side: Artwork & Title */}
        <div
          className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
          onClick={() => setFullPlayerOpen(true)}
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 shadow-md">
            {currentSong.artworkUrl ? (
              <Image
                src={currentSong.artworkUrl}
                alt={currentSong.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg bg-amber-900/40 text-amber-300">
                {isStoryMode ? '🕯️' : '🎵'}
              </div>
            )}
          </div>

          <div className="min-w-0 pr-2">
            <div className="flex items-center space-x-1.5">
              {isRadioMode && <Radio className="w-3 h-3 text-theme-accent animate-pulse" />}
              <h4 className="text-xs font-bold text-white truncate hover:text-theme-accent transition-colors">
                {currentSong.title}
              </h4>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {currentSong.displayArtist || currentSong.artists}
            </p>
          </div>
        </div>

        {/* Center: Transport Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFavoriteCurrentSong}
            className={clsx(
              'p-2 rounded-full transition-colors hidden sm:block',
              isFavorite ? 'text-red-500 bg-red-500/10' : 'text-zinc-400 hover:text-white'
            )}
            title="Favorite"
          >
            <Heart className={clsx('w-4 h-4', isFavorite && 'fill-current')} />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-theme-accent text-black flex items-center justify-center shadow-glow hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={nextSong}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Volume & Expand */}
        <div className="flex items-center space-x-2">
          {/* Volume Control */}
          <div className="relative hidden md:flex items-center space-x-1.5">
            <button
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {showVolumeSlider && (
              <div
                onMouseLeave={() => setShowVolumeSlider(false)}
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-3 rounded-2xl glass-panel border border-white/15 shadow-xl flex items-center"
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-theme-accent h-1.5 cursor-pointer"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setFullPlayerOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Open Full Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
