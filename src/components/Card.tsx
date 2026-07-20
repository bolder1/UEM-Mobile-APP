import React from 'react';
import { View, ViewProps, StyleSheet, Pressable, AccessibilityState, AccessibilityRole } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radii, cardElevation, ripple } from '../theme/platform';
import { layout } from '../theme/spacing';

interface Props extends ViewProps {
  onPress?: () => void;
  radius?: number;
  padded?: boolean;
  /** Required when `onPress` is set — a tappable card announces as a button, and
   *  a button with no name is a dead end for a screen reader. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  /** Defaults to `button`. Pass `radio` for a card that is one of a mutually
   *  exclusive set — and then use `accessibilityState.checked`, not `selected`:
   *  `aria-selected` is not valid on a button and gets dropped on the floor, so
   *  a "selected" card announces as an ordinary button with no state at all. */
  accessibilityRole?: AccessibilityRole;
}

/** The one surface. `padded` gives it `layout.cardPad`; pass `padded={false}`
 *  when the children own their own edges (a list of ListRows, say).
 *
 *  Note `style` no longer wins over the padding token — five Home cards, the
 *  most-repeated surface in the app, were quietly overriding 16 with 14 just by
 *  passing a style object. If a card needs different padding, it isn't a Card. */
export function Card({
  style,
  onPress,
  radius = radii.card,
  padded = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  accessibilityRole = 'button',
  children,
  ...rest
}: Props) {
  const { colors, isDark } = useTheme();
  const base = [
    styles.base,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius,
      ...cardElevation(isDark),
    },
    style,
    // After `style`, so the token can't be clobbered from a call site.
    { padding: padded ? layout.cardPad : 0 },
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        // Both, deliberately — see ToggleSwitch. react-native-web ignores
        // `accessibilityState` entirely, so state has to be mirrored onto the
        // flattened aria props or it exists only on native.
        accessibilityState={accessibilityState}
        aria-checked={accessibilityState?.checked}
        aria-selected={accessibilityState?.selected}
        aria-disabled={accessibilityState?.disabled}
        aria-expanded={accessibilityState?.expanded}
        android_ripple={ripple(colors.surfaceActive) ?? undefined}
        style={({ pressed }) => [...base, pressed && { backgroundColor: colors.surfaceActive }]}
        {...(rest as any)}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={base} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
});
