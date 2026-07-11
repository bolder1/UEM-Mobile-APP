import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';

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
    <View style={[styles.wrap, compact && { paddingVertical: 28 }]}>
      <View style={[styles.icon, { backgroundColor: colors.surfaceSunken }]}>{icon}</View>
      <AppText variant="displaySemibold" style={{ fontSize: 15, marginBottom: 5, textAlign: 'center' }}>
        {title}
      </AppText>
      {body ? (
        <AppText
          variant="body"
          color={colors.muted}
          style={{ fontSize: 12.5, lineHeight: 18, textAlign: 'center', maxWidth: 268 }}
        >
          {body}
        </AppText>
      ) : null}
      {action ? <View style={{ marginTop: 16 }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 46, paddingHorizontal: 24 },
  icon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
});
