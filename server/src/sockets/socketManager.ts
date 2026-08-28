import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../config/env';

let io: SocketIOServer | null = null;
let activeConnections = 0;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:3000', 'http://localhost:5173', '*'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    activeConnections++;
    // Automatically join the global room for broadcast updates
    socket.join('global');

    // Playlist room for active playlist listeners
    socket.on('join:playlist', (playlistSlug: string) => {
      if (playlistSlug) {
        socket.join(`playlist:${playlistSlug}`);
      }
    });

    socket.on('leave:playlist', (playlistSlug: string) => {
      if (playlistSlug) {
        socket.leave(`playlist:${playlistSlug}`);
      }
    });

    // Admin room for live import progress & live metrics
    socket.on('join:admin', () => {
      socket.join('admin:updates');
      socket.join('admin:imports');
    });

    socket.on('leave:admin', () => {
      socket.leave('admin:updates');
      socket.leave('admin:imports');
    });

    // Player heartbeat for telemetry
    socket.on('player:heartbeat', (data: { songId?: string; position?: number; state?: string }) => {
      // Ephemeral heartbeat logged or used for live listeners metric
    });

    socket.on('disconnect', () => {
      activeConnections = Math.max(0, activeConnections - 1);
    });
  });

  console.log('[Socket.IO] Real-time engine initialized with global/admin/playlist rooms');
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function getActiveListenersCount(): number {
  return activeConnections;
}
