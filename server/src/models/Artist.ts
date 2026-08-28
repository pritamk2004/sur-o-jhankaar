import mongoose, { Schema, Document } from 'mongoose';
import { Language } from '@sur-o-jhankaar/shared-types';

export interface IArtistDocument extends Document {
  name: string;
  normalizedName: string;
  image?: string;
  bio?: string;
  languages: Language[];
  songCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ArtistSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    normalizedName: { type: String, required: true, index: true },
    image: { type: String },
    bio: { type: String },
    languages: [{ type: String, enum: ['Hindi', 'Bangla', 'Bhojpuri', 'Other'] }],
    songCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }
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

ArtistSchema.index({ name: 'text', normalizedName: 'text' });

export const ArtistModel = mongoose.models.Artist || mongoose.model<IArtistDocument>('Artist', ArtistSchema);
