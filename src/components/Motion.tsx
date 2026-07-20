import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '../utils/haptics';
import { useReducedMotion } from '../utils/useReducedMotion';

/* ------------------------------------------------------------------ *
 *  Motion kit — the app-wide animation vocabulary. Everything is RN
 *  Animated (JS driver on web, native driver elsewhere) so it works
 *  identically in the static Vercel export and in Expo Go.
 *  Rules: entrances spring (damping 18 / stiffness 160), presses dip
 *  to 0.96, loops are slow + subtle, and every loop respects the OS
 *  reduce-motion setting.
 * ------------------------------------------------------------------ */

/** Choreographed mount entrance: fade + rise + tiny scale settle.
 *  Stagger siblings with `delay={i * 60}`. */
export function Entrance({
  children,
  delay = 0,
  from = 16,
  scaleFrom = 0.97,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  from?: number;
  scaleFrom?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    const a = Animated.spring(v, { toValue: 1, delay, useNativeDriver: true, damping: 18, stiffness: 160, mass: 0.8 });
    a.start();
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [scaleFrom, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Pressable that dips with a spring — the app's standard press feedback. */
export function PressableScale({
  children,
  onPress,
  onLongPress,
  disabled,
  scaleTo = 0.96,
  haptic = true,
  style,
  containerStyle,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityState,
  hitSlop,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  scaleTo?: number;
  haptic?: boolean;
  /** Styles the inner (scaling) view — the button's own look. */
  style?: StyleProp<ViewStyle>;
  /** Styles the touchable itself. Layout that has to affect the PARENT — flex,
   *  alignSelf — must go here; on `style` it lands inside the touchable and the
   *  touchable still shrinks to fit its content. */
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityRole?: 'button' | 'link';
  accessibilityLabel?: string;
  accessibilityState?: object;
  hitSlop?: number;
}) {
  const v = useRef(new Animated.Value(1)).current;
  const to = (val: number) =>
    Animated.spring(v, { toValue: val, useNativeDriver: true, damping: 16, stiffness: 320, mass: 0.6 }).start();
  return (
    <Pressable
      onPress={() => {
        if (haptic) haptics.tap();
        onPress?.();
      }}
      onLongPress={onLongPress}
      disabled={disabled}
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      hitSlop={hitSlop}
      style={containerStyle}
    >
      <Animated.View style={[style, { transform: [{ scale: v }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Slow idle 3D wobble — perspective + rotateX/rotateY + float. Wrap a hero
 *  illustration in this to make it feel like a physical object. */
export function Float3D({
  children,
  style,
  rotate = 5,
  float = 7,
  duration = 3600,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  rotate?: number;
  float?: number;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  const rotateY = v.interpolate({ inputRange: [0, 1], outputRange: [`-${rotate}deg`, `${rotate}deg`] });
  const rotateX = v.interpolate({ inputRange: [0, 1], outputRange: [`${rotate * 0.55}deg`, `-${rotate * 0.55}deg`] });
  const translateY = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -float, 0] });
  return (
    <Animated.View style={[style, { transform: [{ perspective: 900 }, { rotateY }, { rotateX }, { translateY }] }]}>
      {children}
    </Animated.View>
  );
}

/** A soft animated glow orb — two gradient discs slowly counter-rotating.
 *  Position absolutely behind hero content for living depth. */
export function GlowOrb({
  size,
  colors: orbColors,
  opacity = 0.5,
  style,
  duration = 9000,
}: {
  size: number;
  colors: [string, string];
  opacity?: number;
  style?: StyleProp<ViewStyle>;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  const spin = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinBack = v.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const breathe = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.12, 1] });
  return (
    <View pointerEvents="none" style={[{ width: size, height: size, position: 'absolute' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: spin }, { scale: breathe }] }]}>
        <LinearGradient
          colors={[orbColors[0], 'transparent']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ flex: 1, borderRadius: size / 2, opacity }}
        />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: spinBack }] }]}>
        <LinearGradient
          colors={['transparent', orbColors[1]]}
          start={{ x: 0.8, y: 0.1 }}
          end={{ x: 0.1, y: 0.9 }}
          style={{ flex: 1, borderRadius: size / 2, opacity: opacity * 0.7 }}
        />
      </Animated.View>
    </View>
  );
}

/** Number ticker — counts from the previous value to `value` with an
 *  ease-out, CRED-style. Renders via a render-prop so any AppText works. */
export function CountUp({
  value,
  duration = 800,
  formatter = (n: number) => String(Math.round(n)),
  children,
}: {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  children: (display: string) => React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const anim = useRef(new Animated.Value(value)).current;
  const prev = useRef(value);
  const [display, setDisplay] = useState(formatter(value));
  useEffect(() => {
    if (reduced) {
      setDisplay(formatter(value));
      prev.current = value;
      return;
    }
    anim.setValue(prev.current);
    const id = anim.addListener(({ value: v }) => setDisplay(formatter(v)));
    Animated.timing(anim, { toValue: value, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => {
      anim.removeListener(id);
      setDisplay(formatter(value));
    });
    prev.current = value;
    return () => anim.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced]);
  return <>{children(display)}</>;
}

/** A soft light sweep that travels across its parent — scanning/processing
 *  states. Parent needs overflow:'hidden'. */
export function Shimmer({
  width = 90,
  color = 'rgba(255,255,255,0.16)',
  duration = 2200,
  angle = 18,
}: {
  width?: number;
  color?: string;
  duration?: number;
  angle?: number;
}) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  const [span, setSpan] = useState(0);
  useEffect(() => {
    if (reduced || span === 0) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(600),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, span]);
  const translateX = v.interpolate({ inputRange: [0, 1], outputRange: [-width * 1.6, span + width * 0.6] });
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSpan(e.nativeEvent.layout.width)}
    >
      <Animated.View style={{ position: 'absolute', top: -30, bottom: -30, width, transform: [{ translateX }, { rotate: `${angle}deg` }] }}>
        <LinearGradient
          colors={['transparent', color, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

/** Cross-fades (+ slight rise) between children keyed by `stateKey` — the
 *  standard way a screen moves between its states (off -> connecting -> on). */
export function StateSwap({
  stateKey,
  children,
  style,
  duration = 260,
}: {
  stateKey: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(1)).current;
  const [displayed, setDisplayed] = useState({ key: stateKey, node: children });
  const latest = useRef({ key: stateKey, node: children });
  latest.current = { key: stateKey, node: children };
  // The key a fade-out is currently running toward — guards against ticking
  // children (timers, counters) re-triggering and interrupting the swap.
  const animatingTo = useRef<string | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (fallback.current) clearTimeout(fallback.current); }, []);

  useEffect(() => {
    if (stateKey === displayed.key) {
      // Same state: land in-place updates (ticking timers) without animating.
      if (animatingTo.current) {
        // A swap was abandoned mid-flight (state bounced back) — restore.
        animatingTo.current = null;
        Animated.spring(v, { toValue: 1, useNativeDriver: true, damping: 17, stiffness: 170, mass: 0.8 }).start();
      }
      if (displayed.node !== children) setDisplayed({ key: stateKey, node: children });
      return;
    }
    if (reduced) {
      animatingTo.current = null;
      setDisplayed({ key: stateKey, node: children });
      v.setValue(1);
      return;
    }
    if (animatingTo.current === stateKey) return; // this swap is already in flight
    animatingTo.current = stateKey;

    // Landing the new state was gated ENTIRELY on this fade-out reporting
    // `finished`. If the animation clock doesn't run — the app is backgrounded
    // mid-swap, the tab is throttled — that callback never arrives, `displayed`
    // never advances, and `animatingTo` pins the key so the effect won't retry:
    // the screen sits on its old state forever with no path forward. That is
    // how enrollment could strand on "Reviewing your request" after IT had
    // already approved. The commit now happens on whichever comes first.
    const commit = () => {
      if (animatingTo.current !== stateKey) return; // already landed or superseded
      if (fallback.current) { clearTimeout(fallback.current); fallback.current = null; }
      animatingTo.current = null;
      setDisplayed({ ...latest.current });
      Animated.spring(v, { toValue: 1, useNativeDriver: true, damping: 17, stiffness: 170, mass: 0.8 }).start();
    };

    if (fallback.current) clearTimeout(fallback.current);
    fallback.current = setTimeout(commit, duration * 0.6 + 150);
    Animated.timing(v, { toValue: 0, duration: duration * 0.6, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) commit();
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey, children, reduced]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }, { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) }],
        },
      ]}
    >
      {displayed.node}
    </Animated.View>
  );
}

/** StateSwap's taller sibling: cross-fades between states *and* springs the
 *  container's height between them, so a card grows into its next shape instead
 *  of snapping — and whatever sits below it glides rather than lurching. Reach
 *  for this over StateSwap when the two states differ a lot in height.
 *
 *  Height can't ride the native driver, so it runs on the JS clock while the
 *  fade stays native. `bleed` widens the clip box so children that overflow
 *  sideways (a ticket's edge notches) survive the vertical clipping. */
export function MorphSwap({
  stateKey,
  children,
  style,
  bleed = 0,
  duration = 300,
}: {
  stateKey: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bleed?: number;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState({ key: stateKey, node: children });
  const latest = useRef({ key: stateKey, node: children });
  latest.current = { key: stateKey, node: children };
  const animatingTo = useRef<string | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (fallback.current) clearTimeout(fallback.current); }, []);

  const op = useRef(new Animated.Value(1)).current;
  const rise = useRef(new Animated.Value(0)).current;
  const h = useRef(new Animated.Value(0)).current;
  // Height is only driven once we've measured the first state — until then the
  // content sizes the container itself, so there's no zero-height flash.
  const [sized, setSized] = useState(false);
  const natural = useRef(0);

  const onContentLayout = (e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout.height;
    if (!next || Math.abs(next - natural.current) < 0.5) return;
    const first = natural.current === 0;
    natural.current = next;
    if (first || reduced) {
      h.setValue(next);
      if (first) setSized(true);
      return;
    }
    Animated.spring(h, { toValue: next, useNativeDriver: false, damping: 22, stiffness: 150, mass: 0.9 }).start();
  };

  useEffect(() => {
    if (stateKey === displayed.key) {
      if (animatingTo.current) {
        // A swap was abandoned mid-flight (state bounced back) — restore.
        animatingTo.current = null;
        Animated.spring(op, { toValue: 1, useNativeDriver: true, damping: 17, stiffness: 170, mass: 0.8 }).start();
        Animated.spring(rise, { toValue: 0, useNativeDriver: true, damping: 17, stiffness: 170, mass: 0.8 }).start();
      }
      if (displayed.node !== children) setDisplayed({ key: stateKey, node: children });
      return;
    }
    if (reduced) {
      animatingTo.current = null;
      setDisplayed({ key: stateKey, node: children });
      op.setValue(1);
      rise.setValue(0);
      return;
    }
    if (animatingTo.current === stateKey) return; // this swap is already in flight
    animatingTo.current = stateKey;

    // Same safety net as StateSwap: never gate landing the new state solely on
    // the fade-out reporting `finished`, or a throttled animation clock strands
    // the swap permanently. See the comment there.
    const commit = () => {
      if (animatingTo.current !== stateKey) return; // already landed or superseded
      if (fallback.current) { clearTimeout(fallback.current); fallback.current = null; }
      animatingTo.current = null;
      setDisplayed({ ...latest.current });
      // New state enters from just below as the container springs to its height.
      rise.setValue(10);
      Animated.parallel([
        Animated.timing(op, { toValue: 1, duration, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.spring(rise, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 160, mass: 0.8 }),
      ]).start();
    };

    if (fallback.current) clearTimeout(fallback.current);
    fallback.current = setTimeout(commit, duration * 0.55 + 150);
    Animated.parallel([
      Animated.timing(op, { toValue: 0, duration: duration * 0.55, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(rise, { toValue: -8, duration: duration * 0.55, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) commit();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey, children, reduced]);

  return (
    <Animated.View
      style={[
        style,
        { overflow: 'hidden', marginHorizontal: -bleed, paddingHorizontal: bleed },
        sized ? { height: h } : null,
      ]}
    >
      <Animated.View onLayout={onContentLayout} style={{ opacity: op, transform: [{ translateY: rise }] }}>
        {displayed.node}
      </Animated.View>
    </Animated.View>
  );
}
