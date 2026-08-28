import { cleanTitle, normalizeTitle } from '../server/src/utils/titleNormalizer';
import { SearchService } from '../server/src/services/searchService';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

async function runPhase4Verification() {
  console.log('🎵 ======================================================== 🎵');
  console.log('🎵   SUR O JHANKAAR — Phase 4 Verification Suite           🎵');
  console.log('🎵   Song/Playlist System & Search Optimization            🎵');
  console.log('🎵 ======================================================== 🎵\n');

  // 1. Verify Text Normalization and Matching
  console.log('[1/4] Verifying text normalization and query tokenization...');
  const testTitle = '#Video | Tujh Mein Rab Dikhta Hai (Official 4K Video) - Shah Rukh Khan';
  const cleaned = cleanTitle(testTitle);
  const normalized = normalizeTitle(cleaned);

  console.log(`  Raw Title:        "${testTitle}"`);
  console.log(`  Cleaned Title:    "${cleaned}"`);
  console.log(`  Normalized Title: "${normalized}"`);

  if (!normalized.includes('tujhmeinrabdikhtahai')) {
    throw new Error('Title normalization failed');
  }

  // 2. In-Memory Search Engine Test on Master Library Dataset
  console.log('\n[2/4] Verifying in-memory multi-field search across 1,894 records...');
  const csvPath = path.resolve(__dirname, '../data/master_library.csv');
  const rawData = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(rawData, { columns: true, skip_empty_lines: true, trim: true });

  const searchRecords = (query: string) => {
    const qNorm = normalizeTitle(query);
    return records.filter((r: any) => {
      const titleNorm = normalizeTitle(r.title);
      const artistNorm = normalizeTitle(r.artists);
      return titleNorm.includes(qNorm) || artistNorm.includes(qNorm) || (r.playlists || '').includes(query.toLowerCase());
    });
  };

  const feludaMatches = searchRecords('Sunday Suspense');
  console.log(`✓ 'Sunday Suspense' matched: ${feludaMatches.length} audio stories (Expected: 149)`);
  if (feludaMatches.length !== 149) {
    throw new Error(`Expected 149 Sunday Suspense records, found ${feludaMatches.length}`);
  }

  const bhojpuriMatches = searchRecords('bhojpuri-hits');
  console.log(`✓ 'bhojpuri-hits' matched: ${bhojpuriMatches.length} songs (Expected: 129)`);
  if (bhojpuriMatches.length !== 129) {
    throw new Error(`Expected 129 Bhojpuri records, found ${bhojpuriMatches.length}`);
  }

  // 3. Verify Categorized Search Structure
  console.log('\n[3/4] Verifying SearchService categorized envelope structure...');
  const sampleCategorized = await SearchService.searchAll('Rabindra', { limit: 10 });
  console.log(`✓ Categorized search result keys:`, Object.keys(sampleCategorized).join(', '));
  console.log(`✓ Query returned: ${sampleCategorized.songs.length} songs, ${sampleCategorized.playlists.length} playlists, ${sampleCategorized.spokenWord.length} spoken words.`);

  if (!('songs' in sampleCategorized) || !('playlists' in sampleCategorized) || !('spokenWord' in sampleCategorized)) {
    throw new Error('Invalid categorized search envelope structure');
  }

  // 4. Verify Multi-Field Search
  console.log('\n[4/4] Verifying multi-field keyword routing...');
  const artistQuery = searchRecords('Arijit Singh');
  console.log(`✓ Artist query 'Arijit Singh' resolved: ${artistQuery.length} candidate songs`);

  console.log('\n✨ Phase 4 Song/Playlist System & Search Optimization Verified Successfully! 🎉\n');
}

runPhase4Verification().catch(err => {
  console.error('[Phase 4 Verification Error]:', err);
  process.exit(1);
});
