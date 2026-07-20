import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/spacing';

/* ------------------------------------------------------------------ *
 *  Apple-style glass, tuned from research:
 *   · Small chips & pills: translucent fill + 1px light hairline,
 *     NO blur — at this size blur costs more than it reads.
 *   · Panels/sheets (static once presented): real backdrop blur.
 *  Glass only reads when there is something behind it — use it over
 *  hero gradients, dark panels and imagery, not flat plain surfaces.
 *
 *  Recipes (dark): chip fill white 8% · hairline white 13%
 *                  panel fill dark 72% · blur 28 · top hairline 10%
 * ------------------------------------------------------------------ */

/** Blurred glass panel — bottom sheets, overlays, floating toolbars.
 *  Static surfaces only: never animate a blur layer, fade it in whole. */
export function Glass({
  children,
  style,
  radius = 18,
  on = 'auto',
  intensity,
  fill,
  borderColor,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** Which backdrop the glass sits on. 'auto' follows the theme. */
  on?: 'auto' | 'dark' | 'light';
  intensity?: number;
  fill?: string;
  borderColor?: string;
}) {
  const { isDark } = useTheme();
  const dark = on === 'auto' ? isDark : on === 'dark';
  const fillColor = fill ?? (dark ? 'rgba(20,22,26,0.72)' : 'rgba(255,255,255,0.62)');
  const edge = borderColor ?? (dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.7)');
  return (
    <View style={[styles.wrap, { borderRadius: radius, borderColor: edge }, style]}>
      <BlurView
        intensity={intensity ?? (dark ? 28 : 22)}
        tint={dark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: fillColor }]} />
      {children}
    </View>
  );
}

/** Small glass chip for icons — translucent fill + hairline, no blur. */
export function GlassChip({
  children,
  size = 38,
  radius = 12,
  on = 'auto',
  tint,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  radius?: number;
  on?: 'auto' | 'dark' | 'light';
  /** Optional state color mixed into the glass (12% fill / 40% hairline). */
  tint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { isDark } = useTheme();
  const dark = on === 'auto' ? isDark : on === 'dark';
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tint ? hexA(tint, 0.14) : dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
          borderColor: tint ? hexA(tint, 0.4) : dark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.75)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Frosted status pill — fill + hairline, optional state tint, no blur. */
export function GlassPill({
  children,
  on = 'auto',
  tint,
  style,
}: {
  children: React.ReactNode;
  on?: 'auto' | 'dark' | 'light';
  tint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { isDark } = useTheme();
  const dark = on === 'auto' ? isDark : on === 'dark';
  return (
    <View
      style={[
        styles.wrap,
        styles.pill,
        {
          backgroundColor: tint ? hexA(tint, 0.12) : dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
          borderColor: tint ? hexA(tint, 0.4) : dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.75)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Embossed disc — the faux-3D "physical object" base: flat fill lifted by a
 *  1px top highlight and a soft inner-bottom shade (CRED/Phantom recipe). */
export function EmbossedDisc({
  size,
  children,
  bg,
  style,
}: {
  size: number;
  children?: React.ReactNode;
  bg?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { isDark, colors } = useTheme();
  const fill = bg ?? (isDark ? '#161B22' : colors.surface);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fill,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
        },
        style,
      ]}
    >
      {/* top light */}
      <LinearGradient
        pointerEvents="none"
        colors={[isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.9)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.45 }}
        style={StyleSheet.absoluteFill}
      />
      {/* bottom shade */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.07)']}
        start={{ x: 0.5, y: 0.6 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

/** hex or rgb color -> rgba string at given alpha. The one copy: this was
 *  independently reimplemented as a local `alpha()` in Vpn, Cast and
 *  ApprovalPending purely because it wasn't exported. */
export function hexA(c: string, a: number): string {
  if (c.startsWith('#') && (c.length === 7 || c.length === 4)) {
    const full = c.length === 4 ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}` : c;
    const r = parseInt(full.slice(1, 3), 16);
    const g = parseInt(full.slice(3, 5), 16);
    const b = parseInt(full.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return c;
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    alignSelf: 'flex-start',
    borderRadius: 99,
  },
});
