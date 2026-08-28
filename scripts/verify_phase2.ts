import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { cleanTitle, normalizeTitle } from '../server/src/utils/titleNormalizer';
import { classifyLanguages, PLAYLIST_LANGUAGE_MAP } from '../server/src/utils/languageClassifier';
import { CsvImportService } from '../server/src/services/csvImportService';

async function runPhase2Verification() {
  console.log('🎵 ======================================================= 🎵');
  console.log('🎵   SUR O JHANKAAR — Phase 2 Verification Suite          🎵');
  console.log('🎵   CSV Ingestion & 1,894-Row Master Library Integrity   🎵');
  console.log('🎵 ======================================================= 🎵\n');

  const csvPath = path.resolve(__dirname, '../data/master_library.csv');

  // 1. Verify CSV Exists and Has Exactly 1,894 Rows
  console.log('[1/4] Verifying CSV file existence and exact row count...');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`master_library.csv not found at ${csvPath}`);
  }

  const rawContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(rawContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(`✓ Parsed rows: ${records.length} (Target: 1,894)`);
  if (records.length !== 1894) {
    throw new Error(`Expected exactly 1,894 rows, found ${records.length}`);
  }

  // 2. Verify Exact Playlist Counts
  console.log('\n[2/4] Verifying 14 Playlist Counts against Specification (§3)...');
  const EXPECTED_COUNTS: Record<string, number> = {
    'sangeet-bangla-era': 246,
    'old-bengali-melody': 214,
    'modern-bengali': 212,
    'bollywood-melody': 207,
    'bengali-evergreen': 160,
    'sunday-suspense': 149,
    'bhojpuri-hits': 129,
    'manbhum': 122,
    'bengali-folk': 121,
    'hindi-evergreen': 99,
    'durga-pujo-special': 92,
    'rabindra-sangeet': 83,
    'roadside-nostalgia': 82,
    'shyama-sangeet': 75
  };

  const observedCounts: Record<string, number> = {};
  Object.keys(EXPECTED_COUNTS).forEach(k => (observedCounts[k] = 0));

  records.forEach((row: any) => {
    const pls = (row.playlists || '').split(';').map((p: string) => p.trim()).filter(Boolean);
    pls.forEach((slug: string) => {
      if (observedCounts[slug] !== undefined) {
        observedCounts[slug]++;
      }
    });
  });

  let totalPlaylistAssignments = 0;
  for (const [slug, expected] of Object.entries(EXPECTED_COUNTS)) {
    const actual = observedCounts[slug];
    totalPlaylistAssignments += actual;
    console.log(`  • ${slug.padEnd(24)}: ${actual.toString().padStart(4)} / ${expected.toString().padStart(4)} ${actual === expected ? '✓ PASS' : '✗ FAIL'}`);
    if (actual !== expected) {
      throw new Error(`Playlist ${slug} count mismatch: ${actual} vs expected ${expected}`);
    }
  }
  console.log(`✓ Total playlist assignments: ${totalPlaylistAssignments} across 1,894 songs.`);

  // 3. Verify CsvImportService Preview Report Generator
  console.log('\n[3/4] Testing CsvImportService preview report generator...');
  const preview = await CsvImportService.generatePreview(csvPath, 'master_library.csv');
  console.log(`✓ Preview detected total rows: ${preview.totalDetected}`);
  console.log(`✓ Preview detected valid rows: ${preview.validCount}`);
  console.log(`✓ Preview detected playlists count: ${preview.playlistsDetected.length}`);
  if (preview.playlistsDetected.length !== 14) {
    throw new Error(`Expected 14 playlists in preview, found ${preview.playlistsDetected.length}`);
  }

  // 4. Verify Language Classification Rules
  console.log('\n[4/4] Verifying language classification rules...');
  const hindiLang = classifyLanguages(['bollywood-melody'], 'Kal Ho Naa Ho', 'Sonu Nigam');
  console.log(`✓ 'bollywood-melody' classified as:`, hindiLang.join(', '));
  if (!hindiLang.includes('Hindi')) throw new Error('Hindi classification failed');

  const banglaLang = classifyLanguages(['rabindra-sangeet'], 'Tumi Robe Nirobe', 'Saregama');
  console.log(`✓ 'rabindra-sangeet' classified as:`, banglaLang.join(', '));
  if (!banglaLang.includes('Bangla')) throw new Error('Bangla classification failed');

  const bhojpuriLang = classifyLanguages(['bhojpuri-hits'], '#Chhalakata Hamro Jawaniya', 'Pawan Singh');
  console.log(`✓ 'bhojpuri-hits' classified as:`, bhojpuriLang.join(', '));
  if (!bhojpuriLang.includes('Bhojpuri')) throw new Error('Bhojpuri classification failed');

  console.log('\n✨ Phase 2 CSV Import & Library Verification Passed with 100% Success! 🎉\n');
}

runPhase2Verification().catch(err => {
  console.error('[Phase 2 Verification Error]:', err);
  process.exit(1);
});
