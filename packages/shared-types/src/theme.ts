export type MoodThemeId =
  | 'cinematic_gold_maroon'
  | 'dusty_sepia_vhs'
  | 'vibrant_folk_festival'
  | 'earthy_terracotta_river'
  | 'neon_teal_purple_city'
  | 'sepia_ivory_gramophone'
  | 'deep_indigo_radio'
  | 'cream_green_tagore'
  | 'deep_red_gold_temple'
  | 'near_black_story_spotlight';

export type BackgroundType =
  | 'cinematic'
  | 'vhs'
  | 'folk'
  | 'terracotta'
  | 'neon'
  | 'sepia'
  | 'indigo'
  | 'cream'
  | 'temple'
  | 'spotlight';

export type MotionIntensity = 'low' | 'medium' | 'high';

export interface ThemeConfig {
  id: MoodThemeId;
  name: string;
  description: string;
  backgroundType: BackgroundType;
  palette: [string, string, string, ...string[]]; // At least 3 hex color codes
  accentColor: string;
  glowColor: string;
  textColor: string;
  animation: string;
  particleEffect: 'dust' | 'spark' | 'leaf' | 'light' | 'smoke' | 'none';
  grain: boolean;
  motionIntensity: MotionIntensity;
  cssVariables: Record<string, string>;
}

export interface ExtractedColors {
  primary: string;
  secondary: string;
  background: string;
  glow: string;
  lightVibrant?: string;
  darkMuted?: string;
}
