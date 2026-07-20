import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BadgeCheck, X, ShieldCheck, UserCog, Download, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { AuditLine } from '../../components/AuditLine';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { IconTile } from '../../components/IconTile';
import { StatusDot } from '../../components/StatusDot';
import { InfoNote } from '../../components/InfoNote';
import { ScreenHeader } from '../../components/ScreenHeader';
import { BottomSheet } from '../../components/BottomSheet';
import { Spinner } from '../../components/Animations';
import { Entrance, PressableScale, CountUp } from '../../components/Motion';
import { useAppStore, ORG_NAME, findAudit } from '../../state/store';
import { navigate } from '../../navigation/navigationRef';
import { certDefs } from '../../data/mockData';
import { CertDef } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { radii } from '../../theme/platform';
import { space, layout, control } from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Certs'>;

// The non-interactive twin of the row's IconButton — same footprint so the
// installed/installing states don't shift the row.
const ACTION_SLOT = 44;

function fmtExpiry(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

export function CertsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const certs = useAppStore((s) => s.certs);
  const installCert = useAppStore((s) => s.installCert);
  const defs = certDefs(ORG_NAME);
  const [selected, setSelected] = useState<CertDef | null>(null);

  const waiting = defs.filter((c) => certs[c.id] !== 'installed');
  const installed = defs.filter((c) => certs[c.id] === 'installed');
  const pendingCount = defs.filter((c) => certs[c.id] === 'pending').length;

  return (
    // Bottom is owned by the scroll's own padding (inset + screenBottom) rather
    // than by a safe-area edge, so content can scroll under the home indicator.
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* One gutter mechanism: padding on the container. The banner used to set
          its own marginHorizontal while the scroll used paddingHorizontal. */}
      <View style={styles.gutter}>
        {/* The subtitle is the header's own caption — ScreenHeader's `sub` slot
            is what it's for, and it kills the old marginHorizontal: 24. */}
        <ScreenHeader
          title="Certificates"
          sub={`Pushed by ${ORG_NAME} IT. Required for Wi-Fi and the secure tunnel.`}
          onBack={() => navigation.goBack()}
        />

        {pendingCount > 0 && (
          <Entrance delay={0}>
            <View style={[styles.bannerRow, { backgroundColor: colors.amberTint }]}>
              <ShieldCheck size={control.icon.md} color={colors.amberStrong} strokeWidth={2.2} />
              <AppText variant="bodySemibold" size="caption" color={colors.amberStrong} style={styles.bannerText}>
                {pendingCount === 1 ? (
                  '1 certificate needs your action to keep this device compliant.'
                ) : (
                  <>
                    <CountUp value={pendingCount}>
                      {(d) => (
                        <AppText variant="bodySemibold" size="caption" color={colors.amberStrong}>
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
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + layout.screenBottom }]}
        showsVerticalScrollIndicator={false}
      >
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
          <AppText variant="body" size="caption" color={colors.muted2} style={styles.footNote}>
            Installing a certificate is logged and visible to your admin.
          </AppText>
        </Entrance>
      </ScrollView>

      <BottomSheet visible={!!selected} onClose={() => setSelected(null)} accessibilityLabel="Certificate details">
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
      <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.sectionTitleText}>
        {children}
      </AppText>
      {badge && (
        <View style={[styles.policyBadge, { backgroundColor: colors.amberTint }]}>
          <AppText variant="bodyBold" size="micro" color={colors.amberStrong} style={styles.policyBadgeText}>
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
    <Card style={[styles.sectionCard, !last && { marginBottom: layout.sectionGap }]} padded={false}>
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
                  trigger the row's open-detail handler. This row carries a third
                  line (the status), which is why it isn't a <ListRow>; its
                  geometry is the ListRow tokens applied by hand. */}
              <View style={styles.rowInfoWrap}>
                <PressableScale
                  onPress={() => onOpenDetail(c)}
                  style={styles.rowInfo}
                  accessibilityLabel={`${c.name} details`}
                >
                  <IconTile bg={tileBg}>
                    <BadgeCheck size={control.icon.lg} color={tileC} strokeWidth={2} />
                  </IconTile>
                  <View style={styles.rowText}>
                    <AppText variant="bodySemibold" size="footnote" numberOfLines={1}>
                      {c.name}
                    </AppText>
                    <AppText variant="body" size="caption" color={colors.muted2} numberOfLines={1}>
                      {c.detail} · Pushed {c.pushedDate}
                    </AppText>
                    {/* Was a bare 6px dot plus a separate label. StatusDot renders
                        both, so the status can never go anonymous. */}
                    <StatusDot color={stDot} label={stLabel} labelColor={stC} />
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
        icon={<Download size={control.icon.lg} color={colors.white} strokeWidth={2.2} />}
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
      <Check size={control.icon.lg} color={colors.success} strokeWidth={2.6} />
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
  const activity = useAppStore((s) => s.activity);
  const installed = status === 'installed';
  const installing = status === 'installing';
  const statusLabel = installed ? 'Installed' : installing ? 'Installing…' : 'Pending';
  const statusColor = installed ? colors.success : installing ? colors.primary : colors.amberStrong;
  // PRODUCT.md: provenance on every credential. The sheet already shows issuer,
  // serial and expiry; this adds who put it here and when — the toast that said
  // so vanished 4.5 seconds after the install.
  const installAudit = findAudit(activity, 'cert', [`Installed ${cert.name}`]);

  return (
    <View>
      <View style={styles.sheetHeader}>
        <IconTile bg={installed ? colors.successTint : colors.amberTint}>
          <BadgeCheck size={control.icon.lg} color={installed ? colors.success : colors.amber} strokeWidth={2} />
        </IconTile>
        <View style={styles.sheetTitleCol}>
          <AppText variant="bodySemibold" size="body" numberOfLines={2}>
            {cert.name}
          </AppText>
          <AppText variant="body" size="caption" color={colors.muted}>
            X.509 certificate
          </AppText>
        </View>
        <IconButton
          icon={<X size={control.icon.md} color={colors.text3} strokeWidth={2.4} />}
          onPress={onClose}
          accessibilityLabel="Close"
          variant="neutral"
          size={control.height.sm}
        />
      </View>

      <View style={[styles.statsRow, { borderTopColor: colors.hairline, borderBottomColor: colors.hairline }]}>
        <DetailStat value={statusLabel} label="Status" color={statusColor} />
        <View style={[styles.statDivider, { backgroundColor: colors.hairline }]} />
        <DetailStat value={fmtExpiry(cert.expires)} label="Expires" />
        <View style={[styles.statDivider, { backgroundColor: colors.hairline }]} />
        <DetailStat value={cert.pushedDate} label="Pushed" />
      </View>

      <View style={styles.sheetBody}>
        <AppText variant="body" size="footnote" color={colors.text2}>
          {cert.usedFor}
        </AppText>
        <AppText variant="body" size="caption" color={colors.muted2} style={styles.metaFirst}>
          Issuer: {cert.issuer}
        </AppText>
        <AppText variant="body" size="caption" color={colors.muted2} style={styles.metaNext}>
          Serial: {cert.serial}
        </AppText>

        <View style={styles.actionBlock}>
          {status === 'pending' && <Button label="Install certificate" onPress={onInstall} />}
          {installing && (
            <View style={styles.installingRow}>
              <Spinner>
                <BadgeCheck size={control.icon.md} color={colors.primary} strokeWidth={2.4} />
              </Spinner>
              <AppText variant="bodySemibold" size="footnote" color={colors.primary}>
                Installing…
              </AppText>
            </View>
          )}
          {installed && (
            <View>
              <View style={styles.installingRow}>
                <BadgeCheck size={control.icon.md} color={colors.success} strokeWidth={2.4} />
                <AppText variant="bodySemibold" size="footnote" color={colors.success}>
                  Installed on this device
                </AppText>
              </View>
              {installAudit ? (
                <View style={styles.auditWrap}>
                  <AuditLine
                    time={installAudit.time}
                    actor={installAudit.actor}
                    onPress={() => navigate('Activity')}
                  />
                </View>
              ) : null}
            </View>
          )}
          <InfoNote
            text={`Pushed by ${ORG_NAME} IT`}
            icon={<UserCog size={12} color={colors.muted2} strokeWidth={2} />}
          />
        </View>
      </View>
    </View>
  );
}

function DetailStat({ value, label, color }: { value: string; label: string; color?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailStat}>
      <AppText variant="displaySemibold" size="footnote" color={color} numberOfLines={1}>
        {value}
      </AppText>
      <AppText variant="body" size="micro" color={colors.muted2}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gutter: { paddingHorizontal: layout.gutter },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    borderRadius: radii.tile,
    padding: space[3],
    marginBottom: layout.blockGap,
  },
  bannerText: { flex: 1 },
  scroll: { paddingHorizontal: layout.gutter },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: layout.labelGap },
  sectionTitleText: { letterSpacing: 1, textTransform: 'uppercase' },
  policyBadge: { borderRadius: space[2], paddingHorizontal: space[2], paddingVertical: space[1] },
  policyBadgeText: { letterSpacing: 0.3 },
  sectionCard: { overflow: 'hidden' },
  // ListRow's geometry, applied by hand — this row has a third line, so it
  // can't be a ListRow, but it must not invent its own paddings either.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.rowGap,
    paddingVertical: layout.rowPadV,
    paddingHorizontal: layout.rowPadH,
  },
  rowInfoWrap: { flex: 1, minWidth: 0 },
  rowInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: layout.rowGap, minWidth: 0 },
  rowText: { flex: 1, minWidth: 0, gap: layout.captionGap },
  statusSlot: {
    width: ACTION_SLOT,
    height: ACTION_SLOT,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  footNote: { marginTop: layout.blockGap },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: layout.sheetPad,
    paddingBottom: layout.cardGap,
    paddingTop: space[2],
  },
  sheetTitleCol: { flex: 1, minWidth: 0, gap: layout.captionGap },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: layout.cardPad, borderTopWidth: 1, borderBottomWidth: 1 },
  statDivider: { width: 1, height: space[8] },
  detailStat: { flex: 1, alignItems: 'center', gap: layout.captionGap },
  // Bottom pad now comes from BottomSheet (inset + screenBottom).
  sheetBody: { paddingHorizontal: layout.sheetPad, paddingTop: layout.cardPad },
  metaFirst: { marginTop: layout.labelGap },
  metaNext: { marginTop: layout.captionGap },
  actionBlock: { marginTop: layout.blockGap },
  installingRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: layout.captionGap, justifyContent: 'center' },
  auditWrap: { alignItems: 'center' },
});
