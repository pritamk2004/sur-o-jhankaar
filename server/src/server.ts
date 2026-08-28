import http from 'http';
import { createApp } from './app';
import { connectDatabase } from './config/db';
import { config } from './config/env';
import { initSocketIO } from './sockets/socketManager';
import { seedInitialAdmin, seedThemesAndPlaylists } from './utils/seedHelper';

async function bootstrap() {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Initialize Socket.IO
  initSocketIO(httpServer);

  // Connect Database & Seed initial models
  const db = await connectDatabase();
  if (db) {
    try {
      await seedInitialAdmin();
      await seedThemesAndPlaylists();
    } catch (seedErr) {
      console.warn('[Bootstrap] Seed initialization warning:', (seedErr as Error).message);
    }
  }

  httpServer.listen(config.port, () => {
    console.log(`
      🎵 =============================================== 🎵
      🎵   SUR O JHANKAAR — Har Sur Mein Ek Kahaani      🎵
      🎵   API Server running on port ${config.port}            🎵
      🎵   Environment: ${config.env.padEnd(31)}  🎵
      🎵   Admin Email: ${config.adminDefaultEmail.padEnd(31)}  🎵
      🎵 =============================================== 🎵
    `);
  });
}

bootstrap().catch(err => {
  console.error('[Fatal Bootstrap Error]:', err);
  process.exit(1);
});
