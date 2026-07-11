import React from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Server, EyeOff, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ToggleSwitch } from '../../components/ToggleSwitch';
import { useAppStore, ORG_NAME } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export function AboutScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const perms = useAppStore((s) => s.perms);
  const setPerm = useAppStore((s) => s.setPerm);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: 20 }}>
        <ScreenHeader title="About" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroIcon, { backgroundColor: colors.primaryTint }]}>
          <Server size={26} color={colors.primary} strokeWidth={2} />
        </View>
        <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5, lineHeight: 18, marginBottom: 18 }}>
          Server connection, privacy and permissions for this managed device.
        </AppText>

        <Card style={styles.serverCard}>
          <View style={styles.serverRow}>
            <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
              Server status
            </AppText>
            <View style={[styles.activePill, { backgroundColor: colors.successTint }]}>
              <View style={[styles.pillDot, { backgroundColor: colors.success }]} />
              <AppText variant="bodyBold" color={colors.success} style={{ fontSize: 11.5 }}>
                Active
              </AppText>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.hairline }]} />
          <FieldRow label="Base domain" value="www.endpointdefence.com" />
          <View style={[styles.divider, { backgroundColor: colors.hairline }]} />
          <FieldRow label="Managed config" value="Loaded" />
          <AppText variant="body" color={colors.muted} style={{ fontSize: 11.5, lineHeight: 17, marginTop: 10 }}>
            Server connection is active and ready to use for device management services.
          </AppText>
        </Card>

        <AppText variant="displaySemibold" style={styles.sectionLabel}>
          Privacy
        </AppText>
        <Pressable onPress={() => navigation.navigate('Privacy')}>
          <Card style={[styles.section, styles.privacyLink]}>
            <View style={[styles.privacyIcon, { backgroundColor: colors.successTint }]}>
              <EyeOff size={20} color={colors.success} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
                What {ORG_NAME} can &amp; can&rsquo;t see
              </AppText>
              <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
                6 things visible · 9 stay private on your device
              </AppText>
            </View>
            <ChevronRight size={17} color={colors.faint} strokeWidth={2.2} />
          </Card>
        </Pressable>

        <AppText variant="displaySemibold" style={styles.sectionLabel}>
          App permissions
        </AppText>
        <Card style={{ marginBottom: 0 }} padded={false}>
          <GrantRow label="Notifications" tag="Required" bordered />
          <GrantRow label="VPN configuration" tag="Required" bordered />
          <GrantRow label="Device management" tag="Required" bordered />
          <View style={styles.grantRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" style={{ fontSize: 13 }}>
                Location
              </AppText>
              <AppText variant="body" color={colors.muted2} style={{ fontSize: 11, marginTop: 1 }}>
                Office geofence check-in only
              </AppText>
            </View>
            <ToggleSwitch value={perms.loc} onChange={(v) => setPerm('loc', v)} onColor={colors.success} />
          </View>
        </Card>

        <AppText variant="body" color={colors.muted2} style={styles.footer}>
          Varies by ownership: personal (BYOD) devices share far less than company-owned.{'\n'}
          UEM Companion · v3.0.0 (prototype) · DPDPA-aligned privacy
        </AppText>

        <View style={styles.poweredBy}>
          <AppText variant="bodySemibold" color={colors.muted2} style={{ fontSize: 10, letterSpacing: 1 }}>
            POWERED BY
          </AppText>
          <Image source={require('../../../assets/logo-wordmark.png')} style={styles.wordmark} resizeMode="contain" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.serverRow}>
      <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5 }}>
        {label}
      </AppText>
      <AppText variant="bodySemibold" style={{ fontSize: 12.5 }}>
        {value}
      </AppText>
    </View>
  );
}

function GrantRow({ label, tag, bordered }: { label: string; tag: string; bordered?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.grantRow, bordered && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}>
      <AppText variant="bodyMedium" style={{ fontSize: 13, flex: 1 }}>
        {label}
      </AppText>
      <View style={[styles.tag, { backgroundColor: colors.surfaceSunken }]}>
        <AppText variant="bodySemibold" color={colors.muted} style={{ fontSize: 11 }}>
          {tag}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: 20, paddingBottom: 34 },
  heroIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  serverCard: { marginBottom: 22 },
  serverRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9 },
  divider: { height: 1 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  sectionLabel: { fontSize: 13.5, marginBottom: 10, marginHorizontal: 2 },
  section: { marginBottom: 12 },
  privacyLink: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  privacyIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  line: { flexDirection: 'row', gap: 9 },
  grantRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 16 },
  tag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  footer: { fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 22 },
  poweredBy: { alignItems: 'center', gap: 6, marginTop: 20, opacity: 0.85 },
  wordmark: { width: 118, height: 22 },
});
