import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './Text';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  initials: string;
  color: string;
  size?: number;
  online?: boolean;
}

export function Avatar({ initials, color, size = 44, online }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        ]}
      >
        <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: size * 0.32 }}>
          {initials}
        </AppText>
      </View>
      {online && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: colors.success,
              borderColor: colors.surface,
              width: size * 0.26,
              height: size * 0.26,
              borderRadius: size * 0.13,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: -1, bottom: -1, borderWidth: 2 },
});
