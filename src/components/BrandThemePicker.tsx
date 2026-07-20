import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { haptics } from '../utils/haptics';
import { ripple } from '../theme/platform';
import { space, layout, control } from '../theme/spacing';
import { BrandTheme, BRAND_THEME_META } from '../theme/colors';

interface Props {
  value: BrandTheme;
  onChange: (v: BrandTheme) => void;
}

/** Brand color picker: each card always shows its OWN hex as the swatch,
 * regardless of which brand is currently active — unlike ThemePicker, the
 * swatch fill can't reactively use `colors.primary` since that value itself
 * changes with the selection being made here. Selection is shown with a
 * border + check instead.
 *
 * That divergence from ThemePicker is the whole reason these two stay separate
 * despite looking alike; the a11y contract below is deliberately identical. */
export function BrandThemePicker({ value, onChange }: Props) {
  const { colors } = useTheme();
  const options = Object.entries(BRAND_THEME_META) as [BrandTheme, (typeof BRAND_THEME_META)[BrandTheme]][];

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map(([key, meta]) => {
        const active = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => {
              if (!active) haptics.select();
              onChange(key);
            }}
            accessibilityRole="radio"
            accessibilityLabel={meta.label}
            // `checked` is what the radio role reads; `selected` is what the
            // rest of the app's pickers set. Both, so either platform lands.
            // `aria-checked` as well: react-native-web ignores accessibilityState
            // outright, so on web these radios announce with no state at all.
            accessibilityState={{ selected: active, checked: active }}
            aria-checked={active}
            android_ripple={ripple(colors.surfaceActive) ?? undefined}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: active ? colors.surfaceSunken : 'transparent',
                borderColor: active ? meta.swatch : colors.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            {active && (
              <View style={[styles.checkBadge, { backgroundColor: meta.swatch, borderColor: colors.surface }]}>
                <Check size={9} color={colors.white} strokeWidth={3.2} />
              </View>
            )}
            <View style={[styles.swatch, { backgroundColor: meta.swatch }]} />
            <AppText variant={active ? 'bodySemibold' : 'bodyMedium'} size="caption" color={active ? colors.text : colors.text3}>
              {meta.label}
            </AppText>
            <AppText variant="body" size="micro" color={colors.muted2}>
              {meta.swatch}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: layout.cardGap },
  card: {
    flex: 1,
    alignItems: 'center',
    // Label and its own hex caption are one object -> 4. The swatch is a rung
    // further out and buys the extra 8 below, landing swatch -> label at 12.
    gap: layout.captionGap,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: layout.cardPad,
    position: 'relative',
  },
  swatch: {
    width: control.tile,
    height: control.tile,
    borderRadius: control.tile / 2,
    marginBottom: space[2],
  },
  checkBadge: {
    position: 'absolute',
    top: space[2],
    right: space[2],
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
