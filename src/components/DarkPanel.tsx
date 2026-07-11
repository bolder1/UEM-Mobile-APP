import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

/** The near-black, rounded-skirt header used on Home and Profile — a fixed
 *  dark surface (Google Pay style) with faint concentric orbit rings, kept
 *  constant across brand/theme so the greeting zone always reads as premium. */
export const PANEL_INK = '#141518';

export function DarkPanel({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.panel, style]}>
      <View pointerEvents="none" style={styles.orbitWrap}>
        <View style={[styles.ring, { width: 240, height: 240, right: -70, top: -60 }]} />
        <View style={[styles.ring, { width: 170, height: 170, right: -35, top: -25 }]} />
        <View style={[styles.ring, { width: 104, height: 104, right: -2, top: 10 }]} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: PANEL_INK,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  orbitWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
