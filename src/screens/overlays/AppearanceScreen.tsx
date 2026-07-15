import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sun, Moon, Monitor, Palette } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ThemePicker } from '../../components/ThemePicker';
import { BrandThemePicker } from '../../components/BrandThemePicker';
import { useAppStore } from '../../state/store';
import { Entrance } from '../../components/Motion';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Appearance'>;

export function AppearanceScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const brandTheme = useAppStore((s) => s.brandTheme);
  const setBrandTheme = useAppStore((s) => s.setBrandTheme);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: 20 }}>
        <ScreenHeader title="Appearance" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Entrance delay={0}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primaryTint }]}>
            <Palette size={26} color={colors.primary} strokeWidth={2} />
          </View>
          <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5, lineHeight: 18, marginBottom: 22 }}>
            Choose how UEM Companion looks on this device. Changes apply immediately, everywhere in the app.
          </AppText>
        </Entrance>

        <Entrance delay={90}>
          <AppText variant="bodyBold" color={colors.muted2} style={styles.sectionLabel}>
            MODE
          </AppText>
          <Card style={styles.section}>
            <ThemePicker
              value={themeMode}
              onChange={setThemeMode}
              options={[
                { value: 'light', label: 'Light', icon: (c) => <Sun size={18} color={c} strokeWidth={2.2} /> },
                { value: 'dark', label: 'Dark', icon: (c) => <Moon size={18} color={c} strokeWidth={2.2} /> },
                { value: 'system', label: 'System', icon: (c) => <Monitor size={18} color={c} strokeWidth={2.2} /> },
              ]}
            />
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, marginTop: 12 }}>
              {themeMode === 'system' ? 'Following your device setting' : `Always ${themeMode[0].toUpperCase()}${themeMode.slice(1)}`}
            </AppText>
          </Card>
        </Entrance>

        <Entrance delay={180}>
          <AppText variant="bodyBold" color={colors.muted2} style={styles.sectionLabel}>
            THEME
          </AppText>
          <Card style={{ marginBottom: 0 }}>
            <BrandThemePicker value={brandTheme} onChange={setBrandTheme} />
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, marginTop: 12, lineHeight: 16 }}>
              Sets the accent color used for buttons, links and highlights across the app.
            </AppText>
          </Card>
        </Entrance>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: 20, paddingBottom: 34 },
  heroIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  sectionLabel: { fontSize: 10.5, letterSpacing: 1.1, marginBottom: 10, marginHorizontal: 2 },
  section: { marginBottom: 22 },
});
