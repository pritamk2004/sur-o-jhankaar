'use client';

import React, { useState, useEffect } from 'react';
import { Api } from '../../../lib/api';
import { getSocketClient } from '../../../lib/socket';
import {
  Upload,
  Music,
  ListMusic,
  Activity,
  CheckCircle,
  AlertTriangle,
  Play,
  Palette,
  Link as LinkIcon,
  RefreshCw,
  LogOut,
  Sparkles,
  Layers,
  XCircle,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CsvPreviewReport, MoodThemeId, Song } from '@sur-o-jhankaar/shared-types';
import { THEME_REGISTRY } from '@sur-o-jhankaar/theme-engine';
import { clsx } from 'clsx';
import Image from 'next/image';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'songs_manager' | 'csv' | 'single' | 'playlist_url' | 'themes'>('overview');

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreviewReport | null>(null);
  const [tempFilePath, setTempFilePath] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ jobId?: string; processed: number; total: number; currentItem?: string } | null>(null);
  const [importCompleteMessage, setImportCompleteMessage] = useState<string>('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Single URL Ingest State
  const [singleUrl, setSingleUrl] = useState('');
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [urlMetadata, setUrlMetadata] = useState<any>(null);
  const [assignedPlaylist, setAssignedPlaylist] = useState('bollywood-melody');

  // Playlist URL Ingest State
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistImporting, setPlaylistImporting] = useState(false);

  // Song Manager & Bulk Ops State
  const [songsList, setSongsList] = useState<Song[]>([]);
  const [songPage, setSongPage] = useState(1);
  const [songTotalPages, setSongTotalPages] = useState(1);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [songFilterPlaylist, setSongFilterPlaylist] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [bulkActionPlaylist, setBulkActionPlaylist] = useState('bollywood-melody');

  useEffect(() => {
    loadStats();

    const socket = getSocketClient();
    socket.emit('join:admin');

    socket.on('import:progress', (data: any) => {
      setImporting(true);
      setImportProgress(data);
      if (data.jobId) setActiveJobId(data.jobId);
    });

    socket.on('import:completed', (data: any) => {
      setImporting(false);
      setPlaylistImporting(false);
      setImportCompleteMessage(`Successfully completed import of ${data.job?.imported || 0} items!`);
      setActiveJobId(null);
      loadStats();
    });

    return () => {
      socket.emit('leave:admin');
      socket.off('import:progress');
      socket.off('import:completed');
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'songs_manager') {
      loadSongs();
    }
  }, [activeTab, songPage, songSearchQuery, songFilterPlaylist]);

  const loadStats = async () => {
    try {
      const data = await Api.getAdminAnalytics();
      setStats(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/admin/login');
      }
    }
  };

  const loadSongs = async () => {
    try {
      const res = await Api.getSongs({
        page: songPage,
        limit: 15,
        query: songSearchQuery || undefined,
        playlist: songFilterPlaylist || undefined
      });
      if (res) {
        setSongsList(res.songs);
        setSongTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Song list load error:', err);
    }
  };

  const handleCsvPreview = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setCsvFile(file);
    try {
      const res = await Api.uploadCsvPreview(file);
      setPreview(res.preview);
      setTempFilePath(res.tempFilePath);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error parsing CSV');
    }
  };

  const handleStartImport = async () => {
    if (!tempFilePath && !csvFile) return;
    setImporting(true);
    setImportCompleteMessage('');
    try {
      const res = await Api.startCsvImport(tempFilePath, csvFile || undefined);
      if (res?.jobId) setActiveJobId(res.jobId);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Import initiation failed');
      setImporting(false);
    }
  };

  const handleFetchSingleUrl = async () => {
    if (!singleUrl.trim()) return;
    setFetchingMetadata(true);
    try {
      const meta = await Api.fetchUrlMetadata(singleUrl);
      setUrlMetadata(meta);
    } catch (err: any) {
      alert('Failed to fetch URL metadata');
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleSaveSingleSong = async () => {
    if (!urlMetadata) return;
    try {
      await Api.importSingleSong({
        url: singleUrl,
        title: urlMetadata.title,
        artists: urlMetadata.artists,
        playlists: [assignedPlaylist]
      });
      alert('Song imported successfully!');
      setUrlMetadata(null);
      setSingleUrl('');
      loadStats();
    } catch (err: any) {
      alert('Failed to import song');
    }
  };

  const handleStartPlaylistUrlImport = async () => {
    if (!playlistUrl.trim()) return;
    setPlaylistImporting(true);
    setImportCompleteMessage('');
    try {
      const res = await Api.startPlaylistUrlImport(playlistUrl.trim());
      if (res?.jobId) setActiveJobId(res.jobId);
      setPlaylistUrl('');
    } catch (err: any) {
      alert('Failed to start playlist import');
      setPlaylistImporting(false);
    }
  };

  const handleCancelJob = async () => {
    if (!activeJobId) return;
    try {
      await Api.cancelImportJob(activeJobId);
      setImporting(false);
      setPlaylistImporting(false);
      setActiveJobId(null);
      alert('Import job cancelled');
    } catch {
      alert('Could not cancel job');
    }
  };

  const handleSelectSong = (id: string) => {
    setSelectedSongIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllSongs = () => {
    if (selectedSongIds.length === songsList.length) {
      setSelectedSongIds([]);
    } else {
      setSelectedSongIds(songsList.map(s => s.id));
    }
  };

  const handleBulkAssignPlaylist = async () => {
    if (selectedSongIds.length === 0) return;
    try {
      await Api.bulkUpdateSongs(selectedSongIds, {
        $addToSet: { playlists: bulkActionPlaylist }
      });
      alert(`Assigned ${selectedSongIds.length} songs to ${bulkActionPlaylist}!`);
      setSelectedSongIds([]);
      loadSongs();
    } catch (err) {
      alert('Bulk update failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSongIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedSongIds.length} songs?`)) return;
    try {
      await Api.bulkDeleteSongs(selectedSongIds);
      setSelectedSongIds([]);
      loadSongs();
      loadStats();
    } catch (err) {
      alert('Bulk delete failed');
    }
  };

  const handleUpdateSong = async () => {
    if (!editingSong) return;
    try {
      await Api.updateSong(editingSong.id, {
        title: editingSong.title,
        displayArtist: editingSong.displayArtist,
        score: editingSong.score,
        songTheme: editingSong.songTheme
      });
      setEditingSong(null);
      loadSongs();
    } catch {
      alert('Failed to update song');
    }
  };

  const handleDeleteSingleSong = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    try {
      await Api.deleteSong(id);
      loadSongs();
      loadStats();
    } catch {
      alert('Failed to delete song');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sur_admin_access_token');
    router.push('/admin/login');
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            Admin Management Console
          </div>
          <h1 className="text-3xl font-black text-white">Sur o Jhankaar Portal</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              loadStats();
              if (activeTab === 'songs_manager') loadSongs();
            }}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'overview', label: 'Overview & Telemetry', icon: Activity },
          { id: 'songs_manager', label: 'Library Management & Bulk Ops', icon: Music },
          { id: 'csv', label: 'CSV Batch Import', icon: Upload },
          { id: 'single', label: 'Single Song URL', icon: LinkIcon },
          { id: 'playlist_url', label: 'Playlist URL Batch Ingest', icon: Layers },
          { id: 'themes', label: 'Theme Matrix', icon: Palette }
        ].map(t => {
          const Icon = t.icon;
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={clsx(
                'flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
                isSelected
                  ? 'bg-theme-accent text-black shadow-glow font-extrabold'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
              <div className="text-xs text-zinc-400 uppercase font-semibold">Total Songs in Library</div>
              <div className="text-3xl font-black text-white">{stats.totalSongs}</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
              <div className="text-xs text-zinc-400 uppercase font-semibold">Master Playlists</div>
              <div className="text-3xl font-black text-amber-400">{stats.totalPlaylists}</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
              <div className="text-xs text-zinc-400 uppercase font-semibold">Sunday Suspense Stories</div>
              <div className="text-3xl font-black text-purple-400">{stats.spokenWordCount}</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
              <div className="text-xs text-zinc-400 uppercase font-semibold">Total Playback Sessions</div>
              <div className="text-3xl font-black text-emerald-400">{stats.totalPlays}</div>
            </div>
          </div>

          {/* Language Breakdown */}
          {stats.languageDistribution && (
            <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white">Language Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.languageDistribution.map((item: any) => (
                  <div key={item.language} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs text-zinc-400">{item.language}</div>
                    <div className="text-2xl font-bold text-white mt-1">{item.count} items</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Song Library Manager & Bulk Actions */}
      {activeTab === 'songs_manager' && (
        <div className="space-y-6">
          {/* Controls & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={songSearchQuery}
                  onChange={e => {
                    setSongSearchQuery(e.target.value);
                    setSongPage(1);
                  }}
                  placeholder="Search library songs..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-theme-accent"
                />
              </div>

              <select
                value={songFilterPlaylist}
                onChange={e => {
                  setSongFilterPlaylist(e.target.value);
                  setSongPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs"
              >
                <option value="">All Playlists</option>
                <option value="bollywood-melody">Bollywood Melody</option>
                <option value="hindi-evergreen">Hindi Evergreen</option>
                <option value="roadside-nostalgia">Roadside Nostalgia</option>
                <option value="bhojpuri-hits">Bhojpuri Hits</option>
                <option value="bengali-folk">Bengali Folk</option>
                <option value="manbhum">Manbhum</option>
                <option value="modern-bengali">Modern Bengali</option>
                <option value="bengali-evergreen">Bengali Evergreen</option>
                <option value="old-bengali-melody">Old Bengali Melody</option>
                <option value="sangeet-bangla-era">Sangeet Bangla Era</option>
                <option value="rabindra-sangeet">Rabindra Sangeet</option>
                <option value="shyama-sangeet">Shyama Sangeet</option>
                <option value="durga-pujo-special">Durga Pujo Special</option>
                <option value="sunday-suspense">Sunday Suspense</option>
              </select>
            </div>

            {/* Bulk Selection Actions */}
            {selectedSongIds.length > 0 && (
              <div className="flex items-center space-x-3 p-2 rounded-xl bg-theme-accent/10 border border-theme-accent/30 text-xs">
                <span className="font-bold text-theme-accent">
                  {selectedSongIds.length} selected
                </span>
                <select
                  value={bulkActionPlaylist}
                  onChange={e => setBulkActionPlaylist(e.target.value)}
                  className="px-2 py-1 rounded bg-black border border-white/20 text-white text-xs"
                >
                  <option value="bollywood-melody">Bollywood Melody</option>
                  <option value="hindi-evergreen">Hindi Evergreen</option>
                  <option value="roadside-nostalgia">Roadside Nostalgia</option>
                  <option value="bhojpuri-hits">Bhojpuri Hits</option>
                  <option value="bengali-folk">Bengali Folk</option>
                  <option value="manbhum">Manbhum</option>
                  <option value="modern-bengali">Modern Bengali</option>
                  <option value="bengali-evergreen">Bengali Evergreen</option>
                  <option value="old-bengali-melody">Old Bengali Melody</option>
                  <option value="sangeet-bangla-era">Sangeet Bangla Era</option>
                  <option value="rabindra-sangeet">Rabindra Sangeet</option>
                  <option value="shyama-sangeet">Shyama Sangeet</option>
                  <option value="durga-pujo-special">Durga Pujo Special</option>
                  <option value="sunday-suspense">Sunday Suspense</option>
                </select>
                <button
                  onClick={handleBulkAssignPlaylist}
                  className="px-3 py-1 rounded bg-theme-accent text-black font-bold"
                >
                  Assign Playlist
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 rounded bg-red-600/80 text-white font-bold hover:bg-red-600"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          {/* Songs Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden glass-panel">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <button onClick={handleSelectAllSongs}>
                      {selectedSongIds.length === songsList.length && songsList.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-theme-accent" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Singer / Artist</th>
                  <th className="p-3.5">Playlists</th>
                  <th className="p-3.5">Languages</th>
                  <th className="p-3.5 text-center">Score</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {songsList.map(song => {
                  const isSelected = selectedSongIds.includes(song.id);
                  return (
                    <tr key={song.id} className={clsx('hover:bg-white/5 transition-colors', isSelected && 'bg-theme-accent/5')}>
                      <td className="p-3.5 text-center">
                        <button onClick={() => handleSelectSong(song.id)}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-theme-accent" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-500" />
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 font-bold text-white max-w-xs truncate">{song.title}</td>
                      <td className="p-3.5 max-w-xs truncate text-zinc-400">{song.displayArtist || song.artists}</td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {song.playlists?.map(p => (
                            <span key={p} className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-amber-300 font-mono">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold text-emerald-400">
                          {song.languages?.join(', ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-theme-accent">{song.score}</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setEditingSong(song)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-theme-accent hover:text-black transition-colors"
                          title="Edit Song"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSingleSong(song.id)}
                          className="p-1.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete Song"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Page {songPage} of {songTotalPages}</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={songPage <= 1}
                onClick={() => setSongPage(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={songPage >= songTotalPages}
                onClick={() => setSongPage(prev => Math.min(songTotalPages, prev + 1))}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Edit Song Dialog */}
          {editingSong && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="glass-panel rounded-3xl p-6 max-w-md w-full space-y-4 border border-theme-border shadow-2xl">
                <h3 className="text-lg font-bold text-white">Edit Song Metadata</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-theme-muted">Title</label>
                    <input
                      type="text"
                      value={editingSong.title}
                      onChange={e => setEditingSong({ ...editingSong, title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-theme-muted">Display Artist / Singer</label>
                    <input
                      type="text"
                      value={editingSong.displayArtist || editingSong.artists}
                      onChange={e => setEditingSong({ ...editingSong, displayArtist: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-theme-muted">Radio Ranking Score (1-100)</label>
                    <input
                      type="number"
                      value={editingSong.score}
                      onChange={e => setEditingSong({ ...editingSong, score: parseFloat(e.target.value) || 50 })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setEditingSong(null)}
                    className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSong}
                    className="flex-1 py-2 rounded-xl bg-theme-accent text-black text-xs font-bold shadow-glow"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: CSV Import */}
      {activeTab === 'csv' && (
        <div className="space-y-6 max-w-4xl">
          <div className="glass-panel rounded-3xl p-8 border border-theme-border space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Import Master Library CSV</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Upload <code className="text-amber-300">master_library.csv</code> containing 1,894 rows across 14 playlists.
              </p>
            </div>

            <div className="border-2 border-dashed border-white/20 hover:border-theme-accent rounded-3xl p-8 text-center space-y-3 cursor-pointer transition-colors bg-white/5 relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvPreview}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-theme-accent mx-auto" />
              <h4 className="font-bold text-sm text-white">
                {csvFile ? csvFile.name : 'Click to select or drag master_library.csv here'}
              </h4>
              <p className="text-xs text-zinc-400">
                Supports schema: <code className="text-zinc-300">title,artists,album,duration_seconds,kind,playlists,score,youtube_url,spotify_url</code>
              </p>
            </div>

            {preview && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>CSV File Analysis Preview</span>
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-zinc-400 uppercase">Total Rows Detected</div>
                    <div className="text-xl font-bold text-white mt-0.5">{preview.totalDetected}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-zinc-400 uppercase">Playlists Mapped</div>
                    <div className="text-xl font-bold text-amber-400">{preview.playlistsDetected?.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-zinc-400 uppercase">Valid Ingestion Rows</div>
                    <div className="text-xl font-bold text-emerald-400">{preview.validCount}</div>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-3 space-y-1.5 text-xs font-mono">
                  <div className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1">
                    Detected Playlist Counts:
                  </div>
                  {preview.playlistsDetected?.map(p => (
                    <div key={p.slug} className="flex justify-between text-zinc-300">
                      <span>{p.name} ({p.slug})</span>
                      <span className="font-bold text-amber-300">{p.count}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStartImport}
                  disabled={importing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-extrabold text-sm shadow-glow hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                  {importing ? 'Processing Import...' : 'Confirm & Start Live Batch Ingestion'}
                </button>
              </div>
            )}

            {/* Live Progress Bar */}
            {importing && importProgress && (
              <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                <div className="flex justify-between text-xs font-bold text-amber-300">
                  <span>Importing: {importProgress.currentItem || 'Processing...'}</span>
                  <span>
                    {importProgress.processed} / {importProgress.total} (
                    {Math.round((importProgress.processed / (importProgress.total || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{
                      width: `${(importProgress.processed / (importProgress.total || 1)) * 100}%`
                    }}
                  />
                </div>
                {activeJobId && (
                  <button
                    onClick={handleCancelJob}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Running Job</span>
                  </button>
                )}
              </div>
            )}

            {importCompleteMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{importCompleteMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Single URL Ingest */}
      {activeTab === 'single' && (
        <div className="space-y-6 max-w-2xl">
          <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white">Add Song by Public URL</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Paste a public YouTube, Spotify, or Direct Audio link.
              </p>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={singleUrl}
                onChange={e => setSingleUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-theme-accent"
              />
              <button
                onClick={handleFetchSingleUrl}
                disabled={fetchingMetadata}
                className="px-5 py-2.5 rounded-xl bg-theme-accent text-black font-bold text-xs shadow-glow disabled:opacity-50"
              >
                {fetchingMetadata ? 'Fetching...' : 'Fetch'}
              </button>
            </div>

            {urlMetadata && (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-theme-muted">Title Override</label>
                  <input
                    type="text"
                    value={urlMetadata.title}
                    onChange={e => setUrlMetadata({ ...urlMetadata, title: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-theme-muted">Display Artist Override</label>
                  <input
                    type="text"
                    value={urlMetadata.artists}
                    onChange={e => setUrlMetadata({ ...urlMetadata, artists: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-theme-muted">Assign Playlist</label>
                  <select
                    value={assignedPlaylist}
                    onChange={e => setAssignedPlaylist(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                  >
                    <option value="bollywood-melody">Bollywood Melody</option>
                    <option value="hindi-evergreen">Hindi Evergreen</option>
                    <option value="roadside-nostalgia">Roadside Nostalgia</option>
                    <option value="bhojpuri-hits">Bhojpuri Hits</option>
                    <option value="bengali-folk">Bengali Folk</option>
                    <option value="manbhum">Manbhum</option>
                    <option value="modern-bengali">Modern Bengali</option>
                    <option value="bengali-evergreen">Bengali Evergreen</option>
                    <option value="old-bengali-melody">Old Bengali Melody</option>
                    <option value="sangeet-bangla-era">Sangeet Bangla Era</option>
                    <option value="rabindra-sangeet">Rabindra Sangeet</option>
                    <option value="shyama-sangeet">Shyama Sangeet</option>
                    <option value="durga-pujo-special">Durga Pujo Special</option>
                    <option value="sunday-suspense">Sunday Suspense</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveSingleSong}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg"
                >
                  Save to Music Library
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Playlist URL Ingest */}
      {activeTab === 'playlist_url' && (
        <div className="space-y-6 max-w-2xl">
          <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white">Import Entire Playlist by URL</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Paste a public YouTube or Spotify playlist URL. The background job will extract all tracks, map theme & languages, and attach to the library.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={playlistUrl}
                onChange={e => setPlaylistUrl(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=PL..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-theme-accent"
              />
              <button
                onClick={handleStartPlaylistUrlImport}
                disabled={playlistImporting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold text-xs shadow-glow disabled:opacity-50 hover:scale-[1.01] transition-transform"
              >
                {playlistImporting ? 'Ingesting Playlist...' : 'Queue Async Playlist Import'}
              </button>
            </div>

            {playlistImporting && importProgress && (
              <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                <div className="flex justify-between text-xs font-bold text-amber-300">
                  <span>Track: {importProgress.currentItem || 'Processing...'}</span>
                  <span>{importProgress.processed} / {importProgress.total}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{
                      width: `${(importProgress.processed / (importProgress.total || 1)) * 100}%`
                    }}
                  />
                </div>
                {activeJobId && (
                  <button
                    onClick={handleCancelJob}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Ingestion</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Themes Matrix */}
      {activeTab === 'themes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(THEME_REGISTRY).map(theme => (
            <div
              key={theme.id}
              className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-white">{theme.name}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-theme-muted uppercase">
                  {theme.animation}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{theme.description}</p>
              <div className="flex items-center space-x-2 pt-2">
                {theme.palette.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-lg border border-white/20 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
