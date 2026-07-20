import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

/** The rounded-skirt hero header used on Home. It adapts to the theme via the
 *  `heroBg` token — a near-black ink in light mode (premium contrast) and a
 *  deep brand-tinted tone in dark mode (so it doesn't blend into the dark
 *  canvas). Deliberately flat: the content is the hero, not the backdrop. */
export const PANEL_INK = '#141518';

export function DarkPanel({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[styles.panel, { backgroundColor: colors.heroBg }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
});
