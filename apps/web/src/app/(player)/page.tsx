'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Api } from '../../lib/api';
import { usePlayer } from '../../context/PlayerContext';
import { Playlist, Song } from '@sur-o-jhankaar/shared-types';
import { LocalLibraryService } from '../../lib/indexedDb';
import { Play, Sparkles, Radio as RadioIcon, Flame, Heart, Compass, Music } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { playSong } = usePlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [plData, songRes, history] = await Promise.all([
          Api.getPlaylists(),
          Api.getSongs({ limit: 12, sort: 'score_desc' }),
          LocalLibraryService.getHistory(6)
        ]);
        setPlaylists(plData);
        if (songRes?.songs) setTopSongs(songRes.songs);
        setRecentSongs(history);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-12 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <section className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12 border border-theme-border shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-theme-accent text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ad-Free • Zero-Login • Pure Heritage</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Sur o Jhankaar
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 italic font-serif">
            "Har Sur Mein Ek Kahaani" — Every Melody, a Story.
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Immerse yourself in nostalgic Indian cinema classics, soul-stirring Bengali folk, high-energy Bhojpuri beats, Rabindra Sangeet, and dark mystery Sunday Suspense audio stories.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/radio"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold text-sm shadow-glow flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <RadioIcon className="w-4 h-4" />
              <span>Launch Vintage Radio</span>
            </Link>

            <Link
              href="/mood"
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-theme-accent" />
              <span>Explore Music Mood</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Continue Listening (Local Device History) */}
      {recentSongs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Compass className="w-5 h-5 text-theme-accent" />
              <span>Recently Played</span>
            </h2>
            <Link href="/library" className="text-xs font-semibold text-theme-accent hover:underline">
              View All History
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {recentSongs.map(song => (
              <div
                key={song.id}
                onClick={() => playSong(song, recentSongs)}
                className="glass-card rounded-2xl p-3 cursor-pointer group space-y-2.5"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800">
                  {song.artworkUrl ? (
                    <Image src={song.artworkUrl} alt={song.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎵</div>
                  )}
                  <button className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-theme-accent transition-colors">
                    {song.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {song.displayArtist || song.artists}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured 14 Real Playlists */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <Flame className="w-6 h-6 text-theme-accent" />
              <span>Master Playlists</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              14 curated cultural collections with reactive visual atmospheres
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlists.map((pl, idx) => (
            <motion.div
              key={pl.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Link
                href={`/playlist/${pl.slug}`}
                className="block glass-card rounded-2xl p-5 group relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 w-2 h-full"
                  style={{
                    backgroundColor: pl.themeConfig?.accentColor || '#D39B3D'
                  }}
                />

                <div className="space-y-3 pl-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-theme-accent">
                      {pl.languages?.join(', ') || 'Indian'}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {pl.songCount > 0 ? `${pl.songCount} items` : 'Explore'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-theme-accent transition-colors line-clamp-1">
                      {pl.name}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {pl.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
                    <span className="capitalize italic">{pl.mood_theme?.replace(/_/g, ' ')}</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-theme-accent group-hover:text-black flex items-center justify-center transition-all">
                      <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Melodic Highlights */}
      {topSongs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Music className="w-5 h-5 text-theme-accent" />
            <span>Top Melodic Selections</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topSongs.map((song, i) => (
              <div
                key={song.id}
                onClick={() => playSong(song, topSongs, i)}
                className="glass-card rounded-xl p-3 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-xs font-mono text-zinc-500 w-5 text-right">{i + 1}</span>
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                    {song.artworkUrl ? (
                      <Image src={song.artworkUrl} alt={song.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
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

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {Math.floor((song.durationSeconds || 200) / 60)}:
                    {((song.durationSeconds || 200) % 60).toString().padStart(2, '0')}
                  </span>
                  <button className="p-1.5 rounded-full hover:bg-white/10 text-theme-accent">
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
