import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { haptics } from '../utils/haptics';
import { useReducedMotion } from '../utils/useReducedMotion';

export type PowerDialState = 'off' | 'connecting' | 'on';

interface Props {
  state: PowerDialState;
  onPress: () => void;
  size?: number;
  connectingDurationMs?: number;
  /** Inert while the store owns the connect window. Without this the core
   *  Pressable stayed live under a wrapper that already announced itself as
   *  disabled+busy, so a tap mid-connect buzzed a button that does nothing. */
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * A tactile, skeuomorphic toggle: a glossy gradient core inside a charge-up
 * progress ring. While connecting, the ring sweeps 0→100% in step with the
 * store's connect delay so it reads as "charging up" rather than a generic
 * spinner. Once on, the ring holds full and the halo breathes gently so the
 * button still feels alive at rest.
 */
export function PowerDial({ state, onPress, size = 176, connectingDurationMs = 2200, disabled, children }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(state === 'on' ? 1 : 0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  const stroke = 5;
  const r = size / 2 - stroke * 2;
  const circumference = 2 * Math.PI * r;

  // react-native-svg's web Circle doesn't reliably pick up Animated-driven
  // prop mutations (neither core Animated's setNativeProps path nor
  // Reanimated's useAnimatedProps updated the DOM attribute in testing) — so
  // instead of animating the SVG prop directly, we listen to the driving
  // value and push a plain number into React state each tick. That's a
  // normal re-render per frame, which works identically on native and web.
  const [dashOffset, setDashOffset] = useState(circumference - (state === 'on' ? 1 : 0) * circumference);

  useEffect(() => {
    const id = progress.addListener(({ value }) => setDashOffset(circumference - value * circumference));
    return () => progress.removeListener(id);
  }, [circumference]);

  // Only a real connecting→on transition is an event worth celebrating. Keyed
  // on `state` alone this fired on every mount with the tunnel already up —
  // navigating back to the screen buzzed success for nothing.
  const prevState = useRef(state);

  useEffect(() => {
    const was = prevState.current;
    prevState.current = state;
    if (state === 'connecting') {
      progress.setValue(0);
      // The charge ring is *determinate progress*, not decoration: it reports
      // how much of the connect delay is left. Reduced motion keeps it — a
      // ring that snapped to full while still connecting would be a lie, and
      // it is the only progress this screen has. The decorative breathe loop
      // below is what gets gated.
      Animated.timing(progress, {
        toValue: 1,
        duration: connectingDurationMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else if (state === 'on') {
      progress.setValue(1);
      if (was === 'connecting') haptics.success();
    } else {
      Animated.timing(progress, { toValue: 0, duration: reduced ? 0 : 260, useNativeDriver: false }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (state === 'on' && !reduced) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
      loop.start();
    } else {
      breathe.setValue(0);
    }
    return () => loop?.stop();
  }, [state, reduced]);

  const haloScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const haloOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });

  const ringColor = state === 'on' ? colors.success : state === 'connecting' ? colors.primary : colors.dotInactive;
  const coreColors: [string, string] =
    state === 'on'
      ? [colors.successStrong, colors.success]
      : state === 'connecting'
      ? [colors.primaryStrong, colors.primary]
      : [colors.surfaceHover, colors.surfaceSunken];

  const pressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 10 }).start();

  const handlePress = () => {
    haptics.tap();
    if (reduced) {
      ripple.setValue(1); // rests at opacity 0 — no expanding ring
    } else {
      ripple.setValue(0);
      Animated.timing(ripple, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    }
    onPress();
  };

  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {state === 'on' && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              width: size * 0.94,
              height: size * 0.94,
              borderRadius: (size * 0.94) / 2,
              backgroundColor: colors.success,
              opacity: Animated.multiply(haloOpacity, 0.16),
              transform: [{ scale: haloScale }],
            },
          ]}
        />
      )}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: ringColor,
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity,
          },
        ]}
      />

      <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.dotInactive} strokeWidth={stroke} fill="none" opacity={0.5} />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={ringColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
          />
        </Svg>
      </View>

      {/* accessible={false}: callers wrap this dial in a labelled touchable, so
          the core must not surface as a second, unlabelled button. One control,
          one a11y node — the wrapper's label/role/state is the one that speaks. */}
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        accessible={false}
        hitSlop={8}
      >
        <Animated.View
          style={[
            styles.core,
            {
              width: size - stroke * 5,
              height: size - stroke * 5,
              borderRadius: (size - stroke * 5) / 2,
              transform: [{ scale }],
              shadowColor: state === 'on' ? colors.success : '#000',
              shadowOpacity: state === 'on' ? 0.4 : 0.18,
            },
          ]}
        >
          <LinearGradient
            colors={coreColors}
            start={{ x: 0.15, y: 0.1 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* specular highlight to sell the glossy/skeuomorphic surface */}
          <View
            pointerEvents="none"
            style={[
              styles.sheen,
              {
                width: (size - stroke * 5) * 0.62,
                height: (size - stroke * 5) * 0.34,
                borderRadius: (size - stroke * 5) * 0.34,
                top: (size - stroke * 5) * 0.1,
              },
            ]}
          />
          {children}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: 'absolute' },
  core: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 26,
    elevation: 8,
  },
  sheen: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});
