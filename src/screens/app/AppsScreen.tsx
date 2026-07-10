import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, RefreshCw, X, Lock, UserCog } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ProgressRing } from '../../components/ProgressRing';
import { BottomSheet } from '../../components/BottomSheet';
import { useAppStore, ORG_NAME } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { ripple } from '../../theme/platform';
import { APPS } from '../../data/mockData';
import { AppInstallStatus, CatalogApp } from '../../types';

// Every action button — Install / Update / Open / Request / Pending — shares
// this footprint so the trailing edge of every row lines up, the way the
// Play Store / App Store keep their action buttons a fixed width regardless
// of label length.
const ACTION_BTN_WIDTH = 84;

export function AppsScreen() {
  const { colors } = useTheme();
  const appSt = useAppStore((s) => s.appSt);
  const progress = useAppStore((s) => s.progress);
  const appAction = useAppStore((s) => s.appAction);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CatalogApp | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = q ? APPS.filter((a) => a.name.toLowerCase().includes(q) || a.pub.toLowerCase().includes(q)) : APPS;

  const reqApps = filtered.filter((a) => a.section === 'req');
  const featApps = filtered.filter((a) => a.section === 'feat');
  const availApps = filtered.filter((a) => a.section === 'avail');
  const updatesCount = APPS.filter((a) => appSt[a.id] === 'update').length;
  const noResults = q.length > 0 && reqApps.length === 0 && featApps.length === 0 && availApps.length === 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AppText variant="display" style={{ fontSize: 22, marginBottom: 2 }}>
          Apps
        </AppText>
        <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5, marginBottom: 14 }}>
          Company catalog · curated by {ORG_NAME} IT
        </AppText>

        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={16} color={colors.muted2} strokeWidth={2.2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search apps"
            placeholderTextColor={colors.muted2}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={15} color={colors.muted2} strokeWidth={2.2} />
            </Pressable>
          )}
        </View>

        {!q && updatesCount > 0 && (
          <Card style={styles.updateBanner}>
            <View style={[styles.updateIcon, { backgroundColor: colors.primaryTint }]}>
              <RefreshCw size={17} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
                Updates available
              </AppText>
              <AppText variant="body" color={colors.muted} style={{ fontSize: 11.5, marginTop: 1 }}>
                {updatesCount} {updatesCount === 1 ? 'app needs' : 'apps need'} updating
              </AppText>
            </View>
            <Button
              label="Update all"
              size="sm"
              onPress={() => APPS.forEach((a) => appSt[a.id] === 'update' && appAction(a.id))}
              style={{ width: ACTION_BTN_WIDTH }}
            />
          </Card>
        )}

        {noResults ? (
          <View style={styles.emptyBox}>
            <Search size={26} color={colors.faint} strokeWidth={1.6} />
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 12.5, marginTop: 10 }}>
              No apps match &ldquo;{query}&rdquo;
            </AppText>
          </View>
        ) : (
          <>
            {reqApps.length > 0 && (
              <>
                <SectionTitle badge="POLICY">Required</SectionTitle>
                <AppSection apps={reqApps} appSt={appSt} progress={progress} appAction={appAction} onOpenDetail={setSelected} />
              </>
            )}
            {featApps.length > 0 && (
              <>
                <SectionTitle>Featured</SectionTitle>
                <AppSection apps={featApps} appSt={appSt} progress={progress} appAction={appAction} onOpenDetail={setSelected} />
              </>
            )}
            {availApps.length > 0 && (
              <>
                <SectionTitle>Available on request</SectionTitle>
                <AppSection apps={availApps} appSt={appSt} progress={progress} appAction={appAction} onOpenDetail={setSelected} last />
              </>
            )}
          </>
        )}
      </ScrollView>

      <BottomSheet visible={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <AppDetail
            app={selected}
            status={appSt[selected.id]}
            progress={Math.min(100, Math.round(progress[selected.id] || 0))}
            onAction={() => appAction(selected.id)}
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
      <AppText variant="displaySemibold" style={{ fontSize: 13.5 }}>
        {children}
      </AppText>
      {badge && (
        <View style={[styles.policyBadge, { backgroundColor: colors.primaryTint }]}>
          <AppText variant="bodyBold" color={colors.primaryStrong} style={{ fontSize: 10, letterSpacing: 0.3 }}>
            {badge}
          </AppText>
        </View>
      )}
    </View>
  );
}

function AppSection({
  apps,
  appSt,
  progress,
  appAction,
  onOpenDetail,
  last,
}: {
  apps: CatalogApp[];
  appSt: Record<string, AppInstallStatus>;
  progress: Record<string, number>;
  appAction: (id: string) => void;
  onOpenDetail: (app: CatalogApp) => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Card style={[styles.sectionCard, !last && { marginBottom: 18 }]} padded={false}>
      {apps.map((app, i) => {
        const status = appSt[app.id];
        const p = Math.min(100, Math.round(progress[app.id] || 0));
        return (
          <View
            key={app.id}
            style={[styles.appRow, i < apps.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}
          >
            {/* Info area and action button are siblings, not nested Pressables —
                nesting them would let a tap on "Install" bubble up and also
                trigger the row's open-detail handler. */}
            <Pressable
              onPress={() => {
                haptics.tap();
                onOpenDetail(app);
              }}
              android_ripple={ripple(colors.surfaceActive) ?? undefined}
              style={({ pressed }) => [styles.appRowInfo, pressed && { opacity: 0.6 }]}
            >
              <View style={styles.iconWrap}>
                <View style={[styles.tile, { backgroundColor: app.tile || colors.primary, borderColor: colors.borderStrong }]}>
                  <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 16 }}>
                    {app.init}
                  </AppText>
                </View>
                {status === 'installing' && (
                  <View style={styles.installOverlay}>
                    <ProgressRing size={48} progress={p} />
                    <View style={styles.installSquare} />
                  </View>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 13.5 }}>
                  {app.name}
                </AppText>
                <AppText variant="body" color={colors.muted2} numberOfLines={1} style={{ fontSize: 11.5, marginTop: 2 }}>
                  {app.pub} · {app.size} · Pushed {app.pushedDate}
                </AppText>
                {status === 'installing' && (
                  <AppText variant="bodySemibold" color={colors.primary} style={{ fontSize: 11, marginTop: 4 }}>
                    Installing · {p}%
                  </AppText>
                )}
              </View>
            </Pressable>
            <AppActionButton status={status} onPress={() => appAction(app.id)} />
          </View>
        );
      })}
    </Card>
  );
}

function AppActionButton({ status, onPress }: { status: AppInstallStatus; onPress: () => void }) {
  const { colors } = useTheme();
  if (status === 'available') return <Button label="Install" size="sm" onPress={onPress} style={{ width: ACTION_BTN_WIDTH }} />;
  if (status === 'update')
    return (
      <Button label="Update" size="sm" variant="secondary" onPress={onPress} style={{ width: ACTION_BTN_WIDTH, borderColor: colors.primary }} />
    );
  if (status === 'installed')
    return <Button label="Open" size="sm" variant="secondary" onPress={() => {}} style={{ width: ACTION_BTN_WIDTH }} />;
  if (status === 'restricted')
    return <Button label="Request" size="sm" variant="secondary" onPress={onPress} style={{ width: ACTION_BTN_WIDTH }} />;
  if (status === 'requested')
    return (
      <View style={[styles.requestedTag, { width: ACTION_BTN_WIDTH, backgroundColor: colors.amberTint }]}>
        <AppText variant="bodySemibold" color={colors.amberStrong} style={{ fontSize: 11.5 }}>
          Pending
        </AppText>
      </View>
    );
  return <View style={{ width: ACTION_BTN_WIDTH }} />; // installing — progress shown on the icon instead
}

function AppDetail({
  app,
  status,
  progress,
  onAction,
  onClose,
}: {
  app: CatalogApp;
  status: AppInstallStatus;
  progress: number;
  onAction: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View>
      <View style={styles.sheetHeader}>
        <View style={[styles.tile, { width: 60, height: 60, borderRadius: 16, backgroundColor: app.tile || colors.primary, borderColor: colors.borderStrong }]}>
          <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 20 }}>
            {app.init}
          </AppText>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="bodySemibold" numberOfLines={2} style={{ fontSize: 15.5 }}>
            {app.name}
          </AppText>
          <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }} numberOfLines={1}>
            {app.pub}
          </AppText>
        </View>
        <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceSunken }]}>
          <X size={14} color={colors.text3} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={[styles.statsRow, { borderTopColor: colors.hairline, borderBottomColor: colors.hairline }]}>
        <DetailStat value={app.version} label="Version" />
        <View style={[styles.statDivider, { backgroundColor: colors.hairline }]} />
        <DetailStat value={app.size} label="Size" />
        <View style={[styles.statDivider, { backgroundColor: colors.hairline }]} />
        <DetailStat value={app.pushedDate} label="Pushed" />
      </View>

      <View style={styles.sheetBody}>
        <AppText variant="body" color={colors.text2} style={{ fontSize: 13, lineHeight: 19 }}>
          {app.description}
        </AppText>
        <View style={styles.pushedByRow}>
          <UserCog size={13} color={colors.muted2} strokeWidth={2} />
          <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5 }}>
            Pushed by {ORG_NAME} IT
          </AppText>
        </View>

        <View style={{ marginTop: 20 }}>
          {status === 'installing' ? (
            <View style={styles.installingRow}>
              <ProgressRing size={22} progress={progress} />
              <AppText variant="bodySemibold" color={colors.primary} style={{ fontSize: 13 }}>
                Installing · {progress}%
              </AppText>
            </View>
          ) : status === 'requested' ? (
            <View style={[styles.pendingBanner, { backgroundColor: colors.amberTint }]}>
              <AppText variant="bodySemibold" color={colors.amberStrong} style={{ fontSize: 12.5 }}>
                Request sent — waiting on IT approval
              </AppText>
            </View>
          ) : (
            <Button
              label={
                status === 'available' ? 'Install' : status === 'update' ? 'Update' : status === 'installed' ? 'Open' : 'Request access'
              }
              onPress={() => {
                haptics.tap();
                onAction();
              }}
            />
          )}
          <View style={styles.footNote}>
            <Lock size={12} color={colors.muted2} strokeWidth={2.2} />
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, flex: 1, lineHeight: 16 }}>
              Installs are pushed through the managed catalog and logged for compliance.
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

function DetailStat({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailStat}>
      <View style={styles.detailStatValueRow}>
        {icon}
        <AppText variant="displaySemibold" style={{ fontSize: 14 }}>
          {value}
        </AppText>
      </View>
      <AppText variant="body" color={colors.muted2} style={{ fontSize: 10.5, marginTop: 2 }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 110 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    height: 42,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 13.5, fontFamily: 'Inter_400Regular', height: '100%' },
  updateBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  updateIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginHorizontal: 4 },
  policyBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  sectionCard: { overflow: 'hidden' },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  appRowInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 },
  iconWrap: { width: 48, height: 48, flexShrink: 0 },
  tile: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  installOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(9,12,18,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  installSquare: { width: 11, height: 11, borderRadius: 2, backgroundColor: '#FFFFFF' },
  requestedTag: { alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 9 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1 },
  statDivider: { width: 1, height: 30 },
  detailStat: { flex: 1, alignItems: 'center' },
  detailStatValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sheetBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  installingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', paddingVertical: 14 },
  pendingBanner: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  footNote: { flexDirection: 'row', gap: 6, marginTop: 14 },
  pushedByRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
});
