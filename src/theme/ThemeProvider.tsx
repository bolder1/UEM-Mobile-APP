import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ColorScheme } from './colors';
import { fonts } from './typography';
import { useAppStore } from '../state/store';

interface ThemeContextValue {
  colors: ColorScheme;
  isDark: boolean;
  fonts: typeof fonts;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useAppStore((s) => s.themeMode);
  const systemScheme = useColorScheme();

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      fonts,
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
