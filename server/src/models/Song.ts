import mongoose, { Schema, Document } from 'mongoose';
import { SongKind, Language, ProviderType, SourceType } from '@sur-o-jhankaar/shared-types';

export interface ISongDocument extends Document {
  title: string;
  rawTitle?: string;
  normalizedTitle: string;
  artists: string;
  displayArtist?: string;
  album?: string;
  durationSeconds: number;
  kind: SongKind;
  playlists: string[];
  score: number;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  spotifyUrl?: string;
  spotifyTrackId?: string;
  directAudioUrl?: string;
  languages: Language[];
  genres: string[];
  moods: string[];
  songTheme?: string;
  songType?: string;
  artworkUrl?: string;
  thumbnailUrl?: string;
  provider: ProviderType;
  sourceType: SourceType;
  isActive: boolean;
  metadataSource?: string;
  playCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SongSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    rawTitle: { type: String, trim: true },
    normalizedTitle: { type: String, required: true, index: true },
    artists: { type: String, required: true, trim: true, index: true },
    displayArtist: { type: String, trim: true, index: true },
    album: { type: String, trim: true },
    durationSeconds: { type: Number, default: 0 },
    kind: { type: String, enum: ['music', 'spoken_word'], default: 'music', index: true },
    playlists: [{ type: String, index: true }],
    score: { type: Number, default: 50, index: true },
    youtubeUrl: { type: String, trim: true },
    youtubeVideoId: { type: String, trim: true, index: true, sparse: true },
    spotifyUrl: { type: String, trim: true },
    spotifyTrackId: { type: String, trim: true, index: true, sparse: true },
    directAudioUrl: { type: String, trim: true },
    languages: [{ type: String, enum: ['Hindi', 'Bangla', 'Bhojpuri', 'Other'], index: true }],
    genres: [{ type: String, index: true }],
    moods: [{ type: String, index: true }],
    songTheme: { type: String },
    songType: { type: String },
    artworkUrl: { type: String },
    thumbnailUrl: { type: String },
    provider: { type: String, enum: ['youtube', 'spotify', 'direct'], default: 'youtube' },
    sourceType: { type: String, enum: ['csv', 'url_single', 'url_playlist', 'manual'], default: 'csv' },
    isActive: { type: Boolean, default: true, index: true },
    metadataSource: { type: String },
    playCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 }
  },
  {
    timestamps: true,
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

SongSchema.index({ normalizedTitle: 'text', displayArtist: 'text', artists: 'text', title: 'text' });
SongSchema.index({ playlists: 1, score: -1 });
SongSchema.index({ languages: 1, score: -1 });

export const SongModel = mongoose.models.Song || mongoose.model<ISongDocument>('Song', SongSchema);
