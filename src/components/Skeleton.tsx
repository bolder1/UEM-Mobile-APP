import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, DimensionValue } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../theme/platform';

/** Pulsing placeholder block. Prefer row skeletons over a centered spinner. */
export function Skeleton({
  width = '100%',
  height = 12,
  radius = 6,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: any;
}) {
  const { colors } = useTheme();
  const a = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 720, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.45, duration: 720, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.surfaceActive, opacity: a }, style]}
    />
  );
}

/** A generic list-row placeholder: leading tile + two text lines. */
export function SkeletonRow() {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.hairline }]}>
      <Skeleton width={40} height={40} radius={radii.tile} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width={'62%'} height={12} />
        <Skeleton width={'40%'} height={10} />
      </View>
      <Skeleton width={58} height={26} radius={13} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1 },
});
