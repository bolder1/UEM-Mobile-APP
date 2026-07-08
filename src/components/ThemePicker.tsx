import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { haptics } from '../utils/haptics';
import { ripple } from '../theme/platform';
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
 * "Appearance" cards than a plain text segmented control. */
export function ThemePicker({ options, value, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (!active) haptics.select();
              onChange(opt.value);
            }}
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
                <Check size={9} color="#FFFFFF" strokeWidth={3.2} />
              </View>
            )}
            <View style={[styles.iconBadge, { backgroundColor: active ? colors.primary : colors.surface, borderColor: colors.border }]}>
              {opt.icon(active ? '#FFFFFF' : colors.text3)}
            </View>
            <AppText
              variant={active ? 'bodySemibold' : 'bodyMedium'}
              color={active ? colors.primaryStrong : colors.text3}
              style={{ fontSize: 12 }}
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
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    position: 'relative',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
