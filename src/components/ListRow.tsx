import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { ripple } from '../theme/platform';

interface Props {
  icon?: React.ReactNode;
  label: string;
  labelColor?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showChevron?: boolean;
  bordered?: boolean;
}

export function ListRow({ icon, label, labelColor, onPress, right, showChevron = true, bordered }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={onPress ? ripple(colors.surfaceActive) ?? undefined : undefined}
      style={({ pressed }) => [
        styles.row,
        bordered && { borderBottomWidth: 1, borderBottomColor: colors.hairline },
        pressed && onPress ? { backgroundColor: colors.surfaceHover } : null,
      ]}
    >
      {icon}
      <AppText variant="bodyMedium" color={labelColor ?? colors.text} style={styles.label}>
        {label}
      </AppText>
      {right}
      {showChevron && onPress ? <ChevronRight size={16} color={colors.faint} strokeWidth={2.2} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  label: { flex: 1, fontSize: 14 },
});
