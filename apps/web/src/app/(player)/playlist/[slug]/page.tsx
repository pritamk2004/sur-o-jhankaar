'use client';

import React, { useState, useEffect, use } from 'react';
import { Api } from '../../../../lib/api';
import { usePlayer } from '../../../../context/PlayerContext';
import { useTheme } from '../../../../context/ThemeContext';
import { RealTimeClient } from '../../../../lib/socket';
import { Playlist, Song } from '@sur-o-jhankaar/shared-types';
import { Play, Shuffle, Heart, Music, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PlaylistDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const { playSong, toggleFavorite } = usePlayer();
  const { setThemeById } = useTheme();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaylist = async () => {
    try {
      const res = await Api.getPlaylistBySlug(slug);
      if (res) {
        setPlaylist(res.playlist);
        setSongs(res.songs);
        if (res.playlist.mood_theme) {
          setThemeById(res.playlist.mood_theme);
        }
      }
    } catch (err) {
      console.error('Playlist load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();

    // Subscribe to real-time playlist updates
    const leaveRoom = RealTimeClient.joinPlaylistRoom(slug);
    const unbindSongCreated = RealTimeClient.onSongCreated((song: Song) => {
      if (song.playlists?.includes(slug)) {
        setSongs(prev => [song, ...prev]);
      }
    });

    return () => {
      leaveRoom();
      unbindSongCreated();
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="p-10 text-center text-zinc-400 text-sm animate-pulse">
        Loading playlist atmosphere...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Playlist not found</h2>
        <Link href="/" className="inline-block text-xs font-semibold text-theme-accent hover:underline">
          Return Home
        </Link>
      </div>
    );
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Playlists</span>
      </Link>

      {/* Playlist Hero Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6 border border-theme-border shadow-2xl relative overflow-hidden">
        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500 via-amber-800 to-red-950 flex-shrink-0 shadow-glow flex items-center justify-center text-5xl">
          🎵
        </div>

        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-extrabold uppercase tracking-wider text-theme-accent">
              {playlist.languages?.join(', ')} • {playlist.kind === 'spoken_word' ? 'Audio Drama' : 'Master Playlist'}
            </span>
            <span className="text-xs text-theme-muted font-serif italic">
              Theme: {playlist.mood_theme?.replace(/_/g, ' ')}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {playlist.name}
          </h1>

          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            {playlist.description}
          </p>

          <div className="pt-2 flex items-center space-x-4">
            {songs.length > 0 && (
              <>
                <button
                  onClick={() => playSong(songs[0], songs, 0)}
                  className="px-6 py-3 rounded-2xl bg-theme-accent text-black font-bold text-sm shadow-glow flex items-center space-x-2 hover:scale-105 transition-transform"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Play All</span>
                </button>

                <button
                  onClick={() => {
                    const shuffled = [...songs].sort(() => Math.random() - 0.5);
                    playSong(shuffled[0], shuffled, 0);
                  }}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm flex items-center space-x-2 transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Shuffle</span>
                </button>
              </>
            )}
            <span className="text-xs text-zinc-400 font-mono">
              {songs.length} Tracks
            </span>
          </div>
        </div>
      </div>

      {/* Song List Table */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-white/10">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-7 md:col-span-6">Title</div>
          <div className="hidden md:block col-span-3">Artist / Channel</div>
          <div className="col-span-4 md:col-span-2 text-right">Duration</div>
        </div>

        {songs.map((song, idx) => (
          <div
            key={song.id}
            onClick={() => playSong(song, songs, idx)}
            className="grid grid-cols-12 items-center px-4 py-3 rounded-xl glass-card text-xs cursor-pointer group"
          >
            <div className="col-span-1 text-center font-mono text-zinc-400 group-hover:text-theme-accent">
              {idx + 1}
            </div>

            <div className="col-span-7 md:col-span-6 flex items-center space-x-3 min-w-0 pr-2">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                {song.artworkUrl ? (
                  <Image src={song.artworkUrl} alt={song.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs">🎵</div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white truncate group-hover:text-theme-accent transition-colors">
                  {song.title}
                </h4>
                <p className="text-[11px] text-zinc-400 truncate md:hidden">
                  {song.displayArtist || song.artists}
                </p>
              </div>
            </div>

            <div className="hidden md:block col-span-3 text-zinc-300 truncate">
              {song.displayArtist || song.artists}
            </div>

            <div className="col-span-4 md:col-span-2 text-right font-mono text-zinc-400 flex items-center justify-end space-x-3">
              <span>{formatDuration(song.durationSeconds || 240)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(song);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors"
                title="Favorite song"
              >
                <Heart className="w-3.5 h-3.5" />
              </button>
              <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-white/10 hover:bg-theme-accent hover:text-black transition-all">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
