import React, { useRef } from 'react';
import { Pressable, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { haptics } from '../utils/haptics';
import { touch } from '../theme/spacing';

const TRACK_W = 46;
const TRACK_H = 28;
const KNOB = 22;
const PAD = 3;

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  onColor?: string;
  /** Required. A switch is the one control with no visible text of its own, so
   *  an unlabeled one announces as "switch, on" and nothing else — which of the
   *  four permissions did you just grant? It was optional before, and every
   *  single caller omitted it. */
  label: string;
  /** Extra context, e.g. what turning it off actually costs. */
  hint?: string;
  disabled?: boolean;
}

export function ToggleSwitch({ value, onChange, onColor, label, hint, disabled }: Props) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  }, [value, anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [PAD, TRACK_W - KNOB - PAD] });
  const bg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.disabled, onColor ?? colors.primary],
  });

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        haptics.select();
        onChange(!value);
      }}
      disabled={disabled}
      // 28 tall + 8 slop each side = 44.
      hitSlop={touch.slopFor(TRACK_H)}
      accessibilityRole="switch"
      // Both, deliberately. `accessibilityState` is the native API; react-native-web
      // 0.21 does not read it at all (it only maps flattened `aria-*`), so on the
      // web build a switch announces with no on/off state whatsoever. RN 0.71+
      // accepts `aria-*` natively, so emitting both is correct on every platform.
      accessibilityState={{ checked: value, disabled: !!disabled }}
      aria-checked={value}
      aria-disabled={!!disabled}
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        style={{
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: 99,
          backgroundColor: bg as any,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: KNOB,
            height: KNOB,
            borderRadius: KNOB / 2,
            backgroundColor: colors.surface,
            transform: [{ translateX }],
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
