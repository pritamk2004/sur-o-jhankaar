import { SYSTEM_MOODS, MoodEngineService } from '../server/src/services/moodEngineService';
import { THEME_REGISTRY } from '@sur-o-jhankaar/theme-engine';
import fs from 'fs';
import path from 'path';

async function runPhase7Verification() {
  console.log('🎵 ======================================================== 🎵');
  console.log('🎵   SUR O JHANKAAR — Phase 7 Verification Suite           🎵');
  console.log('🎵   Music Mood Mode & Atmosphere Discovery Engine         🎵');
  console.log('🎵 ======================================================== 🎵\n');

  // 1. Verify 8 System Moods
  console.log('[1/4] Verifying 8 Curated Mood Definitions...');
  console.log(`✓ Loaded ${SYSTEM_MOODS.length} system mood archetypes:`);

  SYSTEM_MOODS.forEach(mood => {
    const theme = THEME_REGISTRY[mood.themeId];
    if (!theme) {
      throw new Error(`Mood ${mood.slug} links to invalid themeId ${mood.themeId}`);
    }
    console.log(`  • ${mood.icon} ${mood.name.padEnd(22)} -> Theme: ${theme.id} (${theme.animation})`);
  });

  if (SYSTEM_MOODS.length !== 8) {
    throw new Error(`Expected exactly 8 moods, found ${SYSTEM_MOODS.length}`);
  }

  // 2. Verify Target Playlists Mappings
  console.log('\n[2/4] Verifying mood-to-playlist mappings against seed playlists...');
  const seedPath = path.resolve(__dirname, '../data/seed_playlists.json');
  const seedPlaylists = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  const validSlugs = new Set(seedPlaylists.map((p: any) => p.slug));

  SYSTEM_MOODS.forEach(mood => {
    mood.targetPlaylists.forEach(slug => {
      if (!validSlugs.has(slug)) {
        throw new Error(`Mood ${mood.slug} targets unrecognized playlist: ${slug}`);
      }
    });
    console.log(`  ✓ ${mood.name}: mapped to [${mood.targetPlaylists.join(', ')}]`);
  });

  // 3. Verify MoodEngineService Resolution
  console.log('\n[3/4] Testing MoodEngineService resolution logic...');
  const romanticRes = await MoodEngineService.getSongsForMood('romantic', { language: 'Hindi', limit: 10 });
  console.log(`✓ 'romantic' mood resolved: "${romanticRes.mood.name}" with theme "${romanticRes.theme.name}"`);
  if (romanticRes.theme.id !== 'cinematic_gold_maroon') {
    throw new Error('Romantic mood failed to resolve to cinematic_gold_maroon');
  }

  const devotionalRes = await MoodEngineService.getSongsForMood('devotional');
  console.log(`✓ 'devotional' mood resolved: "${devotionalRes.mood.name}" with theme "${devotionalRes.theme.name}"`);
  if (devotionalRes.theme.id !== 'deep_red_gold_temple') {
    throw new Error('Devotional mood failed to resolve to deep_red_gold_temple');
  }

  // 4. Verify Atmosphere UI Contract
  console.log('\n[4/4] Verifying Atmosphere UI metadata contract...');
  SYSTEM_MOODS.forEach(m => {
    if (!m.tagline || !m.icon || !m.gradient) {
      throw new Error(`Mood ${m.slug} missing required UI metadata`);
    }
  });
  console.log('✓ All moods satisfy UI animation and gradient requirements.');

  console.log('\n✨ Phase 7 Music Mood Mode & Atmosphere Discovery Verified Successfully! 🎉\n');
}

runPhase7Verification().catch(err => {
  console.error('[Phase 7 Verification Error]:', err);
  process.exit(1);
});
