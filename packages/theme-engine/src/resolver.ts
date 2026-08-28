import { MoodThemeId, Song, Playlist, ThemeConfig } from '@sur-o-jhankaar/shared-types';
import { THEME_REGISTRY, DEFAULT_THEME_ID } from './themes';

export const PLAYLIST_THEME_MAP: Record<string, MoodThemeId> = {
  'bollywood-melody': 'cinematic_gold_maroon',
  'hindi-evergreen': 'cinematic_gold_maroon',
  'roadside-nostalgia': 'dusty_sepia_vhs',
  'bhojpuri-hits': 'vibrant_folk_festival',
  'bengali-folk': 'earthy_terracotta_river',
  'manbhum': 'earthy_terracotta_river',
  'modern-bengali': 'neon_teal_purple_city',
  'bengali-evergreen': 'sepia_ivory_gramophone',
  'old-bengali-melody': 'sepia_ivory_gramophone',
  'sangeet-bangla-era': 'deep_indigo_radio',
  'rabindra-sangeet': 'cream_green_tagore',
  'shyama-sangeet': 'deep_red_gold_temple',
  'durga-pujo-special': 'deep_red_gold_temple',
  'sunday-suspense': 'near_black_story_spotlight'
};

const THEME_KEYWORD_HINTS: Array<{ keywords: string[]; themeId: MoodThemeId }> = [
  { keywords: ['suspense', 'story', 'horror', 'thriller', 'feluda', 'byomkesh', 'mirchi'], themeId: 'near_black_story_spotlight' },
  { keywords: ['durga', 'pujo', 'puja', 'shyama', 'kali', 'bhakti', 'temple', 'mahalaya'], themeId: 'deep_red_gold_temple' },
  { keywords: ['rabindra', 'tagore', 'geetanjali', 'nazrul', 'shobdo'], themeId: 'cream_green_tagore' },
  { keywords: ['folk', 'baul', 'bhatiyali', 'jhumur', 'purulia', 'manbhum', 'lalon', 'terracotta'], themeId: 'earthy_terracotta_river' },
  { keywords: ['bhojpuri', 'chhalakata', 'pawan', 'khesari', 'patarki'], themeId: 'vibrant_folk_festival' },
  { keywords: ['radio', 'sangeet bangla', 'indigo', 'night radio', 'frequency'], themeId: 'deep_indigo_radio' },
  { keywords: ['old bengali', 'evergreen', 'gramophone', 'kishore kumar', 'hemanta', 'sandhya', 'rd burman'], themeId: 'sepia_ivory_gramophone' },
  { keywords: ['city', 'modern', 'neon', 'urban', 'coke studio', 'pop'], themeId: 'neon_teal_purple_city' },
  { keywords: ['truck', 'bus', 'dhaba', 'highway', 'nostalgia', 'vhs', 'roadside'], themeId: 'dusty_sepia_vhs' },
  { keywords: ['bollywood', 'romantic', 'arijit', 'shreya', 'melody', 'cinematic'], themeId: 'cinematic_gold_maroon' }
];

export class ThemeResolver {
  public static resolveForPlaylist(slugOrName: string): ThemeConfig {
    const normalized = slugOrName.toLowerCase().trim().replace(/\s+/g, '-');
    if (PLAYLIST_THEME_MAP[normalized]) {
      return THEME_REGISTRY[PLAYLIST_THEME_MAP[normalized]];
    }

    for (const [key, themeId] of Object.entries(PLAYLIST_THEME_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return THEME_REGISTRY[themeId];
      }
    }

    for (const hint of THEME_KEYWORD_HINTS) {
      if (hint.keywords.some(kw => normalized.includes(kw))) {
        return THEME_REGISTRY[hint.themeId];
      }
    }

    return THEME_REGISTRY[DEFAULT_THEME_ID];
  }

  public static resolveForSong(song?: Song | null, currentPlaylist?: Playlist | null): ThemeConfig {
    if (!song) {
      if (currentPlaylist?.mood_theme && THEME_REGISTRY[currentPlaylist.mood_theme]) {
        return THEME_REGISTRY[currentPlaylist.mood_theme];
      }
      return THEME_REGISTRY[DEFAULT_THEME_ID];
    }

    if (song.songTheme && (song.songTheme as MoodThemeId) in THEME_REGISTRY) {
      return THEME_REGISTRY[song.songTheme as MoodThemeId];
    }

    if (song.kind === 'spoken_word') {
      return THEME_REGISTRY['near_black_story_spotlight'];
    }

    if (currentPlaylist?.mood_theme && THEME_REGISTRY[currentPlaylist.mood_theme]) {
      return THEME_REGISTRY[currentPlaylist.mood_theme];
    }

    if (song.playlists && song.playlists.length > 0) {
      for (const pSlug of song.playlists) {
        if (PLAYLIST_THEME_MAP[pSlug]) {
          return THEME_REGISTRY[PLAYLIST_THEME_MAP[pSlug]];
        }
      }
    }

    return this.resolveForPlaylist(song.title);
  }
}
