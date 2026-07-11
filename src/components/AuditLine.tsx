import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';

interface Props {
  time: string;
  actor?: string;
  onPress?: () => void;
}

/** The security-product signature: every state change says who did it and when,
 *  with a one-tap path to the full Activity log. */
export function AuditLine({ time, actor = 'you', onPress }: Props) {
  const { colors } = useTheme();
  const inner = (
    <>
      <Check size={12} color={colors.success} strokeWidth={2.6} />
      <AppText variant="body" color={colors.muted} style={{ fontSize: 11, flex: 1 }}>
        Logged · {time} · {actor}
      </AppText>
      {onPress ? <ChevronRight size={13} color={colors.muted2} strokeWidth={2.2} /> : null}
    </>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={6} style={styles.row}>
        {inner}
      </Pressable>
    );
  }
  return <View style={styles.row}>{inner}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
});
