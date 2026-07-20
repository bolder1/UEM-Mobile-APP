import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { space, touch } from '../theme/spacing';

interface Props {
  time: string;
  actor?: string;
  onPress?: () => void;
}

/** The security-product signature: every state change says who did it and when,
 *  with a one-tap path to the full Activity log.
 *
 *  A toast that says "Logged" and then vanishes after 4.5s is not an audit
 *  trail — it's a claim you can't check. This line persists next to the thing
 *  that changed, which is the entire difference. */
export function AuditLine({ time, actor = 'you', onPress }: Props) {
  const { colors } = useTheme();
  const inner = (
    <>
      <Check size={12} color={colors.success} strokeWidth={2.6} />
      <AppText variant="body" size="micro" color={colors.muted} style={{ flex: 1 }}>
        Logged · {time} · {actor}
      </AppText>
      {onPress ? <ChevronRight size={13} color={colors.muted2} strokeWidth={2.2} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Logged ${time} by ${actor}`}
        accessibilityHint="Opens the activity log"
        // The line is ~22px of text; slop carries the target the rest of the
        // way to 44 without letting an audit note look like a button.
        hitSlop={touch.slopFor(22)}
        style={styles.row}
      >
        {inner}
      </Pressable>
    );
  }
  return (
    <View style={styles.row} accessible accessibilityLabel={`Logged ${time} by ${actor}`}>
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingVertical: space[1] },
});
