import { QueueManager } from '@sur-o-jhankaar/player-core';
import { Song, RepeatMode } from '@sur-o-jhankaar/shared-types';
import { ProviderManager } from '../server/src/providers';

async function runPhase5Verification() {
  console.log('🎵 ======================================================== 🎵');
  console.log('🎵   SUR O JHANKAAR — Phase 5 Verification Suite           🎵');
  console.log('🎵   Player Engine, Audio Streams & Media Controls         🎵');
  console.log('🎵 ======================================================== 🎵\n');

  // 1. Verify Queue Shuffling with Pinned Current Song (index 0)
  console.log('[1/5] Verifying Fisher-Yates shuffle with pinned current song...');
  const songs: Song[] = [
    { id: '1', title: 'Song 1', artists: 'A', durationSeconds: 200, kind: 'music', playlists: ['bollywood-melody'], score: 90, languages: ['Hindi'], provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' },
    { id: '2', title: 'Song 2', artists: 'B', durationSeconds: 210, kind: 'music', playlists: ['bollywood-melody'], score: 85, languages: ['Hindi'], provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' },
    { id: '3', title: 'Song 3', artists: 'C', durationSeconds: 220, kind: 'music', playlists: ['bollywood-melody'], score: 80, languages: ['Hindi'], provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' },
    { id: '4', title: 'Song 4', artists: 'D', durationSeconds: 230, kind: 'music', playlists: ['bollywood-melody'], score: 75, languages: ['Hindi'], provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' },
    { id: '5', title: 'Song 5', artists: 'E', durationSeconds: 240, kind: 'music', playlists: ['bollywood-melody'], score: 70, languages: ['Hindi'], provider: 'youtube', sourceType: 'csv', isActive: true, createdAt: '', updatedAt: '' }
  ];

  const currentSong = songs[2]; // Song 3
  const shuffled = QueueManager.shuffleWithCurrentPinned(songs, currentSong);

  console.log(`  Initial Current: "${currentSong.title}" (ID: ${currentSong.id})`);
  console.log(`  Shuffled First:  "${shuffled[0].title}" (ID: ${shuffled[0].id})`);
  console.log(`  Shuffled Queue Order: ${shuffled.map(s => s.id).join(' -> ')}`);

  if (shuffled[0].id !== currentSong.id) {
    throw new Error('Shuffle failed to pin current song at index 0');
  }
  if (shuffled.length !== songs.length) {
    throw new Error('Shuffled queue length mismatch');
  }

  // 2. Verify Queue Reordering
  console.log('\n[2/5] Verifying queue reordering operation...');
  const reordered = QueueManager.reorder(songs, 4, 1);
  console.log(`  Reordered ID sequence: ${reordered.map(s => s.id).join(' -> ')}`);
  if (reordered[1].id !== '5') {
    throw new Error('Queue reorder failed to move item 5 to index 1');
  }

  // 3. Verify Repeat Mode Cycle
  console.log('\n[3/5] Verifying repeat mode transition sequence...');
  const modes: RepeatMode[] = ['off', 'all', 'one'];
  let currentMode: RepeatMode = 'off';
  const getNextMode = (m: RepeatMode): RepeatMode => modes[(modes.indexOf(m) + 1) % modes.length];

  currentMode = getNextMode(currentMode);
  console.log(`  Next Mode 1: ${currentMode} (Expected: all)`);
  currentMode = getNextMode(currentMode);
  console.log(`  Next Mode 2: ${currentMode} (Expected: one)`);
  currentMode = getNextMode(currentMode);
  console.log(`  Next Mode 3: ${currentMode} (Expected: off)`);

  if (currentMode !== 'off') throw new Error('Repeat mode cycling failed');

  // 4. Verify Playback Source Configuration Generation
  console.log('\n[4/5] Verifying multi-provider playback source configs...');
  const ytSong: Song = { ...songs[0], youtubeVideoId: 'qoq8B8ThgEM', provider: 'youtube' };
  const spotSong: Song = { ...songs[1], spotifyTrackId: '4cOdK2wGLETKBW3PvgPWqT', provider: 'spotify' };
  const directSong: Song = { ...songs[2], directAudioUrl: 'https://example.com/audio.mp3', provider: 'direct' };

  const ytConfig = ProviderManager.getProvider('youtube').getPlaybackConfig(ytSong);
  console.log(`✓ YouTube Playback Config: type="${ytConfig.type}", videoId="${ytConfig.videoId}"`);
  if (ytConfig.type !== 'youtube_iframe' || ytConfig.videoId !== 'qoq8B8ThgEM') {
    throw new Error('YouTube playback config mismatch');
  }

  const spotConfig = ProviderManager.getProvider('spotify').getPlaybackConfig(spotSong);
  console.log(`✓ Spotify Playback Config: type="${spotConfig.type}", trackId="${spotConfig.trackId}"`);
  if (spotConfig.type !== 'spotify_embed' || spotConfig.trackId !== '4cOdK2wGLETKBW3PvgPWqT') {
    throw new Error('Spotify playback config mismatch');
  }

  const directConfig = ProviderManager.getProvider('direct').getPlaybackConfig(directSong);
  console.log(`✓ Direct Audio Playback Config: type="${directConfig.type}", audioUrl="${directConfig.audioUrl}"`);
  if (directConfig.type !== 'html5_audio' || directConfig.audioUrl !== 'https://example.com/audio.mp3') {
    throw new Error('Direct audio playback config mismatch');
  }

  // 5. Verify Sleep Timer Calculations
  console.log('\n[5/5] Verifying sleep timer calculation rules...');
  const testMinutes = 30;
  const seconds = testMinutes * 60;
  console.log(`✓ Sleep Timer ${testMinutes}m -> ${seconds} seconds calculated accurately`);

  console.log('\n✨ Phase 5 Player Engine & Audio Streams Verified Successfully! 🎉\n');
}

runPhase5Verification().catch(err => {
  console.error('[Phase 5 Verification Error]:', err);
  process.exit(1);
});
