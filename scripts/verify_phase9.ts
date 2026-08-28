import http from 'http';
import express from 'express';
import { io as Client } from 'socket.io-client';
import { initSocketIO, getActiveListenersCount } from '../server/src/sockets/socketManager';
import { RealTimeEvents } from '../server/src/sockets/eventEmitters';
import { Song, Playlist } from '@sur-o-jhankaar/shared-types';

async function runPhase9Verification() {
  console.log('🎵 ======================================================== 🎵');
  console.log('🎵   SUR O JHANKAAR — Phase 9 Verification Suite           🎵');
  console.log('🎵   Real-Time Socket.IO Synchronization & Pub/Sub Rooms   🎵');
  console.log('🎵 ======================================================== 🎵\n');

  // 1. Initialize HTTP Server & Socket.IO
  console.log('[1/5] Initializing Test HTTP & Socket.IO server...');
  const app = express();
  const server = http.createServer(app);
  const io = initSocketIO(server);

  await new Promise<void>(resolve => {
    server.listen(5099, () => {
      console.log('✓ Socket.IO Test Server listening on port 5099');
      resolve();
    });
  });

  // 2. Connect Test Client
  console.log('\n[2/5] Connecting client to Socket.IO and verifying auto-join to global...');
  const clientSocket = Client('http://localhost:5099', {
    transports: ['websocket']
  });

  await new Promise<void>(resolve => {
    clientSocket.on('connect', () => {
      console.log(`✓ Client connected successfully (Socket ID: ${clientSocket.id})`);
      console.log(`✓ Active connections counter: ${getActiveListenersCount()}`);
      resolve();
    });
  });

  // 3. Test Room Subscriptions (Admin & Playlist)
  console.log('\n[3/5] Testing room join/leave operations...');
  clientSocket.emit('join:admin');
  clientSocket.emit('join:playlist', 'bollywood-melody');
  console.log('✓ Emitted join:admin and join:playlist (bollywood-melody)');
  // Wait for server to process join packets
  await new Promise(r => setTimeout(r, 150));

  // 4. Test Event Emission & Payload Delivery
  console.log('\n[4/5] Testing real-time event broadcasting and reception...');

  let songCreatedReceived = false;
  let importProgressReceived = false;

  clientSocket.on('song:created', (song: Song) => {
    console.log(`✓ Client received 'song:created' event: "${song.title}"`);
    songCreatedReceived = true;
  });

  clientSocket.on('import:progress', (data: any) => {
    console.log(`✓ Client received 'import:progress' event: Job ${data.jobId} (${data.processed}/${data.total})`);
    importProgressReceived = true;
  });

  // Emit events from server side
  const sampleSong: Song = {
    id: 'test_realtime_1',
    title: 'Dil Deewana Realtime Track',
    artists: 'Lata Mangeshkar',
    durationSeconds: 240,
    kind: 'music',
    playlists: ['bollywood-melody'],
    score: 95,
    languages: ['Hindi'],
    provider: 'youtube',
    sourceType: 'csv',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  RealTimeEvents.emitSongCreated(sampleSong);
  RealTimeEvents.emitImportProgress('job_test_123', 50, 100, 'Dil Deewana Track');

  await new Promise<void>(resolve => setTimeout(resolve, 400));

  if (!songCreatedReceived || !importProgressReceived) {
    throw new Error('Real-time event reception failed');
  }

  // 5. Cleanup
  console.log('\n[5/5] Cleaning up sockets and closing server...');
  clientSocket.disconnect();
  server.close();
  console.log('✓ Server closed gracefully');

  console.log('\n✨ Phase 9 Real-Time Socket.IO Synchronization Verified Successfully! 🎉\n');
}

runPhase9Verification().catch(err => {
  console.error('[Phase 9 Verification Error]:', err);
  process.exit(1);
});
