import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './Text';
import { useTheme } from '../theme/ThemeProvider';
import { control } from '../theme/spacing';

interface Props {
  initials: string;
  color: string;
  size?: number;
  online?: boolean;
  /** Whose avatar this is. Supply it ONLY when the name isn't already rendered
   *  as text beside the avatar — otherwise a screen reader says it twice.
   *  Without it the avatar is treated as decorative, which is what a pair of
   *  initials next to the spelled-out name actually is. */
  name?: string;
  /** Initials colour. Defaults to white, which is right on a saturated brand
   *  circle — but dark mode lightens `primary` to keep it off a near-black
   *  canvas, and white on that is a weak pairing. Pass `colors.canvas` there. */
  textColor?: string;
}

export function Avatar({ initials, color, size = control.avatar, online, name, textColor }: Props) {
  const { colors } = useTheme();

  // Presence is otherwise a green pixel with nothing attached. When the avatar
  // is named, fold both into one node so it reads "Ravi Kumar, online"; when
  // it's decorative, hide it outright rather than announce "R K".
  const a11y = name
    ? { accessible: true, accessibilityLabel: online ? `${name}, online` : name }
    : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const };

  return (
    <View style={{ width: size, height: size }} {...a11y}>
      <View
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}
      >
        <AppText
          variant="displaySemibold"
          color={textColor ?? colors.white}
          style={{ fontSize: Math.round(size * 0.32) }}
        >
          {initials}
        </AppText>
      </View>
      {online && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: colors.success,
              borderColor: colors.surface,
              width: Math.round(size * 0.26),
              height: Math.round(size * 0.26),
              borderRadius: Math.round(size * 0.26) / 2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: -1, bottom: -1, borderWidth: 2 },
});
