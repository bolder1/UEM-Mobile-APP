import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { haptics } from '../utils/haptics';
import { ripple } from '../theme/platform';
import { space, touch } from '../theme/spacing';

const HEIGHT = 36;

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  /** Leading slot — e.g. a Check on the applied filter, so "selected" isn't
   *  carried by the fill colour alone. */
  icon?: React.ReactNode;
}

export function Chip({ label, active, onPress, icon }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        if (!active) haptics.select();
        onPress?.();
      }}
      // Without these a filter chip reads to a screen reader as loose text, and
      // which one is applied is invisible — the selected state is the whole point.
      accessibilityRole="button"
      accessibilityLabel={label}
      // `selected` is what iOS reads; `aria-pressed` is what the web needs — and
      // it's `pressed`, not `selected`, because aria-selected is not valid on a
      // button and gets dropped. A filter chip is a toggle button.
      accessibilityState={{ selected: !!active }}
      aria-pressed={!!active}
      // Chips sit in a scrolling row where 44 tall would look like a row of
      // buttons, so the box stays 36 and the slop carries it to 44.
      hitSlop={touch.slopFor(HEIGHT)}
      android_ripple={ripple(active ? 'rgba(255,255,255,0.2)' : colors.surfaceActive) ?? undefined}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.borderStrong,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      {icon}
      <AppText variant="bodySemibold" size="caption" color={active ? colors.white : colors.text3}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    height: HEIGHT,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: space[3],
  },
});
