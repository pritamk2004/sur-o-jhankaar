'use client';

import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../../context/PlayerContext';
import { LocalLibraryService, LocalCustomPlaylist } from '../../../lib/indexedDb';
import { Song } from '@sur-o-jhankaar/shared-types';
import { Heart, History, ListMusic, Play, Plus, Trash2, Music } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { clsx } from 'clsx';

export default function LibraryPage() {
  const { playSong } = usePlayer();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'favorites';

  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'playlists'>(
    initialTab === 'favorites' ? 'favorites' : 'history'
  );
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [localPlaylists, setLocalPlaylists] = useState<LocalCustomPlaylist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    const [favs, hist, pls] = await Promise.all([
      LocalLibraryService.getFavorites(),
      LocalLibraryService.getHistory(100),
      LocalLibraryService.getLocalPlaylists()
    ]);
    setFavorites(favs);
    setHistory(hist);
    setLocalPlaylists(pls);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await LocalLibraryService.createLocalPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateModal(false);
    loadLibrary();
  };

  const displayedSongs = activeTab === 'favorites' ? favorites : history;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Device Library</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Zero cloud login required — your favorites and history stay stored securely on this device.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-2 transition-colors self-start"
        >
          <Plus className="w-4 h-4 text-theme-accent" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('favorites')}
          className={clsx(
            'flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'favorites'
              ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
              : 'text-zinc-400 hover:text-white'
          )}
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Liked Songs ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={clsx(
            'flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'history'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white'
          )}
        >
          <History className="w-4 h-4" />
          <span>Recent History ({history.length})</span>
        </button>
      </div>

      {/* Content List */}
      {displayedSongs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedSongs.map((song, i) => (
            <div
              key={`${song.id}-${i}`}
              onClick={() => playSong(song, displayedSongs, i)}
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
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <Music className="w-10 h-10 text-theme-accent mx-auto" />
          <h3 className="text-lg font-bold text-white">
            {activeTab === 'favorites' ? 'No Liked Songs Yet' : 'No Recent History'}
          </h3>
          <p className="text-xs text-zinc-400">
            Start exploring Sur o Jhankaar. Every melody you play and love will be remembered on this device.
          </p>
        </div>
      )}

      {/* New Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 max-w-sm w-full space-y-4 border border-theme-border shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Local Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name (e.g. Late Night Ghazals)"
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-theme-accent text-sm"
              autoFocus
            />
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 py-2 rounded-xl bg-theme-accent text-black text-xs font-bold shadow-glow"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
