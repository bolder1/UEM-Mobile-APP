import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { IconTile } from './IconTile';
import { haptics } from '../utils/haptics';
import { ripple } from '../theme/platform';
import { space, layout, control } from '../theme/spacing';
import { ThemeMode } from '../types';

interface Option {
  value: ThemeMode;
  label: string;
  icon: (color: string) => React.ReactNode;
}

interface Props {
  options: Option[];
  value: ThemeMode;
  onChange: (v: ThemeMode) => void;
}

/** A card-style appearance picker: icon badge + label per option, active card
 * gets a filled icon badge, a tinted border, and a check — closer to iOS's
 * "Appearance" cards than a plain text segmented control.
 *
 * One of exactly N options, exactly one picked: that is a radio group, so it
 * says so. Before this the selected card was conveyed purely by a background,
 * a border colour and a 9px check — three visual cues and nothing announced. */
export function ThemePicker({ options, value, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (!active) haptics.select();
              onChange(opt.value);
            }}
            accessibilityRole="radio"
            accessibilityLabel={opt.label}
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
                backgroundColor: active ? colors.primaryTint : colors.surfaceSunken,
                borderColor: active ? colors.primary : colors.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            {active && (
              <View style={[styles.checkBadge, { backgroundColor: colors.primary, borderColor: active ? colors.primaryTint : colors.surfaceSunken }]}>
                <Check size={9} color={colors.white} strokeWidth={3.2} />
              </View>
            )}
            <IconTile
              bg={active ? colors.primary : colors.surface}
              size={control.tile}
              radius={control.tile / 2}
              borderColor={colors.border}
            >
              {opt.icon(active ? colors.white : colors.text3)}
            </IconTile>
            <AppText
              variant={active ? 'bodySemibold' : 'bodyMedium'}
              size="caption"
              color={active ? colors.primaryStrong : colors.text3}
            >
              {opt.label}
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
    gap: layout.labelGap,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: layout.cardPad,
    position: 'relative',
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
