import { ProviderManager } from '../server/src/providers';
import { cleanTitle, normalizeTitle } from '../server/src/utils/titleNormalizer';
import { classifyLanguages } from '../server/src/utils/languageClassifier';
import { ThemeResolver } from '@sur-o-jhankaar/theme-engine';

async function runPhase3Verification() {
  console.log('🎵 ======================================================== 🎵');
  console.log('🎵   SUR O JHANKAAR — Phase 3 Verification Suite           🎵');
  console.log('🎵   URL Ingestion & Metadata Resolution Engine            🎵');
  console.log('🎵 ======================================================== 🎵\n');

  // 1. Verify Provider Detection
  console.log('[1/5] Verifying provider detection across URLs...');
  const ytUrl = 'https://www.youtube.com/watch?v=qoq8B8ThgEM';
  const ytShortUrl = 'https://youtu.be/TmRgK-pXH9c';
  const spotifyUrl = 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT';
  const directAudioUrl = 'https://example.com/audio/sample_ghazal.mp3';

  const ytProvider = ProviderManager.detectProviderFromUrl(ytUrl);
  console.log(`✓ YouTube standard watch URL resolved provider: ${ytProvider.id}`);
  if (ytProvider.id !== 'youtube') throw new Error('YouTube provider detection failed');

  const ytShortProvider = ProviderManager.detectProviderFromUrl(ytShortUrl);
  console.log(`✓ youtu.be short URL resolved provider: ${ytShortProvider.id}`);
  if (ytShortProvider.id !== 'youtube') throw new Error('youtu.be short URL provider detection failed');

  const spotifyProvider = ProviderManager.detectProviderFromUrl(spotifyUrl);
  console.log(`✓ Spotify track URL resolved provider: ${spotifyProvider.id}`);
  if (spotifyProvider.id !== 'spotify') throw new Error('Spotify provider detection failed');

  const directProvider = ProviderManager.detectProviderFromUrl(directAudioUrl);
  console.log(`✓ Direct .mp3 URL resolved provider: ${directProvider.id}`);
  if (directProvider.id !== 'direct') throw new Error('Direct audio provider detection failed');

  // 2. Verify Video ID & Track ID Parsing
  console.log('\n[2/5] Verifying ID parsing & normalization...');
  const ytId1 = ytProvider.parseId(ytUrl);
  const ytId2 = ytProvider.parseId(ytShortUrl);
  const spotifyId = spotifyProvider.parseId(spotifyUrl);

  console.log(`✓ YouTube ID 1: ${ytId1} (Expected: qoq8B8ThgEM)`);
  console.log(`✓ YouTube ID 2: ${ytId2} (Expected: TmRgK-pXH9c)`);
  console.log(`✓ Spotify ID: ${spotifyId} (Expected: 4cOdK2wGLETKBW3PvgPWqT)`);

  if (ytId1 !== 'qoq8B8ThgEM' || ytId2 !== 'TmRgK-pXH9c' || spotifyId !== '4cOdK2wGLETKBW3PvgPWqT') {
    throw new Error('ID extraction mismatch');
  }

  // 3. Verify Metadata Resolution
  console.log('\n[3/5] Verifying metadata resolution on providers...');
  const ytMeta = await ytProvider.getMetadata(ytUrl);
  console.log(`✓ YouTube metadata resolved: "${ytMeta.title}" by ${ytMeta.artists}`);
  console.log(`  Thumbnail: ${ytMeta.artworkUrl}`);

  const spotMeta = await spotifyProvider.getMetadata(spotifyUrl);
  console.log(`✓ Spotify metadata resolved: "${spotMeta.title}" (Provider: ${spotMeta.provider})`);

  const directMeta = await directProvider.getMetadata(directAudioUrl);
  console.log(`✓ Direct Audio metadata resolved: "${directMeta.title}" (Provider: ${directMeta.provider})`);

  // 4. Verify Playlist Extraction
  console.log('\n[4/5] Verifying playlist resolution and track streaming...');
  let streamedItemCount = 0;
  const playlistRes = await ytProvider.getPlaylist('https://www.youtube.com/playlist?list=PL_bollywood_classics', (track, idx, total) => {
    streamedItemCount++;
  });

  console.log(`✓ Playlist "${playlistRes.title}" extracted ${playlistRes.tracks.length} tracks.`);
  console.log(`✓ Stream progress callback triggered ${streamedItemCount} times.`);
  if (playlistRes.tracks.length === 0) throw new Error('Playlist track extraction failed');

  // 5. Verify Language & Theme Classification for Ingested Track
  console.log('\n[5/5] Verifying metadata classification pipeline for ingested URLs...');
  const cleaned = cleanTitle(ytMeta.title);
  const languages = classifyLanguages(['bollywood-melody'], cleaned, ytMeta.artists);
  const theme = ThemeResolver.resolveForPlaylist('bollywood-melody');

  console.log(`✓ Ingested Title: "${cleaned}"`);
  console.log(`✓ Classified Languages: [${languages.join(', ')}]`);
  console.log(`✓ Resolved Mood Theme: ${theme.id} (${theme.name})`);

  console.log('\n✨ Phase 3 URL Ingestion & Metadata Resolution Verified Successfully! 🎉\n');
}

runPhase3Verification().catch(err => {
  console.error('[Phase 3 Verification Error]:', err);
  process.exit(1);
});
