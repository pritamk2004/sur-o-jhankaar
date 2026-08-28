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

export class Api {
  // Public Music Endpoints
  public static async getSongs(params: any = {}) {
    const res = await apiClient.get<ApiResponse<{ songs: Song[]; total: number; totalPages: number }>>('/songs', { params });
    return res.data.data;
  }

  public static async getSongById(id: string) {
    const res = await apiClient.get<ApiResponse<Song>>(`/songs/${id}`);
    return res.data.data;
  }

  public static async searchAll(query: string, language?: string, limit = 20) {
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
  }

  public static async recordPlayback(songId: string, playlistSlug?: string, source = 'player') {
    return apiClient.post('/songs/playback', { songId, playlistSlug, source });
  }

  public static async getPlaylists(params: any = {}) {
    const res = await apiClient.get<ApiResponse<Playlist[]>>('/playlists', { params });
    return res.data.data || [];
  }

  public static async getPlaylistBySlug(slug: string) {
    const res = await apiClient.get<ApiResponse<{ playlist: Playlist; songs: Song[] }>>(`/playlists/${slug}`);
    return res.data.data;
  }

  public static async getMoods() {
    const res = await apiClient.get<ApiResponse<any[]>>('/moods');
    return res.data.data || [];
  }

  public static async getMoodSongs(moodSlug: string, language?: string) {
    const res = await apiClient.get<ApiResponse<{ mood: any; theme: any; songs: Song[] }>>(`/moods/${moodSlug}/songs`, {
      params: { language }
    });
    return res.data.data;
  }

  public static async getRadioStations() {
    const res = await apiClient.get<ApiResponse<any[]>>('/radio/stations');
    return res.data.data || [];
  }

  public static async getNextRadioTrack(payload: any) {
    const res = await apiClient.post<ApiResponse<{ song: Song | null; remainingCandidates: number }>>('/radio/next', payload);
    return res.data.data;
  }

  public static async getThemes() {
    const res = await apiClient.get<ApiResponse<any[]>>('/themes');
    return res.data.data || [];
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
