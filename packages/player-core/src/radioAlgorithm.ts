import { Song, RadioFilterScope, RadioSessionConfig, Language, MoodThemeId } from '@sur-o-jhankaar/shared-types';

export interface RadioStationConfig {
  id: string;
  name: string;
  language: 'All' | Language;
  frequency: number;
  description: string;
  themeId: MoodThemeId;
}

export const RADIO_STATIONS: RadioStationConfig[] = [
  {
    id: 'airwave_all',
    name: 'SUR O JHANKAAR AIRWAVE',
    language: 'All',
    frequency: 98.7,
    description: 'National frequency covering all Indian classical, melody & folk heritage',
    themeId: 'deep_indigo_radio'
  },
  {
    id: 'hindi_nostalgia',
    name: 'HINDI NOSTALGIA & MELODY',
    language: 'Hindi',
    frequency: 92.7,
    description: 'Bollywood cinema classics, highway truck cassettes, and golden melodies',
    themeId: 'dusty_sepia_vhs'
  },
  {
    id: 'bangla_taranga',
    name: 'BANGLA SANGEET TARANGA',
    language: 'Bangla',
    frequency: 91.9,
    description: 'Rabindra Sangeet, Baul, Purulia Jhumur, and Modern Bengali ballads',
    themeId: 'sepia_ivory_gramophone'
  },
  {
    id: 'bhojpuri_dhamaka',
    name: 'BHOJPURI DHAMAKA FM',
    language: 'Bhojpuri',
    frequency: 104.0,
    description: 'High-voltage folk celebrations, stage rhythms and vibrant anthems',
    themeId: 'vibrant_folk_festival'
  }
];

export const DEFAULT_RADIO_CONFIG: RadioSessionConfig = {
  historyWindowSize: 30,
  recentSongPenalty: 40,
  artistRepeatPenalty: 25
};

export class RadioEngine {
  /**
   * Filter songs against the user's selected language & include/exclude scope
   */
  public static filterCandidates(songs: Song[], scope: RadioFilterScope = {}): Song[] {
    const lang = scope.language || 'All';
    const excludedPlaylists = scope.excludedPlaylists || [];
    const includedPlaylists = scope.includedPlaylists || [];
    const excludedArtists = scope.excludedArtists || [];
    const includedArtists = scope.includedArtists || [];

    return songs.filter(song => {
      if (!song.isActive) return false;

      // 1. Language filter
      if (lang !== 'All') {
        if (!song.languages || !song.languages.includes(lang)) {
          return false;
        }
      }

      // 2. Excluded Playlists
      if (excludedPlaylists.length > 0) {
        if (song.playlists && song.playlists.some(p => excludedPlaylists.includes(p))) {
          return false;
        }
      }

      // 3. Included Playlists (if specified, song must belong to at least one)
      if (includedPlaylists.length > 0) {
        if (!song.playlists || !song.playlists.some(p => includedPlaylists.includes(p))) {
          return false;
        }
      }

      // 4. Excluded Artists
      if (excludedArtists.length > 0) {
        const artist = (song.displayArtist || song.artists || '').toLowerCase();
        if (excludedArtists.some(ex => artist.includes(ex.toLowerCase()))) {
          return false;
        }
      }

      // 5. Included Artists
      if (includedArtists.length > 0) {
        const artist = (song.displayArtist || song.artists || '').toLowerCase();
        if (!includedArtists.some(inc => artist.includes(inc.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Calculate final score with repeat and streak penalties
   * finalScore = baseScore + languageMatch + playlistMatch + moodMatch - recentPenalty - artistRepeatPenalty
   */
  public static scoreSong(
    song: Song,
    history: string[],
    lastArtist?: string,
    config: RadioSessionConfig = DEFAULT_RADIO_CONFIG
  ): number {
    let score = song.score || 50;

    // Penalty if in recent history
    const historyIndex = history.indexOf(song.id);
    if (historyIndex !== -1) {
      // Recent penalty scales based on how recent it was
      const recencyFactor = 1 - historyIndex / config.historyWindowSize;
      score -= config.recentSongPenalty * Math.max(0, recencyFactor);
    }

    // Artist repetition penalty
    const songArtist = song.displayArtist || song.artists;
    if (lastArtist && songArtist && lastArtist.toLowerCase() === songArtist.toLowerCase()) {
      score -= config.artistRepeatPenalty;
    }

    // Ensure score is strictly positive for weighted probability
    return Math.max(5, score);
  }

  /**
   * Weighted random selection from candidates based on calculated scores
   */
  public static selectNextSong(
    candidates: Song[],
    history: string[] = [],
    lastArtist?: string,
    config: RadioSessionConfig = DEFAULT_RADIO_CONFIG
  ): Song | null {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // Filter out immediate last played song if possible
    const lastPlayedId = history.length > 0 ? history[0] : null;
    const pool = candidates.length > 1 && lastPlayedId
      ? candidates.filter(s => s.id !== lastPlayedId)
      : candidates;

    const scoredPool = pool.map(song => ({
      song,
      score: this.scoreSong(song, history, lastArtist, config)
    }));

    const totalWeight = scoredPool.reduce((acc, item) => acc + item.score, 0);
    let randomThreshold = Math.random() * totalWeight;

    for (const item of scoredPool) {
      randomThreshold -= item.score;
      if (randomThreshold <= 0) {
        return item.song;
      }
    }

    return scoredPool[0].song;
  }
}
