import React from 'react';
import { View } from 'react-native';

export function StatusDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }}
    />
  );
}
