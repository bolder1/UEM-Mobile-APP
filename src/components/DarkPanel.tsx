import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

/** The rounded-skirt hero header used on Home and Profile. It adapts to the
 *  theme via the `heroBg` token — a near-black ink in light mode (premium
 *  contrast) and a deep brand-tinted tone in dark mode (so it doesn't blend
 *  into the dark canvas) — lifted by a soft brand glow and faint orbit rings. */
export const PANEL_INK = '#141518';

export function DarkPanel({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.panel, { backgroundColor: colors.heroBg }, style]}>
      {/* soft brand glow — gives the panel depth and a distinct feel per mode.
          Wrapped in a pointerEvents=none View so it never blocks header taps. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[colors.primary, 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.1, y: 0.9 }}
          style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.22 : 0.14 }]}
        />
      </View>
      <View pointerEvents="none" style={styles.orbitWrap}>
        <View style={[styles.ring, { width: 240, height: 240, right: -70, top: -60 }]} />
        <View style={[styles.ring, { width: 170, height: 170, right: -35, top: -25 }]} />
        <View style={[styles.ring, { width: 104, height: 104, right: -2, top: 10 }]} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  orbitWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
});
