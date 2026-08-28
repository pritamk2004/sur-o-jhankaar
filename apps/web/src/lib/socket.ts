import { io, Socket } from 'socket.io-client';
import { Song, Playlist, ThemeConfig } from '@sur-o-jhankaar/shared-types';

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket && typeof window !== 'undefined') {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });
  }
  return socket as Socket;
}

export class RealTimeClient {
  public static joinPlaylistRoom(slug: string): () => void {
    const s = getSocketClient();
    if (!s) return () => {};
    s.emit('join:playlist', slug);
    return () => s.emit('leave:playlist', slug);
  }

  public static joinAdminRoom(): () => void {
    const s = getSocketClient();
    if (!s) return () => {};
    s.emit('join:admin');
    return () => s.emit('leave:admin');
  }

  public static onSongCreated(callback: (song: Song) => void): () => void {
    const s = getSocketClient();
    if (!s) return () => {};
    s.on('song:created', callback);
    return () => s.off('song:created', callback);
  }

  public static onPlaylistUpdated(callback: (playlist: Playlist) => void): () => void {
    const s = getSocketClient();
    if (!s) return () => {};
    s.on('playlist:updated', callback);
    return () => s.off('playlist:updated', callback);
  }

  public static onThemeUpdated(callback: (theme: ThemeConfig) => void): () => void {
    const s = getSocketClient();
    if (!s) return () => {};
    s.on('theme:updated', callback);
    return () => s.off('theme:updated', callback);
  }

  public static sendHeartbeat(data: { songId?: string; position?: number; state?: string }): void {
    const s = getSocketClient();
    if (s && s.connected) {
      s.emit('player:heartbeat', data);
    }
  }
}
