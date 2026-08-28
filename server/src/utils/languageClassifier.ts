import { Language } from '@sur-o-jhankaar/shared-types';

export const PLAYLIST_LANGUAGE_MAP: Record<string, Language[]> = {
  'hindi-evergreen': ['Hindi'],
  'bollywood-melody': ['Hindi'],
  'roadside-nostalgia': ['Hindi'],
  'bhojpuri-hits': ['Bhojpuri'],
  'modern-bengali': ['Bangla'],
  'bengali-folk': ['Bangla'],
  'bengali-evergreen': ['Bangla'],
  'old-bengali-melody': ['Bangla'],
  'sangeet-bangla-era': ['Bangla'],
  'manbhum': ['Bangla'],
  'rabindra-sangeet': ['Bangla'],
  'shyama-sangeet': ['Bangla'],
  'durga-pujo-special': ['Bangla'],
  'sunday-suspense': ['Bangla']
};

export function classifyLanguages(playlists: string[], title = '', artists = ''): Language[] {
  const languageSet = new Set<Language>();

  for (const slug of playlists) {
    const langs = PLAYLIST_LANGUAGE_MAP[slug];
    if (langs) {
      langs.forEach(l => languageSet.add(l));
    }
  }

  if (languageSet.size > 0) {
    return Array.from(languageSet);
  }

  // Fallback text heuristic
  const combined = `${title} ${artists}`.toLowerCase();
  if (/bhojpuri|pawan\s*singh|khesari|shilpi\s*raj|neelkamal/i.test(combined)) {
    return ['Bhojpuri'];
  }
  if (/bengali|bangla|rabindra|shyama|purulia|anupam\s*roy|arijit.*bangla/i.test(combined) || /[\u0980-\u09FF]/.test(combined)) {
    return ['Bangla'];
  }
  if (/hindi|bollywood|kishore\s*kumar|lata|rafi|mukesh/i.test(combined) || /[\u0900-\u097F]/.test(combined)) {
    return ['Hindi'];
  }

  return ['Hindi'];
}
