import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { space, layout } from '../theme/spacing';

interface Props {
  text: string;
  icon?: React.ReactNode;
  /** Drop the leading margin when the note is already spaced by its parent. */
  flush?: boolean;
}

/** The quiet "here's what's actually happening with your data" line under a
 *  list. Reproduced verbatim in three screens before this. */
export function InfoNote({ text, icon, flush }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, !flush && { marginTop: layout.blockGap }]}>
      {/* Nudged to sit on the first line's optical centre: (16 lineHeight - 12 icon) / 2. */}
      <View style={styles.iconSlot}>{icon ?? <Lock size={12} color={colors.muted2} strokeWidth={2.2} />}</View>
      <AppText variant="body" size="micro" color={colors.muted2} style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  // Not `alignItems: center` — once the text wraps to two lines a centred icon
  // floats off the first line it belongs to.
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  iconSlot: { paddingTop: 2 },
  text: { flex: 1 },
});
