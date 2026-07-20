import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { space } from '../theme/spacing';

interface Props {
  color: string;
  /** Required, always. A status carried by colour alone is invisible to a
   *  screen reader and to anyone with a colour vision deficiency — so the
   *  component simply doesn't offer a way to render a bare anonymous dot.
   *  This is the design system's one hard accessibility law, enforced by the
   *  type signature rather than by a review checklist. */
  label: string;
  /** Draw the dot only, because the status word is already rendered right next
   *  to it. `label` is still required — it's the assertion that the word exists,
   *  which is what keeps the dot from becoming anonymous. The dot itself then
   *  goes decorative: re-announcing it here would make a screen reader read
   *  "Connected, Connected". */
  labelHidden?: boolean;
  labelColor?: string;
  size?: number;
}

export function StatusDot({ color, label, labelHidden, labelColor, size = 8 }: Props) {
  const { colors } = useTheme();
  const dot = (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
  );

  if (labelHidden) {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {dot}
      </View>
    );
  }

  return (
    <View style={styles.row} accessible accessibilityLabel={label}>
      {dot}
      <AppText variant="bodyMedium" size="caption" color={labelColor ?? colors.text3}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
