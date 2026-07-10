import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { haptics } from '../utils/haptics';
import { ripple } from '../theme/platform';
import { BrandTheme, BRAND_THEME_META } from '../theme/colors';

interface Props {
  value: BrandTheme;
  onChange: (v: BrandTheme) => void;
}

/** Brand color picker: each card always shows its OWN hex as the swatch,
 * regardless of which brand is currently active — unlike ThemePicker, the
 * swatch fill can't reactively use `colors.primary` since that value itself
 * changes with the selection being made here. Selection is shown with a
 * border + check instead. */
export function BrandThemePicker({ value, onChange }: Props) {
  const { colors } = useTheme();
  const options = Object.entries(BRAND_THEME_META) as [BrandTheme, (typeof BRAND_THEME_META)[BrandTheme]][];

  return (
    <View style={styles.row}>
      {options.map(([key, meta]) => {
        const active = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => {
              if (!active) haptics.select();
              onChange(key);
            }}
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
                <Check size={9} color="#FFFFFF" strokeWidth={3.2} />
              </View>
            )}
            <View style={[styles.swatch, { backgroundColor: meta.swatch }]} />
            <AppText variant={active ? 'bodySemibold' : 'bodyMedium'} color={active ? colors.text : colors.text3} style={{ fontSize: 12.5 }}>
              {meta.label}
            </AppText>
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 10.5 }}>
              {meta.swatch}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
    position: 'relative',
  },
  swatch: { width: 40, height: 40, borderRadius: 20, marginBottom: 2 },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
