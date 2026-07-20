import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useReducedMotion } from '../utils/useReducedMotion';

/* ------------------------------------------------------------------ *
 *  Every loop in this file honours the OS reduce-motion setting, the
 *  same way Motion.tsx does: skip the loop entirely and settle the
 *  driving value on a static resting state that still reads as the
 *  thing it was animating. Spinner is the one documented exception —
 *  see its comment.
 * ------------------------------------------------------------------ */

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
  const reduced = useReducedMotion();
  // The rings only differ by phase, so at rest they'd all stack on the same
  // pixel and their opacities would compound into one darker ring. Under
  // reduce-motion the honest resting state is a single ring.
  const rings = reduced ? 1 : count;
  return (
    <View
      style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}
      pointerEvents="none"
      // Pure decoration around content that already carries the meaning.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: rings }).map((_, i) => (
        <PulseRing
          key={i}
          size={size}
          color={color}
          duration={duration}
          delay={(duration / count) * i}
          strokeWidth={strokeWidth}
          reduced={reduced}
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
  reduced,
}: {
  size: number;
  color: string;
  duration: number;
  delay: number;
  strokeWidth: number;
  reduced: boolean;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      // Rest at the start of the keyframe: an un-expanded ring at full opacity.
      anim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

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
  const reduced = useReducedMotion();
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      // Settles as a static dashed ring — the shape still reads as "in
      // progress" next to the state's own label, without the rotation.
      spin.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
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
  const reduced = useReducedMotion();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      // Rest at the bottom of the float — the badge's laid-out position.
      anim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  return (
    <Animated.View
      style={[style, { transform: [{ translateY }] }]}
      // Decorative garnish on the onboarding hero — the screen's own copy says
      // everything these badges do.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </Animated.View>
  );
}

/** Simple looping pulse opacity — mirrors `mo-pulse`. */
export function PulseDot({ color, size = 8 }: { color: string; size?: number }) {
  const reduced = useReducedMotion();
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduced) {
      // A solid dot: the status it marks is still on, it just stops breathing.
      anim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  return (
    <Animated.View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: anim }}
    />
  );
}

/** Three-dot typing indicator — mirrors `mo-blink`. */
export function TypingDots({ color }: { color: string }) {
  const reduced = useReducedMotion();
  const dots = [useRef(new Animated.Value(0.25)).current, useRef(new Animated.Value(0.25)).current, useRef(new Animated.Value(0.25)).current];
  useEffect(() => {
    if (reduced) {
      // Settle to a solid, static three-dot indicator: still reads as "working",
      // without an unstoppable loop.
      dots.forEach((d) => d.setValue(1));
      return;
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
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
  const reduced = useReducedMotion();
  const bars = [0, 1, 2, 3].map(() => useRef(new Animated.Value(0.3)).current);
  useEffect(() => {
    if (reduced) {
      // Full-height static bars, matching how TypingDots settles: the tunnel is
      // still carrying traffic, the meter just stops dancing about it. Resting
      // at 0.3 instead would read as "throughput has dropped to nothing".
      bars.forEach((b) => b.setValue(1));
      return;
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 15 }}
      // A garnish beside the throughput figure, which is the actual information.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
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
  const reduced = useReducedMotion();
  const spin = useRef(new Animated.Value(0)).current;

  // The one loop here that does NOT stop under reduce-motion, deliberately.
  //
  // Every other animation in this file is garnish: freezing it costs nothing,
  // because the state it decorates is spelled out in text right beside it. A
  // spinner IS the state — it's the only thing saying "still working", and a
  // frozen one says "hung", which is worse than the motion it removed. The
  // setting is called *reduce* motion, and WCAG's concern (2.3.3 / SC 2.2.2) is
  // large-scale movement — parallax, scaling, long translations — not a small
  // constant-velocity rotation with no positional change.
  //
  // So: keep spinning, at half speed. Still unmistakably alive, half the motion.
  const spinDuration = reduced ? duration * 2 : duration;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: spinDuration, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinDuration]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.View style={{ transform: [{ rotate }] }}>{children}</Animated.View>;
}
