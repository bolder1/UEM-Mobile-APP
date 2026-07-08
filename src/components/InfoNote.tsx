import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';

export function InfoNote({ text, icon }: { text: string; icon?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {icon ?? <Lock size={12} color={colors.muted2} strokeWidth={2.2} />}
      <AppText variant="body" color={colors.muted2} style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  text: { fontSize: 11.5, lineHeight: 16, flex: 1 },
});
