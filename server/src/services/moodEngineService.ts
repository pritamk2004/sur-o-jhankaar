import mongoose from 'mongoose';
import { MoodModel } from '../models/Mood';
import { SongModel } from '../models/Song';
import { Song, MoodThemeId } from '@sur-o-jhankaar/shared-types';
import { ThemeResolver, THEME_REGISTRY } from '@sur-o-jhankaar/theme-engine';

export interface MoodDefinition {
  slug: string;
  name: string;
  icon: string;
  gradient: string;
  themeId: MoodThemeId;
  tagline: string;
  targetPlaylists: string[];
}

export const SYSTEM_MOODS: MoodDefinition[] = [
  {
    slug: 'romantic',
    name: 'Romantic',
    icon: '💖',
    gradient: 'from-pink-900 via-red-900 to-amber-900',
    themeId: 'cinematic_gold_maroon',
    tagline: 'Tender Bollywood & Bangla love ballads',
    targetPlaylists: ['bollywood-melody', 'modern-bengali', 'old-bengali-melody']
  },
  {
    slug: 'nostalgic',
    name: 'Nostalgic',
    icon: '📻',
    gradient: 'from-amber-950 via-stone-900 to-amber-900',
    themeId: 'sepia_ivory_gramophone',
    tagline: 'Vintage gramophone & golden era cassettes',
    targetPlaylists: ['hindi-evergreen', 'bengali-evergreen', 'old-bengali-melody', 'sangeet-bangla-era']
  },
  {
    slug: 'peaceful',
    name: 'Peaceful',
    icon: '🍃',
    gradient: 'from-emerald-950 via-teal-950 to-stone-900',
    themeId: 'cream_green_tagore',
    tagline: 'Rabindra Sangeet & gentle acoustic reverie',
    targetPlaylists: ['rabindra-sangeet', 'bengali-folk']
  },
  {
    slug: 'energetic',
    name: 'Energetic & Festive',
    icon: '🔥',
    gradient: 'from-orange-950 via-red-950 to-amber-900',
    themeId: 'vibrant_folk_festival',
    tagline: 'Bhojpuri celebration rhythms and upbeat folk',
    targetPlaylists: ['bhojpuri-hits', 'manbhum', 'durga-pujo-special']
  },
  {
    slug: 'late_night',
    name: 'Late Night',
    icon: '🌙',
    gradient: 'from-indigo-950 via-purple-950 to-slate-950',
    themeId: 'neon_teal_purple_city',
    tagline: 'City-night glow, soulful lo-fi & indie vibes',
    targetPlaylists: ['modern-bengali', 'sangeet-bangla-era']
  },
  {
    slug: 'devotional',
    name: 'Devotional & Divine',
    icon: '🪔',
    gradient: 'from-red-950 via-amber-950 to-yellow-950',
    themeId: 'deep_red_gold_temple',
    tagline: 'Durga Pujo Dhaak & sacred Shyama Sangeet',
    targetPlaylists: ['durga-pujo-special', 'shyama-sangeet']
  },
  {
    slug: 'travel',
    name: 'Road Trip & Highway',
    icon: '🚗',
    gradient: 'from-yellow-950 via-stone-900 to-amber-950',
    themeId: 'dusty_sepia_vhs',
    tagline: 'Dhabas, truck journeys & roadside memories',
    targetPlaylists: ['roadside-nostalgia', 'hindi-evergreen']
  },
  {
    slug: 'stories',
    name: 'Midnight Mysteries',
    icon: '🕯️',
    gradient: 'from-zinc-950 via-neutral-900 to-black',
    themeId: 'near_black_story_spotlight',
    tagline: 'Sunday Suspense audio drama in the dark',
    targetPlaylists: ['sunday-suspense']
  }
];

export class MoodEngineService {
  public static async getAllMoods(): Promise<MoodDefinition[]> {
    if (mongoose.connection.readyState === 1) {
      const dbMoods = await MoodModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
      if (dbMoods.length > 0) {
        return dbMoods as any;
      }
    }
    return SYSTEM_MOODS;
  }

  public static async getSongsForMood(
    moodSlug: string,
    options: {
      language?: string;
      limit?: number;
    } = {}
  ): Promise<{ mood: MoodDefinition; theme: any; songs: Song[] }> {
    const limit = options.limit || 50;
    const moodDef = SYSTEM_MOODS.find(m => m.slug === moodSlug) || SYSTEM_MOODS[0];
    const theme = THEME_REGISTRY[moodDef.themeId] || ThemeResolver.resolveForPlaylist(moodSlug);

    if (mongoose.connection.readyState !== 1) {
      return {
        mood: moodDef,
        theme,
        songs: []
      };
    }

    const query: any = {
      isActive: true,
      $or: [
        { playlists: { $in: moodDef.targetPlaylists } },
        { moods: moodSlug },
        { genres: moodSlug },
        { normalizedTitle: { $regex: moodSlug, $options: 'i' } }
      ]
    };

    if (options.language && options.language !== 'All') {
      query.languages = options.language;
    }

    const songDocs = await SongModel.find(query)
      .sort({ score: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const songs = songDocs.map((d: any) => ({
      ...d,
      id: d._id?.toString()
    })) as unknown as Song[];

    return {
      mood: moodDef,
      theme,
      songs
    };
  }
}
