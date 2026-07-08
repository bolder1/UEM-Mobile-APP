import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { haptics } from '../utils/haptics';
import { ripple } from '../theme/platform';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        if (!active) haptics.select();
        onPress?.();
      }}
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
      <AppText variant="bodySemibold" color={active ? colors.white : colors.text3} style={{ fontSize: 12 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
});
