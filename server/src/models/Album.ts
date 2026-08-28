import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAlbumDocument extends Document {
  title: string;
  normalizedTitle: string;
  artistId?: Types.ObjectId;
  artistName?: string;
  releaseYear?: number;
  artworkUrl?: string;
  genres: string[];
  songCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AlbumSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    normalizedTitle: { type: String, required: true, index: true },
    artistId: { type: Schema.Types.ObjectId, ref: 'Artist' },
    artistName: { type: String },
    releaseYear: { type: Number },
    artworkUrl: { type: String },
    genres: [{ type: String }],
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

export const AlbumModel = mongoose.models.Album || mongoose.model<IAlbumDocument>('Album', AlbumSchema);
