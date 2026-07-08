import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { haptics } from '../utils/haptics';
import { radii, raisedElevation, ripple } from '../theme/platform';

interface Props {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'lg' | 'md' | 'sm';
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  disabled,
  variant = 'primary',
  size = 'lg',
  loading,
  style,
  icon,
}: Props) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const height = size === 'lg' ? 52 : size === 'md' ? 44 : 36;
  const fontSize = size === 'lg' ? 15.5 : size === 'sm' ? 12.5 : 14;

  let bg = colors.primary;
  let textColor = colors.white;
  let borderColor: string | undefined;
  let shadowColor = colors.primary;

  if (variant === 'secondary') {
    bg = colors.surface;
    textColor = colors.text;
    borderColor = colors.borderStrong;
    shadowColor = 'transparent';
  } else if (variant === 'danger') {
    bg = colors.danger;
    textColor = colors.white;
    shadowColor = colors.danger;
  } else if (variant === 'ghost') {
    bg = 'transparent';
    textColor = colors.primary;
    shadowColor = 'transparent';
  }

  if (disabled) {
    bg = variant === 'ghost' ? 'transparent' : colors.disabled;
    textColor = variant === 'ghost' ? colors.muted : colors.white;
    shadowColor = 'transparent';
  }

  const pressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 9 }).start();
  };
  const handlePress = () => {
    if (disabled || loading) return;
    haptics.tap();
    onPress?.();
  };

  const raised = variant === 'primary' || variant === 'danger';

  // `style` may carry layout props (width, flex, alignSelf, margin*) meant for
  // this component's outer box, not just visual props for the inner surface.
  // Since the ripple/radius clipping needs its own Pressable wrapper, those
  // layout props must be forwarded there too or things like `width: '100%'`
  // and `alignSelf: 'center'` silently do nothing (and the untouched outer
  // box keeps its full-bleed hit area, so taps register far from what's drawn).
  const flatStyle = StyleSheet.flatten(style) ?? {};
  const {
    width,
    minWidth,
    maxWidth,
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    alignSelf,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
    ...innerStyle
  } = flatStyle as ViewStyle;
  const outerLayoutStyle = {
    width,
    minWidth,
    maxWidth,
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    alignSelf,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={handlePress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      android_ripple={ripple('rgba(255,255,255,0.16)') ?? undefined}
      style={[{ borderRadius: radii.button, overflow: 'hidden' }, outerLayoutStyle]}
    >
      <Animated.View
        style={[
          styles.base,
          {
            height,
            backgroundColor: bg,
            borderColor,
            borderWidth: borderColor ? 1 : 0,
            borderRadius: radii.button,
            transform: [{ scale }],
            ...raisedElevation(shadowColor, raised),
          },
          innerStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <>
            {icon}
            <AppText variant="bodySemibold" color={textColor} style={{ fontSize }}>
              {label}
            </AppText>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
  },
});
