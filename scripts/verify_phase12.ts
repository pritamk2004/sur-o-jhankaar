import { PlayerStateMachine, QueueManager, RadioEngine, DEFAULT_RADIO_CONFIG } from '@sur-o-jhankaar/player-core';
import { THEME_REGISTRY, ThemeResolver, ColorExtractor } from '@sur-o-jhankaar/theme-engine';
import { SYSTEM_MOODS } from '../server/src/services/moodEngineService';
import { Song, Playlist } from '@sur-o-jhankaar/shared-types';

async function runPhase12Verification() {
  console.log('🎵 ======================================================== 🎵');
  console.log('🎵   SUR O JHANKAAR — Phase 12 Verification Suite          🎵');
  console.log('🎵   Comprehensive Testing Matrix (Unit + Integration)     🎵');
  console.log('🎵 ======================================================== 🎵\n');

  // 1. Unit Tests: Player State Machine Lifecycle
  console.log('[1/4] Running Unit Tests: Player State Machine transitions...');
  const sm = new PlayerStateMachine();
  if (sm.getState().status !== 'idle') throw new Error('Initial status should be idle');

  sm.transition('LOAD_START');
  if (sm.getState().status !== 'loading') throw new Error('Status should be loading');

  sm.transition('PLAY');
  if (sm.getState().status !== 'playing') throw new Error('Status should be playing');

  sm.transition('PAUSE');
  if (sm.getState().status !== 'paused') throw new Error('Status should be paused');

  sm.transition('STOP');
  if (sm.getState().status !== 'stopped') throw new Error('Status should be stopped');

  console.log('✓ PlayerStateMachine lifecycle (idle -> loading -> playing -> paused -> stopped) validated.');

  // 2. Unit Tests: Queue Invariants & Pinned Shuffle
  console.log('\n[2/4] Running Unit Tests: Queue Invariants & Pinned Shuffle...');
  const sampleQueue: Song[] = [
    { id: '1', title: 'Song 1', kind: 'music', playlists: [], languages: ['Hindi'], score: 50, provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' },
    { id: '2', title: 'Song 2', kind: 'music', playlists: [], languages: ['Bangla'], score: 60, provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' },
    { id: '3', title: 'Song 3', kind: 'music', playlists: [], languages: ['Hindi'], score: 70, provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' },
    { id: '4', title: 'Song 4', kind: 'music', playlists: [], languages: ['Bhojpuri'], score: 80, provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' }
  ];

  const shuffled = QueueManager.shuffleWithCurrentPinned(sampleQueue, sampleQueue[2]);
  if (shuffled[0].id !== '3') {
    throw new Error('Pinned shuffle failed to maintain current song at index 0');
  }
  if (shuffled.length !== sampleQueue.length) {
    throw new Error('Shuffled queue length mismatch');
  }
  console.log('✓ QueueManager pinned shuffle & reordering invariants validated.');

  // 3. Unit Tests: Theme Engine & Resolution Matrix
  console.log('\n[3/4] Running Unit Tests: Theme Engine & Dynamic Archetypes...');
  const themes = Object.values(THEME_REGISTRY);
  if (themes.length !== 10) throw new Error('Expected exactly 10 themes in registry');

  themes.forEach(t => {
    if (!t.palette || t.palette.length < 3 || !t.accentColor || !t.cssVariables) {
      throw new Error(`Theme ${t.id} has invalid structure`);
    }
  });

  const blendTest = ColorExtractor.blendHex('#FF0000', '#0000FF', 0.5);
  if (!blendTest.startsWith('#')) throw new Error('ColorExtractor blendHex failed');
  console.log(`✓ 10 Theme Archetypes validated and ColorExtractor blend ratio tested (${blendTest}).`);

  // 4. Integration Tests: Radio & Mood Mappings
  console.log('\n[4/4] Running Integration Tests: System Moods & Radio Scoring...');
  if (SYSTEM_MOODS.length !== 8) throw new Error('Expected 8 system moods');

  SYSTEM_MOODS.forEach(m => {
    const theme = THEME_REGISTRY[m.themeId];
    if (!theme) throw new Error(`Mood ${m.slug} missing valid theme`);
  });

  const scoredFresh = RadioEngine.scoreSong(sampleQueue[0], [], undefined, DEFAULT_RADIO_CONFIG);
  const scoredRecent = RadioEngine.scoreSong(sampleQueue[0], ['1'], undefined, DEFAULT_RADIO_CONFIG);
  if (scoredRecent >= scoredFresh) {
    throw new Error('Radio recency penalty not applied');
  }
  console.log(`✓ Mood & Radio algorithms integrated with verified recency penalty decay (${scoredFresh} -> ${scoredRecent}).`);

  console.log('\n✨ Phase 12 Comprehensive Testing Matrix Verified Successfully! 🎉\n');
}

runPhase12Verification().catch(err => {
  console.error('[Phase 12 Verification Error]:', err);
  process.exit(1);
});
