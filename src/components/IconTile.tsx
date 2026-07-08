import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  bg: string;
  size?: number;
  radius?: number;
  children: React.ReactNode;
}

export function IconTile({ bg, size = 42, radius = 12, children }: Props) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg, width: size, height: size, borderRadius: radius },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
