import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Smartphone, LayoutGrid, ShieldCheck, Activity as ActivityIcon, Tag, Wifi,
  Image as ImageIcon, MessageSquare, Globe, Phone, KeyRound, Mail, MapPin, Camera,
  Eye, EyeOff,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { FilterChips } from '../../components/FilterChips';
import { Entrance, CountUp } from '../../components/Motion';
import { useAppStore, ORG_NAME } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

type Row = { label: string; detail: string; visible: boolean; Icon: any };

const DATA: Row[] = [
  { label: 'Device model & OS', detail: 'iPhone · iOS version', visible: true, Icon: Smartphone },
  { label: 'Work apps installed', detail: 'From this catalog only', visible: true, Icon: LayoutGrid },
  { label: 'Compliance status', detail: 'Policy checks pass/fail', visible: true, Icon: ShieldCheck },
  { label: 'Work tunnel traffic', detail: 'Only while the tunnel is on', visible: true, Icon: Wifi },
  { label: 'Device name', detail: 'Set during enrollment', visible: true, Icon: Tag },
  { label: 'Enrollment status', detail: 'Enrolled since Jun 18', visible: true, Icon: ActivityIcon },
  { label: 'Personal apps', detail: 'What you install yourself', visible: false, Icon: LayoutGrid },
  { label: 'Photos & media', detail: 'Camera roll, screenshots', visible: false, Icon: ImageIcon },
  { label: 'Personal messages', detail: 'SMS, WhatsApp, iMessage', visible: false, Icon: MessageSquare },
  { label: 'Personal browsing', detail: 'History and searches', visible: false, Icon: Globe },
  { label: 'Call history', detail: 'Who you call and when', visible: false, Icon: Phone },
  { label: 'Passwords & accounts', detail: 'Personal logins and keychain', visible: false, Icon: KeyRound },
  { label: 'Personal email', detail: 'Non-work inboxes', visible: false, Icon: Mail },
  { label: 'Location (tunnel off)', detail: 'Only office check-in, if on', visible: false, Icon: MapPin },
  { label: 'Camera & mic', detail: 'Never accessed remotely', visible: false, Icon: Camera },
];

export function PrivacyScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const form = useAppStore((s) => s.form);
  const [filter, setFilter] = useState<'all' | 'visible' | 'private'>('all');

  const visibleCount = DATA.filter((d) => d.visible).length;
  const privateCount = DATA.length - visibleCount;

  const rows = useMemo(
    () => DATA.filter((d) => (filter === 'all' ? true : filter === 'visible' ? d.visible : !d.visible)),
    [filter],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: 20 }}>
        <ScreenHeader title="Privacy" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Entrance delay={0}>
          <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5, lineHeight: 18, marginBottom: 16 }}>
            You&rsquo;re on a {form.own === 'company' ? 'company-owned' : 'personal (BYOD)'} device. Here is the exact
            line between what {ORG_NAME} can see and what stays yours.
          </AppText>
        </Entrance>

        <Entrance delay={80}>
          <View style={styles.tally}>
            <Card style={[styles.tallyCard, { borderColor: colors.border }]}>
              <View style={styles.tallyTop}>
                <Eye size={17} color={colors.info} strokeWidth={2.2} />
                <CountUp value={visibleCount}>
                  {(d) => (
                    <AppText variant="display" style={{ fontSize: 26, letterSpacing: -0.5 }}>
                      {d}
                    </AppText>
                  )}
                </CountUp>
              </View>
              <AppText variant="bodyBold" color={colors.muted2} style={styles.tallyLabel}>
                VISIBLE TO IT
              </AppText>
            </Card>
            <Card style={[styles.tallyCard, { borderColor: colors.border }]}>
              <View style={styles.tallyTop}>
                <EyeOff size={17} color={colors.success} strokeWidth={2.2} />
                <CountUp value={privateCount}>
                  {(d) => (
                    <AppText variant="display" style={{ fontSize: 26, letterSpacing: -0.5 }}>
                      {d}
                    </AppText>
                  )}
                </CountUp>
              </View>
              <AppText variant="bodyBold" color={colors.muted2} style={styles.tallyLabel}>
                STAYS PRIVATE
              </AppText>
            </Card>
          </View>
        </Entrance>

        <Entrance delay={160}>
          <View style={{ marginBottom: 12 }}>
            <FilterChips
              value={filter}
              onChange={(k) => setFilter(k as typeof filter)}
              options={[
                { key: 'all', label: `All · ${DATA.length}` },
                { key: 'visible', label: `Visible · ${visibleCount}` },
                { key: 'private', label: `Private · ${privateCount}` },
              ]}
            />
          </View>
        </Entrance>

        <Card style={{ overflow: 'hidden' }} padded={false}>
          {rows.map((r, i) => (
            <Entrance key={r.label} delay={220 + Math.min(i, 7) * 55}>
              <View
                style={[styles.row, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}
              >
                <View style={[styles.rowIcon, { backgroundColor: r.visible ? colors.infoTint : colors.successTint }]}>
                  <r.Icon size={16} color={r.visible ? colors.info : colors.success} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
                    {r.label}
                  </AppText>
                  <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, marginTop: 1 }}>
                    {r.detail}
                  </AppText>
                </View>
                <View style={[styles.pill, { backgroundColor: r.visible ? colors.infoTint : colors.successTint }]}>
                  <View style={[styles.pillDot, { backgroundColor: r.visible ? colors.info : colors.success }]} />
                  <AppText variant="bodyBold" color={r.visible ? colors.info : colors.success} style={{ fontSize: 10.5 }}>
                    {r.visible ? 'IT' : 'Private'}
                  </AppText>
                </View>
              </View>
            </Entrance>
          ))}
        </Card>

        <Entrance delay={260}>
          <AppText variant="body" color={colors.muted2} style={styles.foot}>
            Managed by {ORG_NAME} IT · you can review this anytime. Personal (BYOD) devices share far less than
            company-owned ones.
          </AppText>
        </Entrance>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: 20, paddingBottom: 34 },
  tally: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  tallyCard: { flex: 1 },
  tallyLabel: { fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase' },
  tallyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  pillDot: { width: 5, height: 5, borderRadius: 2.5 },
  foot: { fontSize: 11, lineHeight: 17, marginTop: 18 },
});
