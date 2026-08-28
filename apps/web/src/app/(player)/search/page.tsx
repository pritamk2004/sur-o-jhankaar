'use client';

import React, { useState, useEffect } from 'react';
import { Api } from '../../../lib/api';
import { usePlayer } from '../../../context/PlayerContext';
import { Song, Playlist } from '@sur-o-jhankaar/shared-types';
import { Search, Music, Mic, Play, Sparkles, Layers, Compass } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';

export default function SearchPage() {
  const { playSong } = usePlayer();
  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<'all' | 'songs' | 'playlists' | 'stories'>('all');

  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [spokenWord, setSpokenWord] = useState<Song[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await Api.searchAll(
          query,
          selectedLanguage !== 'All' ? selectedLanguage : undefined,
          30
        );
        if (res) {
          setSongs(res.songs);
          setPlaylists(res.playlists);
          setSpokenWord(res.spokenWord);
          setTotalMatches(res.totalMatches);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, selectedLanguage]);

  const languages = ['All', 'Hindi', 'Bangla', 'Bhojpuri'];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Search Header */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-white">Search Music & Audio Stories</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, singer, artist, or Feluda / Byomkesh stories..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-panel border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20 transition-all text-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
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

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
        {[
          { id: 'all', label: `Top Results (${totalMatches})` },
          { id: 'songs', label: `Songs (${songs.length})` },
          { id: 'playlists', label: `Playlists (${playlists.length})` },
          { id: 'stories', label: `Sunday Suspense (${spokenWord.length})` }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
              activeCategory === cat.id
                ? 'bg-white/20 text-white border border-white/20'
                : 'text-zinc-400 hover:text-white'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results Content */}
      <div className="space-y-8">
        {/* Playlists Section */}
        {(activeCategory === 'all' || activeCategory === 'playlists') && playlists.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-theme-muted flex items-center space-x-2">
              <Layers className="w-4 h-4 text-theme-accent" />
              <span>Matching Playlists</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {playlists.map(pl => (
                <Link
                  key={pl.slug}
                  href={`/playlist/${pl.slug}`}
                  className="glass-card rounded-2xl p-4 space-y-2 block group relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 w-1.5 h-full"
                    style={{ backgroundColor: pl.themeConfig?.accentColor || '#D39B3D' }}
                  />
                  <div className="pl-1">
                    <h4 className="font-bold text-sm text-white group-hover:text-theme-accent transition-colors truncate">
                      {pl.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                      {pl.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Songs Section */}
        {(activeCategory === 'all' || activeCategory === 'songs') && songs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-theme-muted flex items-center space-x-2">
              <Music className="w-4 h-4 text-theme-accent" />
              <span>Matching Songs</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {songs.map((song, i) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song, songs, i)}
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

                  <button className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-theme-accent group-hover:text-black flex items-center justify-center transition-all flex-shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sunday Suspense Audio Stories Section */}
        {(activeCategory === 'all' || activeCategory === 'stories') && spokenWord.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-2">
              <Mic className="w-4 h-4" />
              <span>Sunday Suspense Audio Stories</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {spokenWord.map((story, i) => (
                <div
                  key={story.id}
                  onClick={() => playSong(story, spokenWord, i)}
                  className="glass-card rounded-2xl p-3 flex items-center justify-between cursor-pointer group border-purple-900/30"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-purple-950 flex-shrink-0 flex items-center justify-center text-xl text-purple-300">
                      🕯️
                    </div>
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {story.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {story.displayArtist || story.artists}
                      </p>
                    </div>
                  </div>

                  <button className="w-8 h-8 rounded-full bg-purple-600/30 group-hover:bg-purple-500 text-white flex items-center justify-center transition-all flex-shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && totalMatches === 0 && (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
            <Sparkles className="w-10 h-10 text-theme-accent mx-auto" />
            <h3 className="text-lg font-bold text-white">No results found</h3>
            <p className="text-xs text-zinc-400">
              Try searching with different keywords or switching between Hindi, Bangla, and Bhojpuri.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
