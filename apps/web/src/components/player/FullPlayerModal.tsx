'use client';

import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../../context/ThemeContext';
import StoryVisualizer from './StoryVisualizer';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Clock,
  ListMusic,
  FileText,
  Radio,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';

export const FullPlayerModal: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    queue,
    isFullPlayerOpen,
    sleepTimerRemaining,
    isRadioMode,
    isFavorite,
    togglePlayPause,
    nextSong,
    previousSong,
    seekTo,
    toggleShuffle,
    toggleRepeat,
    removeFromQueue,
    setFullPlayerOpen,
    setSleepTimer,
    toggleFavoriteCurrentSong,
    playSong
  } = usePlayer();

  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'visualizer' | 'lyrics' | 'queue'>('visualizer');
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);

  if (!isFullPlayerOpen || !currentSong) return null;

  const isStoryMode = currentSong.kind === 'spoken_word' || currentSong.playlists?.includes('sunday-suspense');

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-3xl overflow-hidden select-none p-6 md:p-12 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={() => setFullPlayerOpen(false)}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Minimize Player"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="text-[11px] uppercase tracking-widest font-extrabold text-theme-accent flex items-center justify-center space-x-1.5">
            {isRadioMode && <Radio className="w-3.5 h-3.5 animate-pulse text-theme-accent" />}
            <span>
              {isRadioMode
                ? 'Vintage Radio Live'
                : isStoryMode
                ? 'Sunday Suspense Audio Drama'
                : 'Now Playing'}
            </span>
          </div>
          <div className="text-xs text-zinc-400 font-mono mt-0.5">
            Theme: {currentTheme?.name || 'Cinematic Gold & Maroon'}
          </div>
        </div>

        {/* Sleep Timer & Tab Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSleepTimerModal(true)}
            className={clsx(
              'p-2.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-colors',
              sleepTimerRemaining
                ? 'bg-amber-500 text-black shadow-glow'
                : 'bg-white/10 hover:bg-white/20 text-zinc-300'
            )}
            title="Sleep Timer"
          >
            <Clock className="w-4 h-4" />
            {sleepTimerRemaining && (
              <span className="font-mono text-[10px]">{Math.ceil(sleepTimerRemaining / 60)}m</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Center Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 my-6 overflow-hidden z-10">
        {/* Left Side: Artwork or Story Visualizer */}
        <div className="w-full max-w-sm md:max-w-md aspect-square flex items-center justify-center relative">
          {isStoryMode ? (
            <StoryVisualizer isPlaying={isPlaying} />
          ) : (
            <div className="relative w-full h-full max-w-[360px] aspect-square rounded-3xl overflow-hidden glass-panel p-3 border-2 border-white/15 shadow-2xl group">
              <div
                className={clsx(
                  'w-full h-full rounded-2xl overflow-hidden relative shadow-glow transition-transform duration-700',
                  isPlaying ? 'rotate-[360deg]' : 'rotate-0'
                )}
                style={{
                  transition: 'transform 30s linear infinite',
                  animationPlayState: isPlaying ? 'running' : 'paused'
                }}
              >
                {currentSong.artworkUrl ? (
                  <Image
                    src={currentSong.artworkUrl}
                    alt={currentSong.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-600 to-amber-950 text-6xl">
                    🎵
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Drawer Tabs (Lyrics / Queue) */}
        <div className="w-full max-w-md h-64 md:h-80 flex flex-col glass-panel rounded-3xl p-5 border border-white/10">
          {/* Tab Selector */}
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('visualizer')}
              className={clsx(
                'px-3 py-1 rounded-xl text-xs font-bold transition-all',
                activeTab === 'visualizer' ? 'bg-theme-accent text-black font-extrabold' : 'text-zinc-400 hover:text-white'
              )}
            >
              Info
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={clsx(
                'px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5',
                activeTab === 'queue' ? 'bg-theme-accent text-black font-extrabold' : 'text-zinc-400 hover:text-white'
              )}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Up Next ({queue.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('lyrics')}
              className={clsx(
                'px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5',
                activeTab === 'lyrics' ? 'bg-theme-accent text-black font-extrabold' : 'text-zinc-400 hover:text-white'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Storyline</span>
            </button>
          </div>

          {/* Tab 1: Info */}
          {activeTab === 'visualizer' && (
            <div className="flex-1 flex flex-col justify-center space-y-3 p-2 overflow-y-auto">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-theme-muted tracking-wider">Song Information</span>
                <h3 className="text-xl font-bold text-white leading-tight">{currentSong.title}</h3>
                <p className="text-sm text-theme-accent font-semibold">{currentSong.displayArtist || currentSong.artists}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-zinc-400 uppercase">Languages</div>
                  <div className="text-xs font-bold text-white mt-0.5">{currentSong.languages?.join(', ') || 'Various'}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-zinc-400 uppercase">Score Ranking</div>
                  <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">{currentSong.score} pts</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Queue */}
          {activeTab === 'queue' && (
            <div className="flex-1 overflow-y-auto space-y-1.5 p-1 pr-2">
              {queue.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className={clsx(
                    'p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors',
                    idx === 0
                      ? 'bg-theme-accent/20 border border-theme-accent/40 text-theme-accent font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                  )}
                >
                  <div
                    className="flex items-center space-x-2.5 min-w-0 flex-1 cursor-pointer"
                    onClick={() => playSong(item, queue, idx)}
                  >
                    <span className="font-mono text-[10px] opacity-60 w-4">{idx + 1}</span>
                    <span className="truncate">{item.title}</span>
                  </div>
                  {idx > 0 && (
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors ml-2"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Storyline */}
          {activeTab === 'lyrics' && (
            <div className="flex-1 overflow-y-auto p-3 text-xs text-zinc-300 leading-relaxed font-serif italic">
              {isStoryMode ? (
                <p>
                  "Darkness descends upon the quiet streets as an unsolved enigma whispers through the misty corridors of Bengal..."
                  <br /><br />
                  Featuring atmospheric ambient audio, authentic vintage radio Foley soundscapes, and gripping dramatization by Mirchi 98.3.
                </p>
              ) : (
                <p>
                  "Har Sur Mein Ek Kahaani" — Every lyric, melody, and rhythm is rooted in timeless Indian cultural heritage.
                  <br /><br />
                  Sing along to the evergreen melody.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="max-w-2xl w-full mx-auto space-y-4 z-10">
        {/* Scrubber Bar */}
        <div className="space-y-1.5">
          <div className="relative w-full h-2 rounded-full bg-white/15 overflow-hidden cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seekTo(pos * duration);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-theme-accent to-amber-300 rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            className={clsx(
              'p-2.5 rounded-full transition-colors',
              isShuffle ? 'text-theme-accent bg-white/10' : 'text-zinc-500 hover:text-white'
            )}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={previousSong}
              className="p-3 rounded-full hover:bg-white/10 text-white transition-transform active:scale-95"
              title="Previous Track"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-theme-accent to-amber-300 text-black flex items-center justify-center shadow-glow hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={nextSong}
              className="p-3 rounded-full hover:bg-white/10 text-white transition-transform active:scale-95"
              title="Next Track"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFavoriteCurrentSong}
              className={clsx(
                'p-2.5 rounded-full transition-colors',
                isFavorite ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 hover:text-white'
              )}
              title="Favorite"
            >
              <Heart className={clsx('w-5 h-5', isFavorite && 'fill-current')} />
            </button>

            <button
              onClick={toggleRepeat}
              className={clsx(
                'p-2.5 rounded-full transition-colors',
                repeatMode !== 'off' ? 'text-theme-accent bg-white/10' : 'text-zinc-500 hover:text-white'
              )}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sleep Timer Picker Modal */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 max-w-xs w-full space-y-3 border border-white/20 shadow-2xl">
            <h4 className="font-bold text-sm text-white text-center">Set Sleep Timer</h4>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[15, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => {
                    setSleepTimer(mins);
                    setShowSleepTimerModal(false);
                  }}
                  className="py-2.5 rounded-xl bg-white/10 hover:bg-theme-accent hover:text-black font-bold text-xs text-white transition-colors"
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setSleepTimer(null);
                setShowSleepTimerModal(false);
              }}
              className="w-full py-2 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-200 text-xs font-bold mt-2"
            >
              Turn Off Timer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullPlayerModal;
