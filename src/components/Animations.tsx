import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/** Expanding ring(s) that fade out on loop — mirrors the `mo-ring` keyframe. */
export function PulseRings({
  size,
  color,
  count = 2,
  duration = 2000,
  strokeWidth = 2,
}: {
  size: number;
  color: string;
  count?: number;
  duration?: number;
  strokeWidth?: number;
}) {
  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <PulseRing
          key={i}
          size={size}
          color={color}
          duration={duration}
          delay={(duration / count) * i}
          strokeWidth={strokeWidth}
        />
      ))}
    </View>
  );
}

function PulseRing({
  size,
  color,
  duration,
  delay,
  strokeWidth,
}: {
  size: number;
  color: string;
  duration: number;
  delay: number;
  strokeWidth: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.85] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

/** Continuously rotating dashed ring — mirrors the connecting-state spinner. */
export function SpinningDashedRing({
  size,
  color,
  duration = 2400,
  dash = '10 14',
  strokeWidth = 3,
  opacity = 0.7,
}: {
  size: number;
  color: string;
  duration?: number;
  dash?: string;
  strokeWidth?: number;
  opacity?: number;
}) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const r = size / 2 - strokeWidth;
  return (
    <Animated.View style={{ position: 'absolute', width: size, height: size, transform: [{ rotate }] }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
          strokeLinecap="round"
          opacity={opacity}
        />
      </Svg>
    </Animated.View>
  );
}

/** Gentle up/down float — mirrors the `mo-float` keyframe used on onboarding callout badges. */
export function FloatBadge({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  return <Animated.View style={[style, { transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** Simple looping pulse opacity — mirrors `mo-pulse`. */
export function PulseDot({ color, size = 8 }: { color: string; size?: number }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: anim }}
    />
  );
}

/** Three-dot typing indicator — mirrors `mo-blink`. */
export function TypingDots({ color }: { color: string }) {
  const dots = [useRef(new Animated.Value(0.25)).current, useRef(new Animated.Value(0.25)).current, useRef(new Animated.Value(0.25)).current];
  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(d, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.25, duration: 550, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {dots.map((d, i) => (
        <Animated.View
          key={i}
          style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity: d }}
        />
      ))}
    </View>
  );
}

/** Equalizer bars for VPN throughput display — mirrors `mo-eq`. */
export function EqualizerBars({ color }: { color: string }) {
  const bars = [0, 1, 2, 3].map(() => useRef(new Animated.Value(0.3)).current);
  useEffect(() => {
    const loops = bars.map((b, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 120),
          Animated.timing(b, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(b, { toValue: 0.3, duration: 450, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 15 }}>
      {bars.map((b, i) => (
        <Animated.View
          key={i}
          style={{
            width: 3,
            height: 15,
            borderRadius: 2,
            backgroundColor: color,
            transform: [{ scaleY: b }],
          }}
        />
      ))}
    </View>
  );
}

/** Slow continuous spin — used for sync icon / loading spinners. */
export function Spinner({ children, duration = 1000 }: { children: React.ReactNode; duration?: number }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.View style={{ transform: [{ rotate }] }}>{children}</Animated.View>;
}
