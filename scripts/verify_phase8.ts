import { RADIO_STATIONS, RadioEngine, DEFAULT_RADIO_CONFIG } from '@sur-o-jhankaar/player-core';
import { Song } from '@sur-o-jhankaar/shared-types';

async function runPhase8Verification() {
  console.log('🎵 ======================================================== 🎵');
  console.log('🎵   SUR O JHANKAAR — Phase 8 Verification Suite           🎵');
  console.log('🎵   Vintage Radio Mode & Weighted Airwave Algorithm       🎵');
  console.log('🎵 ======================================================== 🎵\n');

  // 1. Verify 4 Radio Station Definitions
  console.log('[1/5] Verifying 4 dedicated radio stations and frequencies (§8)...');
  console.log(`✓ Loaded ${RADIO_STATIONS.length} radio station frequencies:`);

  RADIO_STATIONS.forEach(st => {
    console.log(`  • ${st.frequency.toFixed(1)} FM: ${st.name.padEnd(28)} [${st.language}] -> Theme: ${st.themeId}`);
  });

  if (RADIO_STATIONS.length !== 4) {
    throw new Error(`Expected 4 radio stations, found ${RADIO_STATIONS.length}`);
  }

  // 2. Verify Candidate Filtering by Station Scope
  console.log('\n[2/5] Verifying candidate filtering by station scope...');
  const pool: Song[] = [
    { id: 'h1', title: 'Hindi Song 1', artists: 'Arijit', languages: ['Hindi'], score: 90, kind: 'music', playlists: ['bollywood-melody'], provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' },
    { id: 'b1', title: 'Bangla Song 1', artists: 'Anupam', languages: ['Bangla'], score: 85, kind: 'music', playlists: ['modern-bengali'], provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' },
    { id: 'bh1', title: 'Bhojpuri Song 1', artists: 'Pawan', languages: ['Bhojpuri'], score: 88, kind: 'music', playlists: ['bhojpuri-hits'], provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' },
    { id: 'h2', title: 'Hindi Song 2', artists: 'Sonu', languages: ['Hindi'], score: 80, kind: 'music', playlists: ['hindi-evergreen'], provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' }
  ];

  const hindiCandidates = RadioEngine.filterCandidates(pool, { language: 'Hindi' });
  console.log(`✓ Hindi 92.7 FM filtered: ${hindiCandidates.length} candidate songs (IDs: ${hindiCandidates.map(s => s.id).join(', ')})`);
  if (hindiCandidates.length !== 2) throw new Error('Hindi filtering mismatch');

  const banglaCandidates = RadioEngine.filterCandidates(pool, { language: 'Bangla' });
  console.log(`✓ Bangla 91.9 FM filtered: ${banglaCandidates.length} candidate songs (IDs: ${banglaCandidates.map(s => s.id).join(', ')})`);
  if (banglaCandidates.length !== 1) throw new Error('Bangla filtering mismatch');

  const allCandidates = RadioEngine.filterCandidates(pool, { language: 'All' });
  console.log(`✓ Airwave 98.7 FM (All) filtered: ${allCandidates.length} candidate songs`);
  if (allCandidates.length !== 4) throw new Error('All language filtering mismatch');

  // 3. Verify §9 Weighted Scoring & Penalty Formula
  console.log('\n[3/5] Verifying scoring formula & penalties...');
  const baseSong = pool[0]; // baseScore = 90

  // Case A: Fresh song (no history, no streak)
  const freshScore = RadioEngine.scoreSong(baseSong, [], undefined, DEFAULT_RADIO_CONFIG);
  console.log(`✓ Case A (Fresh song): Score = ${freshScore} (Expected: 90)`);
  if (freshScore !== 90) throw new Error('Fresh song score mismatch');

  // Case B: In recent history at index 0 (max penalty: 40 pts)
  const recentScore = RadioEngine.scoreSong(baseSong, ['h1', 'other'], undefined, DEFAULT_RADIO_CONFIG);
  console.log(`✓ Case B (Immediate recent history): Score = ${recentScore} (Expected: 50)`);
  if (recentScore !== 50) throw new Error('Recent penalty calculation mismatch');

  // Case C: Same artist streak penalty (25 pts)
  const artistStreakScore = RadioEngine.scoreSong(baseSong, [], 'Arijit', DEFAULT_RADIO_CONFIG);
  console.log(`✓ Case C (Same artist streak): Score = ${artistStreakScore} (Expected: 65)`);
  if (artistStreakScore !== 65) throw new Error('Artist streak penalty calculation mismatch');

  // 4. Verify Immediate Repeat Exclusion (§9)
  console.log('\n[4/5] Verifying immediate repeat exclusion...');
  const nextTrack = RadioEngine.selectNextSong(pool, ['h1']);
  console.log(`✓ With 'h1' just played, next selection chose: "${nextTrack?.title}" (ID: ${nextTrack?.id})`);
  if (nextTrack?.id === 'h1') {
    throw new Error('Immediate repeat exclusion failed');
  }

  // 5. Radio Engine Loop Simulation
  console.log('\n[5/5] Simulating 5-track continuous broadcast transitions...');
  let history: string[] = [];
  let lastArtist: string | undefined = undefined;

  for (let step = 1; step <= 5; step++) {
    const selected = RadioEngine.selectNextSong(pool, history, lastArtist, DEFAULT_RADIO_CONFIG);
    if (!selected) break;
    console.log(`  Track ${step}: "${selected.title}" [${selected.languages?.join('/')}] by ${selected.artists}`);
    history = [selected.id, ...history.slice(0, 30)];
    lastArtist = selected.displayArtist || selected.artists;
  }

  console.log('\n✨ Phase 8 Vintage Radio Mode & Weighted Airwave Algorithm Verified Successfully! 🎉\n');
}

runPhase8Verification().catch(err => {
  console.error('[Phase 8 Verification Error]:', err);
  process.exit(1);
});
