import mongoose, { Schema, Document } from 'mongoose';
import { MoodThemeId, BackgroundType, MotionIntensity } from '@sur-o-jhankaar/shared-types';

export interface IThemeDocument extends Document {
  themeId: MoodThemeId;
  name: string;
  description: string;
  backgroundType: BackgroundType;
  palette: string[];
  accentColor: string;
  glowColor: string;
  textColor: string;
  animation: string;
  particleEffect: string;
  grain: boolean;
  motionIntensity: MotionIntensity;
  cssVariables: Map<string, string>;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ThemeSchema: Schema = new Schema(
  {
    themeId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    backgroundType: { type: String, required: true },
    palette: [{ type: String }],
    accentColor: { type: String, required: true },
    glowColor: { type: String, required: true },
    textColor: { type: String, required: true },
    animation: { type: String, default: 'spotlight' },
    particleEffect: { type: String, default: 'dust' },
    grain: { type: Boolean, default: true },
    motionIntensity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    cssVariables: { type: Map, of: String },
    isCustom: { type: Boolean, default: false }
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

export const ThemeModel = mongoose.models.Theme || mongoose.model<IThemeDocument>('Theme', ThemeSchema);
