import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { useAppStore } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Left'>;

export function UnenrolledScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const resetAll = useAppStore((s) => s.resetAll);

  const setupAgain = () => {
    resetAll();
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSunken }]}>
          <LogOut size={40} color={colors.muted} strokeWidth={2} />
        </View>
        <View>
          <AppText variant="display" style={styles.h1}>
            Device removed
          </AppText>
          <AppText variant="body" color={colors.text3} style={styles.p}>
            Work apps, files and the secure tunnel were removed. Your personal data was not touched.
          </AppText>
        </View>
      </View>
      <View style={styles.footer}>
        <Button label="Set up again" onPress={setupAgain} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 21, marginBottom: 8, textAlign: 'center' },
  p: { fontSize: 13.5, lineHeight: 20, textAlign: 'center' },
  footer: { paddingBottom: 20 },
});
