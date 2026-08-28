import fs from 'fs';
import mongoose from 'mongoose';
import { parse } from 'csv-parse/sync';
import { SongModel } from '../models/Song';
import { PlaylistModel } from '../models/Playlist';
import { ImportJobModel } from '../models/ImportJob';
import { CsvPreviewReport, Song } from '@sur-o-jhankaar/shared-types';
import { cleanTitle, normalizeTitle } from '../utils/titleNormalizer';
import { classifyLanguages } from '../utils/languageClassifier';
import { YouTubeProvider } from '../providers/youtube';
import { SpotifyProvider } from '../providers/spotify';
import { RealTimeEvents } from '../sockets/eventEmitters';

const youtubeProvider = new YouTubeProvider();
const spotifyProvider = new SpotifyProvider();

export class CsvImportService {
  public static parseCsvFile(filePath: string): any[] {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  }

  public static async generatePreview(filePath: string, originalFileName: string): Promise<CsvPreviewReport> {
    const records = this.parseCsvFile(filePath);
    const playlistsMap = new Map<string, number>();
    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    const sampleRows: Partial<Song>[] = [];

    let existingYoutubeIds = new Set<string>();
    if (mongoose.connection.readyState === 1) {
      try {
        const existingDocs = await SongModel.find({ youtubeVideoId: { $exists: true } }).select('youtubeVideoId').lean();
        existingYoutubeIds = new Set(existingDocs.map((s: any) => s.youtubeVideoId));
      } catch {
        // Continue with empty set if DB query fails
      }
    }

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const title = row.title;
      const youtubeUrl = row.youtube_url;
      const spotifyUrl = row.spotify_url;

      if (!title || (!youtubeUrl && !spotifyUrl)) {
        invalidCount++;
        continue;
      }

      validCount++;

      const videoId = youtubeUrl ? youtubeProvider.parseId(youtubeUrl) : null;
      if (videoId && existingYoutubeIds.has(videoId)) {
        duplicateCount++;
      }

      // Collect playlist occurrences
      if (row.playlists) {
        const rawPlaylists = row.playlists.split(';').map((p: string) => p.trim()).filter(Boolean);
        rawPlaylists.forEach((slug: string) => {
          playlistsMap.set(slug, (playlistsMap.get(slug) || 0) + 1);
        });
      }

      if (sampleRows.length < 5) {
        const cleaned = cleanTitle(title);
        sampleRows.push({
          title: cleaned,
          artists: row.artists || 'Unknown Artist',
          kind: row.kind === 'spoken_word' ? 'spoken_word' : 'music',
          durationSeconds: parseInt(row.duration_seconds || '0', 10),
          score: parseFloat(row.score || '50'),
          youtubeUrl,
          playlists: row.playlists ? row.playlists.split(';').map((p: string) => p.trim()) : []
        });
      }
    }

    const playlistsDetected = Array.from(playlistsMap.entries()).map(([slug, count]) => ({
      slug,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      count
    }));

    return {
      fileName: originalFileName,
      totalDetected: records.length,
      playlistsDetected,
      validCount,
      duplicateCount,
      invalidCount,
      sampleRows
    };
  }

  public static async executeImport(filePath: string, jobId: string): Promise<void> {
    const job = await ImportJobModel.findById(jobId);
    if (!job) return;

    job.status = 'PROCESSING';
    job.startedAt = new Date();
    await job.save();

    const records = this.parseCsvFile(filePath);
    job.total = records.length;
    await job.save();

    let processed = 0;
    let imported = 0;
    let existing = 0;
    let skipped = 0;
    let failed = 0;

    for (let index = 0; index < records.length; index++) {
      // Check if cancelled
      const freshJob = await ImportJobModel.findById(jobId).select('status');
      if (freshJob?.status === 'CANCELLED') {
        break;
      }

      const row = records[index];
      const rawTitle = row.title;
      const youtubeUrl = row.youtube_url || '';
      const spotifyUrl = row.spotify_url || '';

      if (!rawTitle || (!youtubeUrl && !spotifyUrl)) {
        skipped++;
        processed++;
        continue;
      }

      try {
        const cleanedTitle = cleanTitle(rawTitle);
        const normalized = normalizeTitle(cleanedTitle);
        const playlists = row.playlists ? row.playlists.split(';').map((p: string) => p.trim()).filter(Boolean) : [];
        const languages = classifyLanguages(playlists, cleanedTitle, row.artists || '');
        const kind = row.kind === 'spoken_word' ? 'spoken_word' : 'music';
        const score = parseFloat(row.score || '70');
        const durationSeconds = parseInt(row.duration_seconds || '200', 10);
        const youtubeVideoId = youtubeUrl ? youtubeProvider.parseId(youtubeUrl) : null;
        const spotifyTrackId = spotifyUrl ? spotifyProvider.parseId(spotifyUrl) : null;

        // Duplicate Check
        let existingSong = null;
        if (youtubeVideoId) {
          existingSong = await SongModel.findOne({ youtubeVideoId });
        } else if (spotifyTrackId) {
          existingSong = await SongModel.findOne({ spotifyTrackId });
        }

        if (existingSong) {
          // Merge playlists and retain highest score
          const mergedPlaylists = Array.from(new Set([...existingSong.playlists, ...playlists]));
          existingSong.playlists = mergedPlaylists;
          if (score > (existingSong.score || 0)) existingSong.score = score;
          await existingSong.save();
          existing++;
        } else {
          const artworkUrl = youtubeVideoId
            ? `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`
            : undefined;

          const newSong = await SongModel.create({
            title: cleanedTitle,
            rawTitle,
            normalizedTitle: normalized,
            artists: row.artists || 'Unknown Channel',
            album: row.album || undefined,
            durationSeconds,
            kind,
            playlists,
            score,
            youtubeUrl: youtubeUrl || undefined,
            youtubeVideoId: youtubeVideoId || undefined,
            spotifyUrl: spotifyUrl || undefined,
            spotifyTrackId: spotifyTrackId || undefined,
            languages,
            artworkUrl,
            thumbnailUrl: artworkUrl,
            provider: youtubeUrl ? 'youtube' : 'spotify',
            sourceType: 'csv',
            isActive: true
          });

          imported++;
          RealTimeEvents.emitImportSongImported(jobId, newSong as unknown as Song);
        }
      } catch (err) {
        failed++;
        job.errors.push({
          row: index + 1,
          title: rawTitle,
          reason: (err as Error).message,
          timestamp: new Date().toISOString()
        });
        RealTimeEvents.emitImportSongFailed(jobId, index + 1, (err as Error).message);
      }

      processed++;

      // Emit progress periodically
      if (processed % 20 === 0 || processed === records.length) {
        job.processed = processed;
        job.imported = imported;
        job.existing = existing;
        job.skipped = skipped;
        job.failed = failed;
        job.currentItem = rawTitle;
        await job.save();

        RealTimeEvents.emitImportProgress(jobId, processed, records.length, rawTitle);
      }
    }

    // Recalculate all playlist counts
    const allPlaylists = await PlaylistModel.find();
    for (const pl of allPlaylists) {
      const count = await SongModel.countDocuments({ playlists: pl.slug, isActive: true });
      pl.songCount = count;
      await pl.save();
    }

    job.status = job.status === 'CANCELLED' ? 'CANCELLED' : failed > 0 && imported === 0 ? 'FAILED' : 'COMPLETED';
    job.completedAt = new Date();
    await job.save();

    RealTimeEvents.emitImportCompleted(jobId, job.toObject() as any);
  }
}
