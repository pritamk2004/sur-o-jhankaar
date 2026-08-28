import { Song } from './song';

export type ImportJobType = 'csv' | 'song_url' | 'playlist_url';

export type ImportJobStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED'
  | 'CANCELLED';

export interface ImportJobError {
  row?: number;
  url?: string;
  title?: string;
  reason: string;
  timestamp: string;
}

export interface ImportJob {
  id: string;
  type: ImportJobType;
  sourceUrl?: string;
  provider?: string;
  status: ImportJobStatus;
  total: number;
  processed: number;
  imported: number;
  existing: number;
  skipped: number;
  failed: number;
  currentItem?: string;
  errors: ImportJobError[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CsvPreviewReport {
  fileName: string;
  totalDetected: number;
  playlistsDetected: { slug: string; name: string; count: number }[];
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  sampleRows: Partial<Song>[];
}
