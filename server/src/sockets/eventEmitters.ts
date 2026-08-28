import { getIO } from './socketManager';
import { Song, Playlist, ThemeConfig, ImportJob } from '@sur-o-jhankaar/shared-types';

export class RealTimeEvents {
  public static emitSongCreated(song: Song): void {
    const io = getIO();
    if (!io) return;
    io.emit('song:created', song);
  }

  public static emitSongUpdated(song: Song): void {
    const io = getIO();
    if (!io) return;
    io.emit('song:updated', song);
    // Also notify active playlist rooms
    if (song.playlists) {
      song.playlists.forEach(slug => {
        io.to(`playlist:${slug}`).emit('song:updated', song);
      });
    }
  }

  public static emitSongDeleted(songId: string): void {
    const io = getIO();
    if (!io) return;
    io.emit('song:deleted', { songId });
  }

  public static emitPlaylistCreated(playlist: Playlist): void {
    const io = getIO();
    if (!io) return;
    io.emit('playlist:created', playlist);
  }

  public static emitPlaylistUpdated(playlist: Playlist): void {
    const io = getIO();
    if (!io) return;
    io.emit('playlist:updated', playlist);
    io.to(`playlist:${playlist.slug}`).emit('playlist:updated', playlist);
  }

  public static emitThemeUpdated(theme: ThemeConfig): void {
    const io = getIO();
    if (!io) return;
    io.emit('theme:updated', theme);
  }

  public static emitImportProgress(jobId: string, processed: number, total: number, currentItem?: string): void {
    const io = getIO();
    if (!io) return;
    io.to('admin:imports').emit('import:progress', { jobId, processed, total, currentItem });
  }

  public static emitImportCompleted(jobId: string, job: ImportJob): void {
    const io = getIO();
    if (!io) return;
    io.to('admin:imports').emit('import:completed', { jobId, job });
  }

  public static emitImportSongImported(jobId: string, song: Song): void {
    const io = getIO();
    if (!io) return;
    io.to('admin:imports').emit('import:songImported', { jobId, song });
  }

  public static emitImportSongFailed(jobId: string, row: number | undefined, error: string): void {
    const io = getIO();
    if (!io) return;
    io.to('admin:imports').emit('import:songFailed', { jobId, row, error });
  }
}
