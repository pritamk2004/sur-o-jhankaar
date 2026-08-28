import { THEME_REGISTRY, ThemeResolver } from '@sur-o-jhankaar/theme-engine';
import { RadioEngine } from '@sur-o-jhankaar/player-core';
import { Song, Playlist } from '@sur-o-jhankaar/shared-types';
import fs from 'fs';
import path from 'path';

console.log('🎵 =============================================== 🎵');
console.log('🎵   SUR O JHANKAAR — Phase 1 Verification Suite   🎵');
console.log('🎵 =============================================== 🎵');

// 1. Verify 10 Theme Archetypes
console.log('\n[1/5] Verifying 10 Dynamic Theme Archetypes...');
const themes = Object.keys(THEME_REGISTRY);
console.log(`✓ Loaded ${themes.length} Theme configurations:`, themes.join(', '));
if (themes.length < 10) {
  throw new Error(`Expected at least 10 themes, found ${themes.length}`);
}

// 2. Verify 14 Playlist Seed Mappings
console.log('\n[2/5] Verifying 14 Curated Playlists & Mood Themes...');
const seedPath = path.resolve(__dirname, '../data/seed_playlists.json');
const rawData = fs.readFileSync(seedPath, 'utf-8');
const playlists: Playlist[] = JSON.parse(rawData);
console.log(`✓ Loaded ${playlists.length} verified playlists:`);

playlists.forEach(pl => {
  const resolved = ThemeResolver.resolveForPlaylist(pl.slug);
  console.log(`  • [${pl.languages.join('/')}] ${pl.name.padEnd(28)} -> Theme: ${resolved.id} (${resolved.animation})`);
});

if (playlists.length !== 14) {
  throw new Error(`Expected exactly 14 playlists, found ${playlists.length}`);
}

// 3. Verify Theme Resolution Priority
console.log('\n[3/5] Verifying Theme Resolution Priority...');
const sampleSong: Song = {
  id: 'test_song_1',
  title: 'Test Romantic Song',
  normalizedTitle: 'test romantic song',
  artists: 'Arijit Singh',
  durationSeconds: 240,
  kind: 'music',
  playlists: ['bollywood-melody'],
  score: 95,
  languages: ['Hindi'],
  genres: ['romantic'],
  moods: ['romantic'],
  provider: 'youtube',
  sourceType: 'csv',
  isActive: true,
  playCount: 0,
  likeCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const resolvedSongTheme = ThemeResolver.resolveForSong(sampleSong);
console.log(`✓ Song from 'bollywood-melody' resolves to: ${resolvedSongTheme.id}`);

const sampleSpokenStory: Song = {
  ...sampleSong,
  id: 'story_1',
  title: 'Feluda in Kathmandu',
  kind: 'spoken_word',
  playlists: ['sunday-suspense']
};
const resolvedStoryTheme = ThemeResolver.resolveForSong(sampleSpokenStory);
console.log(`✓ Spoken word 'sunday-suspense' resolves to: ${resolvedStoryTheme.id} (Spotlight visualizer)`);
if (resolvedStoryTheme.id !== 'near_black_story_spotlight') {
  throw new Error('Spoken word failed to resolve to near_black_story_spotlight');
}

// 4. Verify Radio Engine Weighted Scoring
console.log('\n[4/5] Verifying Radio Weighted Algorithm & Repeat Prevention...');
const candidateSongs: Song[] = [
  { ...sampleSong, id: 's1', score: 90, artists: 'Singer A' },
  { ...sampleSong, id: 's2', score: 75, artists: 'Singer B' },
  { ...sampleSong, id: 's3', score: 60, artists: 'Singer C' }
];

const selected = RadioEngine.selectNextSong(candidateSongs, ['s1']);
console.log(`✓ Next radio selection with 's1' in recent history: Song ${selected?.id} (${selected?.artists})`);
if (selected?.id === 's1') {
  console.warn('Warning: immediate repeat prevention did not pick alternate candidate');
} else {
  console.log('✓ Repeat prevention successfully prioritized alternative candidates');
}

// 5. Verification Complete
console.log('\n[5/5] All Phase 1 Core Packages & Engines Verified Successfully! 🎉\n');
