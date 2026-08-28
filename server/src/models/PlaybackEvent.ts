import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPlaybackEventDocument extends Document {
  songId: Types.ObjectId;
  playlistSlug?: string;
  source: 'player' | 'radio' | 'mood' | 'search';
  playbackDuration: number;
  completed: boolean;
  devicePlatform: 'web' | 'android';
  createdAt: Date;
}

const PlaybackEventSchema: Schema = new Schema(
  {
    songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true, index: true },
    playlistSlug: { type: String, index: true },
    source: { type: String, enum: ['player', 'radio', 'mood', 'search'], default: 'player', index: true },
    playbackDuration: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    devicePlatform: { type: String, enum: ['web', 'android'], default: 'web' }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

PlaybackEventSchema.index({ createdAt: -1 });

export const PlaybackEventModel = mongoose.models.PlaybackEvent || mongoose.model<IPlaybackEventDocument>('PlaybackEvent', PlaybackEventSchema);
