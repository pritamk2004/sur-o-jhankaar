import mongoose, { Schema } from 'mongoose';
import { ImportJobType, ImportJobStatus, ImportJobError } from '@sur-o-jhankaar/shared-types';

export interface IImportJob {
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
  startedAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ImportJobSchema = new Schema<IImportJob>(
  {
    type: { type: String, enum: ['csv', 'song_url', 'playlist_url'], required: true },
    sourceUrl: { type: String },
    provider: { type: String },
    status: {
      type: String,
      enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED'],
      default: 'QUEUED',
      index: true
    },
    total: { type: Number, default: 0 },
    processed: { type: Number, default: 0 },
    imported: { type: Number, default: 0 },
    existing: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    currentItem: { type: String },
    errors: [
      {
        row: { type: Number },
        url: { type: String },
        title: { type: String },
        reason: { type: String },
        timestamp: { type: String }
      }
    ],
    startedAt: { type: Date },
    completedAt: { type: Date }
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const ImportJobModel = mongoose.models.ImportJob || mongoose.model<IImportJob>('ImportJob', ImportJobSchema);
