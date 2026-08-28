'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeConfig, MoodThemeId, Song, Playlist } from '@sur-o-jhankaar/shared-types';
import { THEME_REGISTRY, DEFAULT_THEME, ThemeResolver } from '@sur-o-jhankaar/theme-engine';

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setThemeById: (themeId: MoodThemeId) => void;
  updateThemeForSong: (song?: Song | null, playlist?: Playlist | null) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: DEFAULT_THEME,
  setThemeById: () => {},
  updateThemeForSong: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  const applyCssVariables = (theme: ThemeConfig) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(theme.cssVariables).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    }
  };

  const setThemeById = (themeId: MoodThemeId) => {
    const theme = THEME_REGISTRY[themeId] || DEFAULT_THEME;
    setCurrentTheme(theme);
    applyCssVariables(theme);
  };

  const updateThemeForSong = (song?: Song | null, playlist?: Playlist | null) => {
    const theme = ThemeResolver.resolveForSong(song, playlist);
    setCurrentTheme(theme);
    applyCssVariables(theme);
  };

  useEffect(() => {
    applyCssVariables(currentTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setThemeById, updateThemeForSong }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
