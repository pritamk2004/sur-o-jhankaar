import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { connectDatabase } from '../server/src/config/db';
import { SongModel } from '../server/src/models/Song';
import { PlaylistModel } from '../server/src/models/Playlist';
import { seedInitialAdmin, seedThemesAndPlaylists } from '../server/src/utils/seedHelper';
import { cleanTitle, normalizeTitle } from '../server/src/utils/titleNormalizer';
import { classifyLanguages } from '../server/src/utils/languageClassifier';
import { YouTubeProvider } from '../server/src/providers/youtube';

const youtubeProvider = new YouTubeProvider();

async function seedMasterLibrary() {
  console.log('🎵 ======================================================== 🎵');
  console.log('🎵   SUR O JHANKAAR — Master 1,894-Row CSV Library Seeder  🎵');
  console.log('🎵 ======================================================== 🎵\n');

  const db = await connectDatabase();
  if (!db) {
    console.warn('MongoDB not reachable. In-memory validation will run.');
  }

  // 1. Seed Admin and Playlists
  await seedInitialAdmin();
  await seedThemesAndPlaylists();

  // 2. Read and parse data/master_library.csv
  const csvPath = path.resolve(__dirname, '../data/master_library.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  const rawContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(rawContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(`[CSV Parser] Parsed ${records.length} records from master_library.csv`);
  if (records.length !== 1894) {
    console.warn(`[Warning] Expected 1,894 records, found ${records.length}`);
  }

  if (db) {
    console.log('[Database] Seeding songs into MongoDB collection...');
    
    // Clear existing for clean deterministic seed
    await SongModel.deleteMany({});
    
    const docsToInsert = [];
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rawTitle = row.title;
      const cleaned = cleanTitle(rawTitle);
      const normalized = normalizeTitle(cleaned);
      const playlists = row.playlists ? row.playlists.split(';').map((p: string) => p.trim()).filter(Boolean) : [];
      const languages = classifyLanguages(playlists, cleaned, row.artists || '');
      const kind = row.kind === 'spoken_word' ? 'spoken_word' : 'music';
      const score = parseFloat(row.score || '70');
      const durationSeconds = parseInt(row.duration_seconds || '240', 10);
      const youtubeUrl = row.youtube_url || '';
      const youtubeVideoId = youtubeUrl ? youtubeProvider.parseId(youtubeUrl) : undefined;
      const artworkUrl = youtubeVideoId ? `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg` : undefined;

      docsToInsert.push({
        title: cleaned,
        rawTitle,
        normalizedTitle: normalized,
        artists: row.artists || 'Unknown Artist',
        album: row.album || undefined,
        durationSeconds,
        kind,
        playlists,
        score,
        youtubeUrl: youtubeUrl || undefined,
        youtubeVideoId,
        languages,
        artworkUrl,
        thumbnailUrl: artworkUrl,
        provider: 'youtube',
        sourceType: 'csv',
        isActive: true,
        playCount: Math.floor(Math.random() * 50),
        likeCount: Math.floor(Math.random() * 20)
      });
    }

    // Bulk insert
    await SongModel.insertMany(docsToInsert);
    console.log(`[Database] Successfully seeded ${docsToInsert.length} songs into MongoDB!`);

    // Recalculate and update playlist counts
    const allPlaylists = await PlaylistModel.find();
    console.log('\n[Playlists] Updating verified playlist song counts:');
    for (const pl of allPlaylists) {
      const count = await SongModel.countDocuments({ playlists: pl.slug, isActive: true });
      pl.songCount = count;
      await pl.save();
      console.log(`  • ${pl.name.padEnd(28)} (${pl.slug.padEnd(20)}): ${count} songs`);
    }
  }

  console.log('\n[Seeder] Master Library Seeding Complete! 🎶\n');
}

seedMasterLibrary().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('[Seeder Error]:', err);
  process.exit(1);
});
