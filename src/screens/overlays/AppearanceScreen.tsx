import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ThemePicker } from '../../components/ThemePicker';
import { BrandThemePicker } from '../../components/BrandThemePicker';
import { useAppStore } from '../../state/store';
import { Entrance } from '../../components/Motion';
import { layout } from '../../theme/spacing';
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
      <View style={styles.gutter}>
        <ScreenHeader title="Appearance" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Entrance delay={0}>
          <AppText variant="body" size="caption" color={colors.muted} style={styles.intro}>
            Choose how UEM Companion looks on this device. Changes apply immediately, everywhere in the app.
          </AppText>
        </Entrance>

        <Entrance delay={90}>
          <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.sectionLabel}>
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
            <AppText variant="body" size="caption" color={colors.muted2} style={styles.note}>
              {themeMode === 'system' ? 'Following your device setting' : `Always ${themeMode[0].toUpperCase()}${themeMode.slice(1)}`}
            </AppText>
          </Card>
        </Entrance>

        <Entrance delay={180}>
          <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.sectionLabel}>
            THEME
          </AppText>
          <Card>
            <BrandThemePicker value={brandTheme} onChange={setBrandTheme} />
            <AppText variant="body" size="caption" color={colors.muted2} style={styles.note}>
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
  gutter: { paddingHorizontal: layout.gutter },
  // SafeAreaView already owns the bottom inset.
  body: { paddingHorizontal: layout.gutter, paddingBottom: layout.screenBottom },
  // The intro sits above a section label, so it takes the section break.
  intro: { marginBottom: layout.sectionGap },
  // The gutter is `layout.gutter`, full stop — the old marginHorizontal: 2 here
  // quietly made it 22 for this one element.
  sectionLabel: { letterSpacing: 1.1, marginBottom: layout.labelGap },
  section: { marginBottom: layout.sectionGap },
  note: { marginTop: layout.labelGap },
});
