import axios from 'axios';
import { ApiResponse, Song, Playlist, MoodThemeId } from '@sur-o-jhankaar/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Admin Access Token if present
apiClient.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sur_admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const DEFAULT_PLAYLISTS: Playlist[] = [
  { id: '1', name: 'Bollywood Melody', slug: 'bollywood-melody', description: 'Timeless romantic and soul-stirring Bollywood melodies from the golden era to the modern age.', languages: ['Hindi'], genres: ['bollywood'], moods: ['romantic'], mood_theme: 'cinematic_gold_maroon', songCount: 207, kind: 'music' as any, isFeatured: true, sortOrder: 1, isActive: true, isPublic: true },
  { id: '2', name: 'Hindi Evergreen', slug: 'hindi-evergreen', description: 'Nostalgic golden era gems, legendary classics, and timeless melodies of Indian cinema.', languages: ['Hindi'], genres: ['classic_bollywood'], moods: ['nostalgic'], mood_theme: 'cinematic_gold_maroon', songCount: 99, kind: 'music' as any, isFeatured: true, sortOrder: 2, isActive: true, isPublic: true },
  { id: '3', name: 'Roadside Nostalgia', slug: 'roadside-nostalgia', description: 'Dhabas, highway truck trips, cassette tapes, and dusty journey memories across India.', languages: ['Hindi'], genres: ['retro_pop'], moods: ['nostalgic'], mood_theme: 'dusty_sepia_vhs', songCount: 82, kind: 'music' as any, isFeatured: true, sortOrder: 3, isActive: true, isPublic: true },
  { id: '4', name: 'Bhojpuri Hits', slug: 'bhojpuri-hits', description: 'High-voltage folk energy, vibrant stage rhythm, and chart-topping Bhojpuri celebratory songs.', languages: ['Bhojpuri'], genres: ['bhojpuri'], moods: ['energetic'], mood_theme: 'vibrant_folk_festival', songCount: 129, kind: 'music' as any, isFeatured: true, sortOrder: 4, isActive: true, isPublic: true },
  { id: '5', name: 'Bengali Folk', slug: 'bengali-folk', description: 'Baul, Bhatiyali, Lalon geeti, and the soulful river songs celebrating Bengal\'s soil and soul.', languages: ['Bangla'], genres: ['folk'], moods: ['peaceful'], mood_theme: 'earthy_terracotta_river', songCount: 121, kind: 'music' as any, isFeatured: true, sortOrder: 5, isActive: true, isPublic: true },
  { id: '6', name: 'Manbhum, Purulia & Bankura', slug: 'manbhum', description: 'Raw, spirited Jhumur, Tusu, and Bhadu folk traditions from the red-soil heartlands of Bengal.', languages: ['Bangla'], genres: ['jhumur'], moods: ['energetic'], mood_theme: 'earthy_terracotta_river', songCount: 122, kind: 'music' as any, isFeatured: false, sortOrder: 6, isActive: true, isPublic: true },
  { id: '7', name: 'Modern Bengali', slug: 'modern-bengali', description: 'Urban indie rhythms, Coke Studio Bangla fusion, Bangla rock, and contemporary poetic pop.', languages: ['Bangla'], genres: ['indie_pop'], moods: ['chill'], mood_theme: 'neon_teal_purple_city', songCount: 212, kind: 'music' as any, isFeatured: true, sortOrder: 7, isActive: true, isPublic: true },
  { id: '8', name: 'Bengali Evergreen', slug: 'bengali-evergreen', description: 'Evergreen cinematic hits, memorable movie love songs, and iconic studio compositions.', languages: ['Bangla'], genres: ['cinema_modern'], moods: ['romantic'], mood_theme: 'sepia_ivory_gramophone', songCount: 160, kind: 'music' as any, isFeatured: false, sortOrder: 8, isActive: true, isPublic: true },
  { id: '9', name: 'Old Bengali Melody', slug: 'old-bengali-melody', description: 'Vintage gramophone classics by Hemanta, Manna Dey, Kishore, Sandhya, and RD Burman.', languages: ['Bangla'], genres: ['gramophone_classic'], moods: ['nostalgic'], mood_theme: 'sepia_ivory_gramophone', songCount: 214, kind: 'music' as any, isFeatured: true, sortOrder: 9, isActive: true, isPublic: true },
  { id: '10', name: 'Sangeet Bangla Era', slug: 'sangeet-bangla-era', description: 'The golden 2000s-2010s era of commercial Bengali film songs, television hits, and youth anthems.', languages: ['Bangla'], genres: ['bengali_film'], moods: ['happy'], mood_theme: 'deep_indigo_radio', songCount: 246, kind: 'music' as any, isFeatured: true, sortOrder: 10, isActive: true, isPublic: true },
  { id: '11', name: 'Rabindra Sangeet', slug: 'rabindra-sangeet', description: 'Poetic, meditative, and eternal Tagore compositions rendered with pristine acoustic nuance.', languages: ['Bangla'], genres: ['rabindra_sangeet'], moods: ['peaceful'], mood_theme: 'cream_green_tagore', songCount: 83, kind: 'music' as any, isFeatured: true, sortOrder: 11, isActive: true, isPublic: true },
  { id: '12', name: 'Shyama Sangeet', slug: 'shyama-sangeet', description: 'Devotional hymns and Ramprasadi songs dedicated to Goddess Kali, drenched in pure surrender.', languages: ['Bangla'], genres: ['devotional'], moods: ['devotional'], mood_theme: 'deep_red_gold_temple', songCount: 75, kind: 'music' as any, isFeatured: false, sortOrder: 12, isActive: true, isPublic: true },
  { id: '13', name: 'Durga Pujo Special', slug: 'durga-pujo-special', description: 'Resounding dhaak beats, Agomoni songs, and festive celebration anthems for Sharodiya Durga Pujo.', languages: ['Bangla'], genres: ['festive'], moods: ['devotional'], mood_theme: 'deep_red_gold_temple', songCount: 92, kind: 'music' as any, isFeatured: true, sortOrder: 13, isActive: true, isPublic: true },
  { id: '14', name: 'Sunday Suspense', slug: 'sunday-suspense', description: 'Immersive Bengali audio stories, detective mysteries, Feluda, Byomkesh, and thrilling adventures.', languages: ['Bangla'], genres: ['audio_drama'], moods: ['focus'], mood_theme: 'near_black_story_spotlight', songCount: 149, kind: 'spoken_word' as any, isFeatured: true, sortOrder: 14, isActive: true, isPublic: true }
];

export class Api {
  // Public Music Endpoints
  public static async getSongs(params: any = {}) {
    try {
      const res = await apiClient.get<ApiResponse<{ songs: Song[]; total: number; totalPages: number }>>('/songs', { params });
      return res.data.data;
    } catch {
      return { songs: [], total: 0, totalPages: 0 };
    }
  }

  public static async getSongById(id: string) {
    const res = await apiClient.get<ApiResponse<Song>>(`/songs/${id}`);
    return res.data.data;
  }

  public static async searchAll(query: string, language?: string, limit = 20) {
    try {
      const res = await apiClient.get<ApiResponse<{
        query: string;
        songs: Song[];
        playlists: Playlist[];
        spokenWord: Song[];
        totalMatches: number;
      }>>('/search', {
        params: { query, language, limit }
      });
      return res.data.data;
    } catch {
      return { query, songs: [], playlists: [], spokenWord: [], totalMatches: 0 };
    }
  }

  public static async recordPlayback(songId: string, playlistSlug?: string, source = 'player') {
    try {
      return await apiClient.post('/songs/playback', { songId, playlistSlug, source });
    } catch {
      return null;
    }
  }

  public static async getPlaylists(params: any = {}) {
    try {
      const res = await apiClient.get<ApiResponse<Playlist[]>>('/playlists', { params });
      if (res.data.data && res.data.data.length > 0) return res.data.data;
      return DEFAULT_PLAYLISTS;
    } catch {
      return DEFAULT_PLAYLISTS;
    }
  }

  public static async getPlaylistBySlug(slug: string) {
    try {
      const res = await apiClient.get<ApiResponse<{ playlist: Playlist; songs: Song[] }>>(`/playlists/${slug}`);
      return res.data.data;
    } catch {
      const fallback = DEFAULT_PLAYLISTS.find(p => p.slug === slug) || DEFAULT_PLAYLISTS[0];
      return { playlist: fallback, songs: [] };
    }
  }

  public static async getMoods() {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/moods');
      return res.data.data || [];
    } catch {
      return [];
    }
  }

  public static async getMoodSongs(moodSlug: string, language?: string) {
    try {
      const res = await apiClient.get<ApiResponse<{ mood: any; theme: any; songs: Song[] }>>(`/moods/${moodSlug}/songs`, {
        params: { language }
      });
      return res.data.data;
    } catch {
      return { mood: null, theme: null, songs: [] };
    }
  }

  public static async getRadioStations() {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/radio/stations');
      return res.data.data || [];
    } catch {
      return [];
    }
  }

  public static async getNextRadioTrack(payload: any) {
    try {
      const res = await apiClient.post<ApiResponse<{ song: Song | null; remainingCandidates: number }>>('/radio/next', payload);
      return res.data.data;
    } catch {
      return { song: null, remainingCandidates: 0 };
    }
  }

  public static async getThemes() {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/themes');
      return res.data.data || [];
    } catch {
      return [];
    }
  }

  // Admin Auth & Ingestion
  public static async adminLogin(credentials: { email: string; password: string }) {
    const res = await apiClient.post<ApiResponse<any>>('/auth/admin/login', credentials);
    if (res.data.data?.tokens?.accessToken) {
      localStorage.setItem('sur_admin_access_token', res.data.data.tokens.accessToken);
    }
    return res.data.data;
  }

  public static async getAdminAnalytics() {
    const res = await apiClient.get<ApiResponse<any>>('/admin/analytics');
    return res.data.data;
  }

  public static async uploadCsvPreview(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<any>>('/admin/import/csv/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  }

  public static async startCsvImport(tempFilePath?: string, file?: File) {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post<ApiResponse<any>>('/admin/import/csv/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.data;
    } else {
      const res = await apiClient.post<ApiResponse<any>>('/admin/import/csv/start', { tempFilePath });
      return res.data.data;
    }
  }

  public static async fetchUrlMetadata(url: string) {
    const res = await apiClient.post<ApiResponse<any>>('/admin/import/url/fetch', { url });
    return res.data.data;
  }

  public static async importSingleSong(data: any) {
    const res = await apiClient.post<ApiResponse<Song>>('/admin/import/url/song', data);
    return res.data.data;
  }

  public static async startPlaylistUrlImport(url: string) {
    const res = await apiClient.post<ApiResponse<any>>('/admin/import/url/playlist', { url });
    return res.data.data;
  }

  public static async cancelImportJob(jobId: string) {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/import/jobs/${jobId}/cancel`);
    return res.data;
  }

  public static async updatePlaylistTheme(slug: string, mood_theme: MoodThemeId) {
    const res = await apiClient.put<ApiResponse<Playlist>>(`/playlists/${slug}`, { mood_theme });
    return res.data.data;
  }

  public static async updateSong(id: string, updates: Partial<Song>) {
    const res = await apiClient.put<ApiResponse<Song>>(`/songs/${id}`, updates);
    return res.data.data;
  }

  public static async deleteSong(id: string) {
    const res = await apiClient.delete<ApiResponse<any>>(`/songs/${id}`);
    return res.data;
  }

  public static async bulkUpdateSongs(songIds: string[], updateFields: any) {
    const res = await apiClient.post<ApiResponse<any>>('/admin/songs/bulk-update', { songIds, updateFields });
    return res.data;
  }

  public static async bulkDeleteSongs(songIds: string[]) {
    const res = await apiClient.post<ApiResponse<any>>('/admin/songs/bulk-delete', { songIds });
    return res.data;
  }
}
