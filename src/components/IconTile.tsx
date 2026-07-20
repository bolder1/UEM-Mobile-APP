import React from 'react';
import { View, StyleSheet } from 'react-native';
import { radii } from '../theme/platform';
import { control } from '../theme/spacing';

interface Props {
  bg: string;
  size?: number;
  radius?: number;
  /** Hairline ring. For tiles filled with an arbitrary brand colour, which can
   *  land anywhere against the surface behind them. */
  borderColor?: string;
  children: React.ReactNode;
}

/** The leading tile on a list row. Decorative by definition — the row's label
 *  carries the meaning — so it is hidden from screen readers rather than
 *  announced as an anonymous image.
 *
 *  Default is 40 (10 grid steps), not the old 42: this shape was hand-rolled in
 *  11 screens and every copy picked its own size. */
export function IconTile({ bg, size = control.tile, radius = radii.tile, borderColor, children }: Props) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        { backgroundColor: bg, width: size, height: size, borderRadius: radius },
        borderColor ? { borderWidth: 1, borderColor } : null,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
