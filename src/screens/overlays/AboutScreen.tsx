import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EyeOff, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { ListRow } from '../../components/ListRow';
import { IconTile } from '../../components/IconTile';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ToggleSwitch } from '../../components/ToggleSwitch';
import { Entrance, PressableScale, CountUp } from '../../components/Motion';
import { useAppStore, ORG_NAME } from '../../state/store';
import { PRIVACY_VISIBLE_COUNT, PRIVACY_PRIVATE_COUNT } from '../../data/mockData';
import { space, layout, control } from '../../theme/spacing';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export function AboutScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const perms = useAppStore((s) => s.perms);
  const setPerm = useAppStore((s) => s.setPerm);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.gutter}>
        <ScreenHeader title="About" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Entrance delay={0}>
          <AppText variant="body" size="caption" color={colors.muted} style={styles.intro}>
            Where this device is managed from, what {ORG_NAME} can see, and the permissions this app holds.
          </AppText>
        </Entrance>

        {/* The "Server status · Active" pill and "Managed config · Loaded" are
            gone. Both were hardcoded — there is no server state in the store, so
            neither could ever render anything but green, and a status that
            cannot change is decoration wearing a status's clothes. The base
            domain is the one fact this card actually holds. */}
        <Entrance delay={80}>
          <Card style={styles.serverCard}>
            <FieldRow label="Base domain" value="www.endpointdefence.com" />
            <AppText variant="body" size="caption" color={colors.muted} style={styles.serverNote}>
              {ORG_NAME} IT manages this device from this domain.
            </AppText>
          </Card>
        </Entrance>

        <Entrance delay={160}>
          <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.sectionLabel}>
            PRIVACY
          </AppText>
          {/* Not a ListRow: the sub-line carries live CountUp counters, and
              ListRow's `sub` is a plain string. */}
          <PressableScale
            onPress={() => navigation.navigate('Privacy')}
            accessibilityLabel={`What ${ORG_NAME} can and can’t see. ${PRIVACY_VISIBLE_COUNT} things visible, ${PRIVACY_PRIVATE_COUNT} stay private on your device.`}
          >
            <Card style={[styles.section, styles.privacyLink]}>
              <IconTile bg={colors.successTint}>
                <EyeOff size={control.icon.lg} color={colors.success} strokeWidth={2} />
              </IconTile>
              <View style={{ flex: 1 }}>
                <AppText variant="bodySemibold" size="footnote">
                  What {ORG_NAME} can &amp; can&rsquo;t see
                </AppText>
                <AppText variant="body" size="caption" color={colors.muted} style={styles.privacyLinkSub}>
                  <CountUp value={PRIVACY_VISIBLE_COUNT}>{(d) => d}</CountUp> things visible ·{' '}
                  <CountUp value={PRIVACY_PRIVATE_COUNT}>{(d) => d}</CountUp> stay private on your device
                </AppText>
              </View>
              <ChevronRight size={control.icon.md} color={colors.faint} strokeWidth={2.2} />
            </Card>
          </PressableScale>
        </Entrance>

        <Entrance delay={240}>
          <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.sectionLabel}>
            APP PERMISSIONS
          </AppText>
          <Card padded={false}>
            <GrantRow label="Notifications" tag="Required" bordered />
            <GrantRow label="Secure tunnel configuration" tag="Required" bordered />
            <GrantRow label="Device management" tag="Required" bordered />
            <ListRow
              label="Location"
              sub="Office geofence check-in only"
              right={
                <ToggleSwitch
                  value={perms.loc}
                  onChange={(v) => setPerm('loc', v)}
                  onColor={colors.success}
                  label="Location"
                />
              }
            />
          </Card>
        </Entrance>

        <Entrance delay={320}>
          {/* The "personal devices share far less than company-owned" claim is
              gone — the ledger it pointed at is identical for both, so the app
              was claiming a difference it does not show. */}
          <AppText variant="body" size="micro" color={colors.muted2} style={styles.footer}>
            UEM Companion · v3.0.0 (prototype) · DPDPA-aligned privacy
          </AppText>

          <View style={styles.poweredBy}>
            <AppText variant="bodySemibold" size="micro" color={colors.muted2} style={styles.poweredByLabel}>
              POWERED BY
            </AppText>
            {/* The wordmark is the only place the vendor name appears — without a
                label it is announced to nobody. */}
            <Image
              source={require('../../../assets/logo-wordmark.png')}
              style={styles.wordmark}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="miniOrange"
            />
          </View>
        </Entrance>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.serverRow}>
      <AppText variant="body" size="caption" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="bodySemibold" size="caption">
        {value}
      </AppText>
    </View>
  );
}

function GrantRow({ label, tag, bordered }: { label: string; tag: string; bordered?: boolean }) {
  const { colors } = useTheme();
  return (
    <ListRow
      label={label}
      bordered={bordered}
      right={
        <View style={[styles.tag, { backgroundColor: colors.surfaceSunken }]}>
          <AppText variant="bodySemibold" size="micro" color={colors.muted}>
            {tag}
          </AppText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gutter: { paddingHorizontal: layout.gutter },
  // SafeAreaView already owns the bottom inset.
  body: { paddingHorizontal: layout.gutter, paddingBottom: layout.screenBottom },
  intro: { marginBottom: layout.blockGap },
  serverCard: { marginBottom: layout.sectionGap },
  serverRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space[2] },
  serverNote: { marginTop: layout.labelGap },
  // The gutter is `layout.gutter`, full stop — the old marginHorizontal: 2 here
  // quietly made it 22 for this one element.
  sectionLabel: { letterSpacing: 1, marginBottom: layout.labelGap },
  section: { marginBottom: layout.sectionGap },
  privacyLink: { flexDirection: 'row', alignItems: 'center', gap: layout.rowGap },
  // The same deliberate 2 that ListRow.textCol uses: a label and its own caption
  // are one object, and 4 already reads as a separation between them.
  privacyLinkSub: { marginTop: 2 },
  tag: { borderRadius: 6, paddingHorizontal: space[2], paddingVertical: space[1] },
  footer: { textAlign: 'center', marginTop: layout.sectionGap },
  poweredBy: { alignItems: 'center', gap: layout.labelGap, marginTop: layout.blockGap, opacity: 0.85 },
  poweredByLabel: { letterSpacing: 1 },
  wordmark: { width: 118, height: 22 },
});
