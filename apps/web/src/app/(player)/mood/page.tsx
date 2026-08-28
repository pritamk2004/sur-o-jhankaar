'use client';

import React, { useState, useEffect } from 'react';
import { Api } from '../../../lib/api';
import { usePlayer } from '../../../context/PlayerContext';
import { useTheme } from '../../../context/ThemeContext';
import { Song } from '@sur-o-jhankaar/shared-types';
import { Sparkles, Play, Shuffle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import Image from 'next/image';

interface MoodCard {
  slug: string;
  name: string;
  icon: string;
  gradient: string;
  themeId: string;
  tagline: string;
}

const MOODS: MoodCard[] = [
  { slug: 'romantic', name: 'Romantic', icon: '💖', gradient: 'from-pink-900 via-red-900 to-amber-900', themeId: 'cinematic_gold_maroon', tagline: 'Tender Bollywood & Bangla love ballads' },
  { slug: 'nostalgic', name: 'Nostalgic', icon: '📻', gradient: 'from-amber-950 via-stone-900 to-amber-900', themeId: 'sepia_ivory_gramophone', tagline: 'Vintage gramophone & golden era cassettes' },
  { slug: 'peaceful', name: 'Peaceful', icon: '🍃', gradient: 'from-emerald-950 via-teal-950 to-stone-900', themeId: 'cream_green_tagore', tagline: 'Rabindra Sangeet & gentle acoustic reverie' },
  { slug: 'energetic', name: 'Energetic & Festive', icon: '🔥', gradient: 'from-orange-950 via-red-950 to-amber-900', themeId: 'vibrant_folk_festival', tagline: 'Bhojpuri celebration rhythms and upbeat folk' },
  { slug: 'late_night', name: 'Late Night', icon: '🌙', gradient: 'from-indigo-950 via-purple-950 to-slate-950', themeId: 'neon_teal_purple_city', tagline: 'City-night glow, soulful lo-fi & indie vibes' },
  { slug: 'devotional', name: 'Devotional & Divine', icon: '🪔', gradient: 'from-red-950 via-amber-950 to-yellow-950', themeId: 'deep_red_gold_temple', tagline: 'Durga Pujo Dhaak & sacred Shyama Sangeet' },
  { slug: 'travel', name: 'Road Trip & Highway', icon: '🚗', gradient: 'from-yellow-950 via-stone-900 to-amber-950', themeId: 'dusty_sepia_vhs', tagline: 'Dhabas, truck journeys & roadside memories' },
  { slug: 'stories', name: 'Midnight Mysteries', icon: '🕯️', gradient: 'from-zinc-950 via-neutral-900 to-black', themeId: 'near_black_story_spotlight', tagline: 'Sunday Suspense audio drama in the dark' }
];

export default function MoodPage() {
  const { playSong, toggleFavorite } = usePlayer();
  const { setThemeById } = useTheme();
  const [activeMood, setActiveMood] = useState<MoodCard>(MOODS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [moodSongs, setMoodSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const languages = ['All', 'Hindi', 'Bangla', 'Bhojpuri'];

  useEffect(() => {
    async function loadMoodSongs() {
      setLoading(true);
      try {
        setThemeById(activeMood.themeId as any);
        const res = await Api.getMoodSongs(
          activeMood.slug,
          selectedLanguage !== 'All' ? selectedLanguage : undefined
        );
        if (res?.songs) setMoodSongs(res.songs);
      } catch (err) {
        console.error('Mood fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMoodSongs();
  }, [activeMood, selectedLanguage]);

  const handleShufflePlay = () => {
    if (moodSongs.length === 0) return;
    const shuffled = [...moodSongs].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled, 0, false);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 select-none">
      {/* Mood Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-theme-accent text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dynamic Atmosphere Discovery</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">Music Mood</h1>
        <p className="text-sm text-zinc-400 max-w-xl">
          Pick your current emotional vibe. Sur o Jhankaar transforms its visual personality, dynamic shaders, and music selection in real time.
        </p>

        {/* Language Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                selectedLanguage === lang
                  ? 'bg-theme-accent text-black shadow-glow font-bold'
                  : 'bg-white/10 text-zinc-300 hover:bg-white/20'
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Selection Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MOODS.map(mood => {
          const isSelected = activeMood.slug === mood.slug;
          return (
            <motion.button
              key={mood.slug}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveMood(mood)}
              className={clsx(
                'relative text-left p-5 rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between h-36 bg-gradient-to-br shadow-lg',
                mood.gradient,
                isSelected
                  ? 'border-theme-accent ring-2 ring-theme-accent/40 shadow-glow'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              <div className="text-2xl">{mood.icon}</div>
              <div>
                <h3 className="font-extrabold text-base text-white">{mood.name}</h3>
                <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5 opacity-80">
                  {mood.tagline}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Mood Songs Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>{activeMood.icon}</span>
              <span>{activeMood.name} Selections ({moodSongs.length})</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">{activeMood.tagline}</p>
          </div>

          {moodSongs.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShufflePlay}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-2 transition-colors"
                title="Shuffle All Mood Songs"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle</span>
              </button>

              <button
                onClick={() => playSong(moodSongs[0], moodSongs, 0, false)}
                className="px-5 py-2.5 rounded-xl bg-theme-accent text-black font-bold text-xs shadow-glow flex items-center space-x-2 hover:scale-105 transition-transform"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play All</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-400 text-sm animate-pulse">
            Loading mood harmonies...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {moodSongs.map((song, i) => (
              <div
                key={song.id}
                onClick={() => playSong(song, moodSongs, i, false)}
                className="glass-card rounded-2xl p-3 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                    {song.artworkUrl ? (
                      <Image src={song.artworkUrl} alt={song.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🎵</div>
                    )}
                  </div>
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-theme-accent transition-colors">
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {song.displayArtist || song.artists}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song);
                    }}
                    className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>

                  <button className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-theme-accent group-hover:text-black flex items-center justify-center transition-all">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
