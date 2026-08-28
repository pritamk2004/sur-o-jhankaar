import { SongModel } from '../models/Song';
import { PlaylistModel } from '../models/Playlist';
import { ImportJobModel } from '../models/ImportJob';
import { ProviderManager } from '../providers';
import { Song, Playlist } from '@sur-o-jhankaar/shared-types';
import { cleanTitle, normalizeTitle } from '../utils/titleNormalizer';
import { classifyLanguages } from '../utils/languageClassifier';
import { ThemeResolver } from '@sur-o-jhankaar/theme-engine';
import { RealTimeEvents } from '../sockets/eventEmitters';

export class UrlImportService {
  /**
   * Ingest a single song from a public URL
   */
  public static async importSingleSong(data: {
    url: string;
    title?: string;
    artists?: string;
    displayArtist?: string;
    album?: string;
    playlists?: string[];
    kind?: 'music' | 'spoken_word';
    score?: number;
    languages?: string[];
  }): Promise<Song> {
    const provider = ProviderManager.detectProviderFromUrl(data.url);
    const meta = await provider.getMetadata(data.url);

    const rawTitle = data.title || meta.title;
    const cleanedTitle = cleanTitle(rawTitle);
    const normalizedTitle = normalizeTitle(cleanedTitle);
    const playlists = data.playlists || ['bollywood-melody'];
    const languages = data.languages?.length
      ? (data.languages as any[])
      : classifyLanguages(playlists, cleanedTitle, data.artists || meta.artists);

    // Duplicate Check
    let existingSong = null;
    if (meta.videoId) {
      existingSong = await SongModel.findOne({ youtubeVideoId: meta.videoId });
    } else if (meta.trackId) {
      existingSong = await SongModel.findOne({ spotifyTrackId: meta.trackId });
    }

    if (existingSong) {
      existingSong.playlists = Array.from(new Set([...existingSong.playlists, ...playlists]));
      if (data.displayArtist) existingSong.displayArtist = data.displayArtist;
      if (data.score && data.score > (existingSong.score || 0)) existingSong.score = data.score;
      await existingSong.save();

      const song = { ...existingSong.toObject(), id: existingSong._id.toString() } as Song;
      RealTimeEvents.emitSongUpdated(song);
      return song;
    }

    const newSong = await SongModel.create({
      title: cleanedTitle,
      rawTitle,
      normalizedTitle,
      artists: data.artists || meta.artists,
      displayArtist: data.displayArtist,
      album: data.album || meta.album,
      durationSeconds: meta.durationSeconds || 240,
      kind: data.kind || 'music',
      playlists,
      score: data.score || 75,
      youtubeUrl: provider.id === 'youtube' ? data.url : undefined,
      youtubeVideoId: meta.videoId,
      spotifyUrl: provider.id === 'spotify' ? data.url : undefined,
      spotifyTrackId: meta.trackId,
      languages,
      artworkUrl: meta.artworkUrl,
      thumbnailUrl: meta.thumbnailUrl,
      provider: provider.id,
      sourceType: 'url_single',
      isActive: true
    });

    const song = { ...newSong.toObject(), id: newSong._id.toString() } as Song;
    RealTimeEvents.emitSongCreated(song);

    // Increment playlist count
    await PlaylistModel.updateMany(
      { slug: { $in: playlists } },
      { $inc: { songCount: 1 } }
    );

    return song;
  }

  /**
   * Ingest an entire playlist from a public URL asynchronously as an ImportJob
   */
  public static async executePlaylistImport(url: string, jobId: string): Promise<void> {
    const job = await ImportJobModel.findById(jobId);
    if (!job) return;

    job.status = 'PROCESSING';
    job.startedAt = new Date();
    await job.save();

    try {
      const provider = ProviderManager.detectProviderFromUrl(url);
      const playlistMeta = await provider.getPlaylist(url);

      const playlistSlug = playlistMeta.id.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') || `pl-${Date.now()}`;
      const playlistTheme = ThemeResolver.resolveForPlaylist(playlistSlug);

      // Create or update Playlist document in MongoDB
      let playlistDoc = await PlaylistModel.findOne({ slug: playlistSlug });
      if (!playlistDoc) {
        playlistDoc = await PlaylistModel.create({
          name: playlistMeta.title,
          slug: playlistSlug,
          description: playlistMeta.description,
          artworkUrl: playlistMeta.artworkUrl,
          languages: ['Hindi'],
          mood_theme: playlistTheme.id,
          themeConfig: playlistTheme,
          sourceUrl: url,
          sourceProvider: provider.id,
          sourceType: 'url_playlist',
          isPublic: true,
          isActive: true
        });
        RealTimeEvents.emitPlaylistCreated({ ...playlistDoc.toObject(), id: playlistDoc._id.toString() } as Playlist);
      }

      job.total = playlistMeta.tracks.length;
      await job.save();

      let imported = 0;
      let existing = 0;
      let failed = 0;

      for (let i = 0; i < playlistMeta.tracks.length; i++) {
        // Check for cancellation
        const freshJob = await ImportJobModel.findById(jobId).select('status');
        if (freshJob?.status === 'CANCELLED') break;

        const track = playlistMeta.tracks[i];
        try {
          const cleanedTitle = cleanTitle(track.title);
          const normalizedTitle = normalizeTitle(cleanedTitle);
          const languages = classifyLanguages([playlistSlug], cleanedTitle, track.artists);

          let existingSong = null;
          if (track.videoId) {
            existingSong = await SongModel.findOne({ youtubeVideoId: track.videoId });
          } else if (track.trackId) {
            existingSong = await SongModel.findOne({ spotifyTrackId: track.trackId });
          }

          if (existingSong) {
            if (!existingSong.playlists.includes(playlistSlug)) {
              existingSong.playlists.push(playlistSlug);
              await existingSong.save();
            }
            existing++;
          } else {
            const newSong = await SongModel.create({
              title: cleanedTitle,
              rawTitle: track.title,
              normalizedTitle,
              artists: track.artists,
              durationSeconds: track.durationSeconds,
              kind: 'music',
              playlists: [playlistSlug],
              score: 75,
              youtubeUrl: track.sourceUrl,
              youtubeVideoId: track.videoId,
              spotifyTrackId: track.trackId,
              languages,
              artworkUrl: track.artworkUrl,
              thumbnailUrl: track.thumbnailUrl,
              provider: track.provider,
              sourceType: 'url_playlist',
              isActive: true
            });
            imported++;
            RealTimeEvents.emitImportSongImported(jobId, newSong as unknown as Song);
          }
        } catch (itemErr) {
          failed++;
          job.errors.push({
            row: i + 1,
            title: track.title,
            reason: (itemErr as Error).message,
            timestamp: new Date().toISOString()
          });
          RealTimeEvents.emitImportSongFailed(jobId, i + 1, (itemErr as Error).message);
        }

        job.processed = i + 1;
        job.imported = imported;
        job.existing = existing;
        job.failed = failed;
        job.currentItem = track.title;
        await job.save();

        RealTimeEvents.emitImportProgress(jobId, i + 1, playlistMeta.tracks.length, track.title);
      }

      // Refresh playlist song count
      const finalCount = await SongModel.countDocuments({ playlists: playlistSlug, isActive: true });
      playlistDoc.songCount = finalCount;
      await playlistDoc.save();

      job.status = job.status === 'CANCELLED' ? 'CANCELLED' : failed > 0 && imported === 0 ? 'FAILED' : 'COMPLETED';
      job.completedAt = new Date();
      await job.save();

      RealTimeEvents.emitImportCompleted(jobId, job.toObject() as any);
    } catch (fatalErr) {
      job.status = 'FAILED';
      job.completedAt = new Date();
      job.errors.push({
        reason: (fatalErr as Error).message,
        timestamp: new Date().toISOString()
      });
      await job.save();
    }
  }
}
