import mongoose, { Schema, Document } from 'mongoose';
import { MoodThemeId, Language } from '@sur-o-jhankaar/shared-types';

export interface IPlaylistDocument extends Document {
  name: string;
  slug: string;
  description: string;
  artworkUrl?: string;
  background?: string;
  languages: Language[];
  genres: string[];
  moods: string[];
  mood_theme: MoodThemeId;
  themeConfig?: any;
  sourceUrl?: string;
  sourceProvider?: string;
  sourceType?: string;
  isFeatured: boolean;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  songCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: '' },
    artworkUrl: { type: String },
    background: { type: String },
    languages: [{ type: String, enum: ['Hindi', 'Bangla', 'Bhojpuri', 'Other'] }],
    genres: [{ type: String }],
    moods: [{ type: String }],
    mood_theme: { type: String, required: true, index: true },
    themeConfig: { type: Schema.Types.Mixed },
    sourceUrl: { type: String },
    sourceProvider: { type: String },
    sourceType: { type: String },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isPublic: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    songCount: { type: Number, default: 0 }
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

PlaylistSchema.index({ name: 'text', description: 'text' });

export const PlaylistModel = mongoose.models.Playlist || mongoose.model<IPlaylistDocument>('Playlist', PlaylistSchema);
