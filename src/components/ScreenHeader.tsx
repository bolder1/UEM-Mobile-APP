import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';

interface Props {
  title: string;
  onBack: () => void;
}

export function ScreenHeader({ title, onBack }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.back,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ scale: pressed ? 0.92 : 1 }],
          },
        ]}
      >
        <ChevronLeft size={17} color={colors.text2} strokeWidth={2.4} />
      </Pressable>
      <AppText variant="displaySemibold" style={{ fontSize: 16 }}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 14 },
  back: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
