import mongoose, { Schema, Document } from 'mongoose';
import { MoodThemeId } from '@sur-o-jhankaar/shared-types';

export interface IMoodDocument extends Document {
  name: string;
  slug: string;
  icon: string;
  color: string;
  themeId: MoodThemeId;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MoodSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    icon: { type: String, default: '🎵' },
    color: { type: String, default: '#D39B3D' },
    themeId: { type: String, default: 'cinematic_gold_maroon' },
    description: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
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

export const MoodModel = mongoose.models.Mood || mongoose.model<IMoodDocument>('Mood', MoodSchema);
