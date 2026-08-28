import mongoose, { Schema, Document } from 'mongoose';
import { Language } from '@sur-o-jhankaar/shared-types';

export interface IRadioConfigDocument extends Document {
  name: string;
  language: 'All' | Language;
  frequency: number;
  description: string;
  includedPlaylists: string[];
  excludedPlaylists: string[];
  historyWindowSize: number;
  recentSongPenalty: number;
  artistRepeatPenalty: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RadioConfigurationSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    language: { type: String, enum: ['All', 'Hindi', 'Bangla', 'Bhojpuri', 'Other'], default: 'All', index: true },
    frequency: { type: Number, default: 98.7 },
    description: { type: String, default: '' },
    includedPlaylists: [{ type: String }],
    excludedPlaylists: [{ type: String }],
    historyWindowSize: { type: Number, default: 30 },
    recentSongPenalty: { type: Number, default: 40 },
    artistRepeatPenalty: { type: Number, default: 25 },
    isDefault: { type: Boolean, default: false }
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

export const RadioConfigurationModel =
  mongoose.models.RadioConfiguration ||
  mongoose.model<IRadioConfigDocument>('RadioConfiguration', RadioConfigurationSchema);
