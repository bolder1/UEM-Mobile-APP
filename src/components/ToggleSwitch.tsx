import React, { useRef } from 'react';
import { Pressable, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { haptics } from '../utils/haptics';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  onColor?: string;
}

export function ToggleSwitch({ value, onChange, onColor }: Props) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  }, [value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 22] });
  const bg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.disabled, onColor ?? colors.primary],
  });

  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onChange(!value);
      }}
      hitSlop={8}
    >
      <Animated.View
        style={{
          width: 46,
          height: 27,
          borderRadius: 99,
          backgroundColor: bg as any,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: 21,
            height: 21,
            borderRadius: 11,
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
