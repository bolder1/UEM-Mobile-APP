import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { space, layout } from '../theme/spacing';
import { radii } from '../theme/platform';

interface Props {
  icon: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

/** One empty state, used for both first-time ("nothing here yet") and
 *  filtered ("no results") — the copy tells them apart, never marketing. */
export function EmptyState({ icon, title, body, action, compact }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, compact && { paddingVertical: space[7] }]}>
      <View
        style={[styles.icon, { backgroundColor: colors.surfaceSunken }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {icon}
      </View>
      <AppText variant="displaySemibold" size="callout" style={styles.title}>
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" size="footnote" color={colors.muted} style={styles.body}>
          {body}
        </AppText>
      ) : null}
      {action ? <View style={{ marginTop: layout.blockGap }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: space[12], paddingHorizontal: space[6] },
  icon: {
    width: space[14],
    height: space[14],
    borderRadius: radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: layout.blockGap,
  },
  title: { marginBottom: layout.captionGap, textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 280 },
});
