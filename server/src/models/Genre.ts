import mongoose, { Schema, Document } from 'mongoose';
import { Language } from '@sur-o-jhankaar/shared-types';

export interface IGenreDocument extends Document {
  name: string;
  slug: string;
  languages: Language[];
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GenreSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    languages: [{ type: String, enum: ['Hindi', 'Bangla', 'Bhojpuri', 'Other'] }],
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
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

export const GenreModel = mongoose.models.Genre || mongoose.model<IGenreDocument>('Genre', GenreSchema);
