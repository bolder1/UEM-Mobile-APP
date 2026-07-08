import React from 'react';
import { View, ViewProps, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radii, cardElevation, ripple } from '../theme/platform';

interface Props extends ViewProps {
  onPress?: () => void;
  radius?: number;
  padded?: boolean;
}

export function Card({ style, onPress, radius = radii.card, padded = true, children, ...rest }: Props) {
  const { colors, isDark } = useTheme();
  const base = [
    styles.base,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius,
      padding: padded ? 16 : 0,
      ...cardElevation(isDark),
    },
    style,
  ];
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
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
