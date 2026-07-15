import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeCheck, X, ShieldCheck, UserCog, Download, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { BottomSheet } from '../../components/BottomSheet';
import { Spinner } from '../../components/Animations';
import { Entrance, PressableScale, CountUp } from '../../components/Motion';
import { useAppStore, ORG_NAME } from '../../state/store';
import { certDefs } from '../../data/mockData';
import { CertDef } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Certs'>;

function fmtExpiry(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

export function CertsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const certs = useAppStore((s) => s.certs);
  const installCert = useAppStore((s) => s.installCert);
  const defs = certDefs(ORG_NAME);
  const [selected, setSelected] = useState<CertDef | null>(null);

  const waiting = defs.filter((c) => certs[c.id] !== 'installed');
  const installed = defs.filter((c) => certs[c.id] === 'installed');
  const pendingCount = defs.filter((c) => certs[c.id] === 'pending').length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: 20 }}>
        <ScreenHeader title="Certificates" onBack={() => navigation.goBack()} />
      </View>
      <AppText variant="body" color={colors.muted} style={styles.subtitle}>
        Pushed by {ORG_NAME} IT. Required for Wi-Fi and the secure tunnel.
      </AppText>

      {pendingCount > 0 && (
        <Entrance delay={0}>
          <View style={[styles.bannerRow, { backgroundColor: colors.amberTint }]}>
            <ShieldCheck size={16} color={colors.amberStrong} strokeWidth={2.2} />
            <AppText variant="bodySemibold" color={colors.amberStrong} style={{ fontSize: 12, flex: 1 }}>
              {pendingCount === 1 ? (
                '1 certificate needs your action to keep this device compliant.'
              ) : (
                <>
                  <CountUp value={pendingCount}>
                    {(d) => (
                      <AppText variant="bodySemibold" color={colors.amberStrong} style={{ fontSize: 12 }}>
                        {d}
                      </AppText>
                    )}
                  </CountUp>
                  {' certificates need your action to keep this device compliant.'}
                </>
              )}
            </AppText>
          </View>
        </Entrance>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {waiting.length > 0 && (
          <Entrance delay={80}>
            <SectionTitle badge="ACTION">Waiting for you</SectionTitle>
            <CertSection certs={waiting} statuses={certs} onInstall={installCert} onOpenDetail={setSelected} />
          </Entrance>
        )}
        {installed.length > 0 && (
          <Entrance delay={160}>
            <SectionTitle>Installed</SectionTitle>
            <CertSection certs={installed} statuses={certs} onInstall={installCert} onOpenDetail={setSelected} last />
          </Entrance>
        )}
        <Entrance delay={220}>
          <AppText variant="body" color={colors.muted2} style={styles.footNote}>
            Installing a certificate is logged and visible to your admin.
          </AppText>
        </Entrance>
      </ScrollView>

      <BottomSheet visible={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <CertDetail
            cert={selected}
            status={certs[selected.id]}
            onInstall={() => installCert(selected.id)}
            onClose={() => setSelected(null)}
          />
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}

function SectionTitle({ children, badge }: { children: React.ReactNode; badge?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionTitleRow}>
      <AppText
        variant="bodyBold"
        color={colors.muted2}
        style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}
      >
        {children}
      </AppText>
      {badge && (
        <View style={[styles.policyBadge, { backgroundColor: colors.amberTint }]}>
          <AppText variant="bodyBold" color={colors.amberStrong} style={{ fontSize: 10, letterSpacing: 0.3 }}>
            {badge}
          </AppText>
        </View>
      )}
    </View>
  );
}

function CertSection({
  certs,
  statuses,
  onInstall,
  onOpenDetail,
  last,
}: {
  certs: CertDef[];
  statuses: Record<string, string>;
  onInstall: (id: string) => void;
  onOpenDetail: (cert: CertDef) => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Card style={[styles.sectionCard, !last && { marginBottom: 18 }]} padded={false}>
      {certs.map((c, i) => {
        const status = statuses[c.id];
        const installed = status === 'installed';
        const installing = status === 'installing';
        const tileBg = installed ? colors.successTint : colors.amberTint;
        const tileC = installed ? colors.success : colors.amber;
        const stDot = installed ? colors.success : installing ? colors.primary : colors.amber;
        const stC = installed ? colors.success : installing ? colors.primaryStrong : colors.amberStrong;
        const stLabel = installed ? 'Installed' : installing ? 'Installing…' : 'Waiting for you';
        return (
          <Entrance key={c.id} delay={Math.min(i, 7) * 55}>
            <View
              style={[styles.row, i < certs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}
            >
              {/* Info area and action button are siblings, not nested Pressables —
                  nesting them would let a tap on "Install" bubble up and also
                  trigger the row's open-detail handler. */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <PressableScale
                  onPress={() => onOpenDetail(c)}
                  style={styles.rowInfo}
                  accessibilityLabel={`${c.name} details`}
                >
                  <View style={[styles.icon, { backgroundColor: tileBg }]}>
                    <BadgeCheck size={19} color={tileC} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 13.5 }}>
                      {c.name}
                    </AppText>
                    <AppText variant="body" color={colors.muted2} numberOfLines={1} style={{ fontSize: 11.5, marginTop: 2 }}>
                      {c.detail} · Pushed {c.pushedDate}
                    </AppText>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: stDot }]} />
                      <AppText variant="bodySemibold" color={stC} style={{ fontSize: 11 }}>
                        {stLabel}
                      </AppText>
                    </View>
                  </View>
                </PressableScale>
              </View>
              <CertActionButton status={status} name={c.name} onInstall={() => onInstall(c.id)} />
            </View>
          </Entrance>
        );
      })}
    </Card>
  );
}

function CertActionButton({ status, name, onInstall }: { status: string; name: string; onInstall: () => void }) {
  const { colors } = useTheme();
  if (status === 'pending')
    return (
      <IconButton
        variant="primary"
        onPress={onInstall}
        accessibilityLabel={`Install ${name}`}
        icon={<Download size={19} color={colors.white} strokeWidth={2.2} />}
      />
    );
  if (status === 'installing')
    return (
      <View accessible accessibilityLabel={`Installing ${name}`} style={styles.statusSlot}>
        <Spinner>
          <BadgeCheck size={18} color={colors.primary} strokeWidth={2.4} />
        </Spinner>
      </View>
    );
  return (
    <View accessible accessibilityLabel={`${name} installed`} style={[styles.statusSlot, { backgroundColor: colors.successTint }]}>
      <Check size={19} color={colors.success} strokeWidth={2.6} />
    </View>
  );
}

function CertDetail({
  cert,
  status,
  onInstall,
  onClose,
}: {
  cert: CertDef;
  status: string;
  onInstall: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const installed = status === 'installed';
  const installing = status === 'installing';
  const statusLabel = installed ? 'Installed' : installing ? 'Installing…' : 'Pending';
  const statusColor = installed ? colors.success : installing ? colors.primary : colors.amberStrong;

  return (
    <View>
      <View style={styles.sheetHeader}>
        <View style={[styles.icon, { backgroundColor: installed ? colors.successTint : colors.amberTint }]}>
          <BadgeCheck size={20} color={installed ? colors.success : colors.amber} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="bodySemibold" numberOfLines={2} style={{ fontSize: 14.5 }}>
            {cert.name}
          </AppText>
          <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
            X.509 certificate
          </AppText>
        </View>
        <PressableScale
          onPress={onClose}
          accessibilityLabel="Close"
          style={[styles.closeBtn, { backgroundColor: colors.surfaceSunken }]}
        >
          <X size={14} color={colors.text3} strokeWidth={2.4} />
        </PressableScale>
      </View>

      <View style={[styles.statsRow, { borderTopColor: colors.hairline, borderBottomColor: colors.hairline }]}>
        <DetailStat value={statusLabel} label="Status" color={statusColor} />
        <View style={[styles.statDivider, { backgroundColor: colors.hairline }]} />
        <DetailStat value={fmtExpiry(cert.expires)} label="Expires" />
        <View style={[styles.statDivider, { backgroundColor: colors.hairline }]} />
        <DetailStat value={cert.pushedDate} label="Pushed" />
      </View>

      <View style={styles.sheetBody}>
        <AppText variant="body" color={colors.text2} style={{ fontSize: 13, lineHeight: 19 }}>
          {cert.usedFor}
        </AppText>
        <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, marginTop: 8 }}>
          Issuer: {cert.issuer}
        </AppText>
        <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, marginTop: 2 }}>
          Serial: {cert.serial}
        </AppText>

        <View style={{ marginTop: 20 }}>
          {status === 'pending' && <Button label="Install certificate" onPress={onInstall} />}
          {installing && (
            <View style={styles.installingRow}>
              <Spinner>
                <BadgeCheck size={16} color={colors.primary} strokeWidth={2.4} />
              </Spinner>
              <AppText variant="bodySemibold" color={colors.primary} style={{ fontSize: 13 }}>
                Installing…
              </AppText>
            </View>
          )}
          {installed && (
            <View style={styles.installingRow}>
              <BadgeCheck size={16} color={colors.success} strokeWidth={2.4} />
              <AppText variant="bodySemibold" color={colors.success} style={{ fontSize: 13 }}>
                Installed on this device
              </AppText>
            </View>
          )}
          <View style={styles.pushedByRow}>
            <UserCog size={13} color={colors.muted2} strokeWidth={2} />
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5 }}>
              Pushed by {ORG_NAME} IT
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

function DetailStat({ value, label, color }: { value: string; label: string; color?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailStat}>
      <AppText variant="displaySemibold" color={color} style={{ fontSize: 13.5 }} numberOfLines={1}>
        {value}
      </AppText>
      <AppText variant="body" color={colors.muted2} style={{ fontSize: 10.5, marginTop: 2 }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  subtitle: { fontSize: 12.5, lineHeight: 18, marginHorizontal: 24, marginBottom: 12 },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 12, padding: 12, marginHorizontal: 20, marginBottom: 14 },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginHorizontal: 4 },
  policyBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  sectionCard: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  rowInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 13, minWidth: 0 },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusSlot: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  footNote: { fontSize: 11.5, lineHeight: 17, marginTop: 4, marginHorizontal: 4 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 14, paddingTop: 8 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1 },
  statDivider: { width: 1, height: 30 },
  detailStat: { flex: 1, alignItems: 'center' },
  sheetBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  installingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, justifyContent: 'center' },
  pushedByRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
});
