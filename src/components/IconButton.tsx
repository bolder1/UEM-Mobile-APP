import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { haptics } from '../utils/haptics';
import { raisedElevation, ripple } from '../theme/platform';

interface Props {
  icon: React.ReactNode;
  onPress: () => void;
  /** Required — icon-only controls must still announce their action to screen readers. */
  accessibilityLabel: string;
  variant?: 'primary' | 'tinted' | 'neutral';
  disabled?: boolean;
  size?: number;
  style?: ViewStyle;
}

/** A compact, accessible icon-only action button. Used for row actions in the
 *  Apps and Certificates catalogs so every list action reads as one system,
 *  with a >=44px target and a required accessibilityLabel. */
export function IconButton({ icon, onPress, accessibilityLabel, variant = 'primary', disabled, size = 44, style }: Props) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  let bg = colors.primary;
  let borderColor: string | undefined;
  let shadowColor = colors.primary;
  if (variant === 'tinted') {
    bg = colors.primaryTint;
    shadowColor = 'transparent';
  } else if (variant === 'neutral') {
    bg = colors.surfaceSunken;
    borderColor = colors.borderStrong;
    shadowColor = 'transparent';
  }
  if (disabled) {
    bg = colors.disabled;
    shadowColor = 'transparent';
  }
  const raised = variant === 'primary' && !disabled;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        haptics.tap();
        onPress();
      }}
      onPressIn={() => Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 40, bounciness: 6 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 9 }).start()}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      // aria-* as well: react-native-web ignores accessibilityState outright.
      accessibilityState={{ disabled: !!disabled }}
      aria-disabled={!!disabled}
      android_ripple={ripple('rgba(0,0,0,0.09)', true) ?? undefined}
      hitSlop={4}
      style={style}
    >
      <Animated.View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            backgroundColor: bg,
            borderWidth: borderColor ? 1 : 0,
            borderColor,
            transform: [{ scale }],
            ...raisedElevation(shadowColor, raised),
          },
        ]}
      >
        {icon}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
