import bcrypt from 'bcryptjs';
import { AdminModel } from '../models/Admin';
import { PlaylistModel } from '../models/Playlist';
import { ThemeModel } from '../models/Theme';
import { MoodModel } from '../models/Mood';
import { config } from '../config/env';
import { THEME_REGISTRY } from '@sur-o-jhankaar/theme-engine';
import fs from 'fs';
import path from 'path';

export async function seedInitialAdmin(): Promise<void> {
  const existingAdmin = await AdminModel.findOne({ email: config.adminDefaultEmail.toLowerCase() });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(config.adminDefaultPassword, salt);
    await AdminModel.create({
      name: 'Sur o Jhankaar Admin',
      email: config.adminDefaultEmail.toLowerCase(),
      passwordHash,
      role: 'ADMIN',
      isActive: true
    });
    console.log(`[Seed] Created initial admin: ${config.adminDefaultEmail}`);
  }
}

export async function seedThemesAndPlaylists(): Promise<void> {
  // 1. Seed Themes from THEME_REGISTRY
  for (const [themeId, themeConfig] of Object.entries(THEME_REGISTRY)) {
    const existingTheme = await ThemeModel.findOne({ themeId });
    if (!existingTheme) {
      await ThemeModel.create({
        themeId,
        name: themeConfig.name,
        description: themeConfig.description,
        backgroundType: themeConfig.backgroundType,
        palette: themeConfig.palette,
        accentColor: themeConfig.accentColor,
        glowColor: themeConfig.glowColor,
        textColor: themeConfig.textColor,
        animation: themeConfig.animation,
        particleEffect: themeConfig.particleEffect,
        grain: themeConfig.grain,
        motionIntensity: themeConfig.motionIntensity,
        cssVariables: themeConfig.cssVariables
      });
    }
  }
  console.log('[Seed] System themes verified');

  // 2. Seed 14 Playlists from seed_playlists.json
  const seedPlaylistsPath = path.resolve(__dirname, '../../../data/seed_playlists.json');
  if (fs.existsSync(seedPlaylistsPath)) {
    const rawData = fs.readFileSync(seedPlaylistsPath, 'utf-8');
    const playlists = JSON.parse(rawData);

    for (const p of playlists) {
      const existing = await PlaylistModel.findOne({ slug: p.slug });
      const themeConfig = THEME_REGISTRY[p.mood_theme as keyof typeof THEME_REGISTRY];
      if (!existing) {
        await PlaylistModel.create({
          name: p.name,
          slug: p.slug,
          description: p.description,
          languages: p.languages,
          genres: p.genres,
          moods: p.moods,
          mood_theme: p.mood_theme,
          themeConfig: themeConfig || null,
          isFeatured: p.isFeatured || false,
          sortOrder: p.sortOrder || 0,
          isActive: true,
          isPublic: true
        });
      }
    }
    console.log('[Seed] 14 playlists initialized');
  }

  // 3. Seed Moods
  const defaultMoods = [
    { name: 'Romantic', slug: 'romantic', icon: '💖', color: '#E91E63', themeId: 'cinematic_gold_maroon' },
    { name: 'Nostalgic', slug: 'nostalgic', icon: '📻', color: '#B59470', themeId: 'sepia_ivory_gramophone' },
    { name: 'Peaceful', slug: 'peaceful', icon: '🍃', color: '#8CA394', themeId: 'cream_green_tagore' },
    { name: 'Energetic', slug: 'energetic', icon: '⚡', color: '#FF8F00', themeId: 'vibrant_folk_festival' },
    { name: 'Late Night', slug: 'late_night', icon: '🌙', color: '#00E5FF', themeId: 'neon_teal_purple_city' },
    { name: 'Devotional', slug: 'devotional', icon: '🪔', color: '#E5A93C', themeId: 'deep_red_gold_temple' },
    { name: 'Travel', slug: 'travel', icon: '🚗', color: '#BA9B77', themeId: 'dusty_sepia_vhs' },
    { name: 'Stories & Mysteries', slug: 'stories', icon: '🕯️', color: '#E09F3E', themeId: 'near_black_story_spotlight' }
  ];

  for (const m of defaultMoods) {
    const existing = await MoodModel.findOne({ slug: m.slug });
    if (!existing) {
      await MoodModel.create({
        name: m.name,
        slug: m.slug,
        icon: m.icon,
        color: m.color,
        themeId: m.themeId,
        isActive: true
      });
    }
  }
}
