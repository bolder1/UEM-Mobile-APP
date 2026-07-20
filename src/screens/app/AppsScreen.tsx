import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, RefreshCw, X, Lock, UserCog, Download, Check, Clock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { AuditLine } from '../../components/AuditLine';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { IconTile } from '../../components/IconTile';
import { ListRow } from '../../components/ListRow';
import { SearchField } from '../../components/SearchField';
import { EmptyState } from '../../components/EmptyState';
import { InfoNote } from '../../components/InfoNote';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ProgressRing } from '../../components/ProgressRing';
import { BottomSheet } from '../../components/BottomSheet';
import { useAppStore, ORG_NAME, findAudit } from '../../state/store';
import { navigate } from '../../navigation/navigationRef';
import { haptics } from '../../utils/haptics';
import { APPS } from '../../data/mockData';
import { AppInstallStatus, CatalogApp } from '../../types';
import { Entrance, CountUp } from '../../components/Motion';
import { FilterChips, FilterOption } from '../../components/FilterChips';
import { space, layout, control, touch } from '../../theme/spacing';
import { radii } from '../../theme/platform';

// Every action button — Install / Update / Open / Request / Pending — shares
// this footprint so the trailing edge of every row lines up, the way the
// Play Store / App Store keep their action buttons a fixed width regardless
// of label length.
const ACTION_BTN_WIDTH = 84;

// The install overlay washes out an arbitrary brand-coloured app tile, so it
// can't be a theme surface token: it has to stay a fixed dark scrim in both
// themes or the white ProgressRing drawn on top of it loses its contrast.
// This belongs in theme/colors as a `scrim` token — BottomSheet hardcodes its
// own backdrop the same way — but that file is outside this migration's scope.
const TILE_SCRIM = 'rgba(9,12,18,0.58)';

type AppFilter = 'all' | 'updates' | 'installed' | 'notInstalled';

/** 'installing' deliberately counts as installed-in-progress so a row doesn't
 *  jump out of the list mid-install under the Installed filter. */
function matchesFilter(status: AppInstallStatus | undefined, filter: AppFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'updates') return status === 'update';
  if (filter === 'installed') return status === 'installed' || status === 'installing';
  return status === 'available' || status === 'restricted' || status === 'requested';
}

/** The row's trailing slot carries status for the three states that have no
 *  button (installed / requested / installing), so that meaning has to be
 *  folded into the row's own label — see AppActionButton. */
function rowLabel(app: CatalogApp, status: AppInstallStatus, progress: number): string {
  const meta = `${app.size} · ${app.pushedDate}`;
  if (status === 'installing') return `${app.name}. ${meta}. Installing, ${progress}%.`;
  if (status === 'installed') return `${app.name}. ${meta}. Installed.`;
  if (status === 'requested') return `${app.name}. ${meta}. Requested, waiting on IT approval.`;
  return `${app.name}. ${meta}.`;
}

export function AppsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const appSt = useAppStore((s) => s.appSt);
  const progress = useAppStore((s) => s.progress);
  const appAction = useAppStore((s) => s.appAction);
  const setDrawer = useAppStore((s) => s.setDrawer);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AppFilter>('all');
  const [selected, setSelected] = useState<CatalogApp | null>(null);

  const q = query.trim().toLowerCase();
  const searched = q ? APPS.filter((a) => a.name.toLowerCase().includes(q) || a.pub.toLowerCase().includes(q)) : APPS;
  const filtered = searched.filter((a) => matchesFilter(appSt[a.id], filter));

  const reqApps = filtered.filter((a) => a.section === 'req');
  const optionalApps = filtered.filter((a) => a.section === 'optional');
  const availApps = filtered.filter((a) => a.section === 'avail');
  const updatesCount = APPS.filter((a) => appSt[a.id] === 'update').length;
  const installedCount = APPS.filter((a) => appSt[a.id] === 'installed').length;
  const nothingShown = reqApps.length === 0 && optionalApps.length === 0 && availApps.length === 0;
  const noResults = (q.length > 0 || filter !== 'all') && nothingShown;

  // Counts live in the labels so the filter doubles as a read-out of the
  // catalog — you can see there's 1 update without switching to it.
  const filterOptions: FilterOption[] = [
    { key: 'all', label: `All · ${APPS.length}` },
    ...(updatesCount > 0 ? [{ key: 'updates', label: `Updates · ${updatesCount}` }] : []),
    { key: 'installed', label: `Installed · ${installedCount}` },
    { key: 'notInstalled', label: 'Not installed' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + layout.screenTop }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          // There is no tab bar to clear — MainTabNavigator renders
          // `tabBar={() => null}` — so the only thing under this list is the
          // home indicator.
          paddingBottom: insets.bottom + layout.screenBottom,
        }}
      >
        <ScreenHeader
          title="Apps"
          sub={`Company catalog · curated by ${ORG_NAME} IT`}
          size="display"
          onMenu={() => {
            haptics.tap();
            setDrawer(true);
          }}
        />

        <View style={{ marginBottom: layout.cardGap }}>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search apps" label="apps" />
        </View>

        <View style={styles.filterRow}>
          <FilterChips options={filterOptions} value={filter} onChange={(k) => setFilter(k as AppFilter)} />
        </View>

        {!q && filter === 'all' && updatesCount > 0 && (
          <Entrance>
            <Card style={styles.updateBanner}>
              <IconTile bg={colors.primaryTint}>
                <RefreshCw size={control.icon.lg} color={colors.primary} strokeWidth={2} />
              </IconTile>
              <View style={{ flex: 1 }}>
                <AppText variant="bodySemibold" size="footnote">
                  Updates available
                </AppText>
                <AppText variant="body" size="caption" color={colors.muted} style={{ marginTop: layout.captionGap }}>
                  <CountUp value={updatesCount}>
                    {(d) => (
                      <AppText variant="body" size="caption" color={colors.muted}>
                        {d}
                      </AppText>
                    )}
                  </CountUp>
                  {' '}{updatesCount === 1 ? 'app needs' : 'apps need'} updating
                </AppText>
              </View>
              <Button
                label="Update all"
                size="sm"
                onPress={() => APPS.forEach((a) => appSt[a.id] === 'update' && appAction(a.id))}
                style={{ width: ACTION_BTN_WIDTH }}
              />
            </Card>
          </Entrance>
        )}

        {noResults ? (
          <EmptyState
            icon={<Search size={22} color={colors.muted} strokeWidth={2} />}
            title={q.length > 0 ? `No apps match “${query}”` : 'Nothing in this filter'}
          />
        ) : (
          <>
            {reqApps.length > 0 && (
              <Entrance delay={0}>
                <SectionTitle badge="POLICY">Required</SectionTitle>
                <AppSection apps={reqApps} appSt={appSt} progress={progress} appAction={appAction} onOpenDetail={setSelected} />
              </Entrance>
            )}
            {optionalApps.length > 0 && (
              <Entrance delay={80}>
                {/* Was "Featured". PRODUCT.md: not an app store, no editor's
                    picks — IT does not "feature" anything. The three sections
                    are a policy ladder: IT requires it · you may install it ·
                    you must ask first. */}
                <SectionTitle>Optional</SectionTitle>
                <AppSection apps={optionalApps} appSt={appSt} progress={progress} appAction={appAction} onOpenDetail={setSelected} />
              </Entrance>
            )}
            {availApps.length > 0 && (
              <Entrance delay={160}>
                <SectionTitle>Available on request</SectionTitle>
                <AppSection apps={availApps} appSt={appSt} progress={progress} appAction={appAction} onOpenDetail={setSelected} last />
              </Entrance>
            )}
          </>
        )}
      </ScrollView>

      <BottomSheet visible={!!selected} onClose={() => setSelected(null)} accessibilityLabel="App details">
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
    </View>
  );
}

function SectionTitle({ children, badge }: { children: React.ReactNode; badge?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionTitleRow}>
      <AppText variant="bodyBold" size="micro" color={colors.muted2} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
        {children}
      </AppText>
      {badge && (
        <View style={[styles.policyBadge, { backgroundColor: colors.primaryTint }]}>
          <AppText variant="bodyBold" size="micro" color={colors.primaryStrong} style={{ letterSpacing: 0.3 }}>
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
    <Card style={[styles.sectionCard, !last && { marginBottom: layout.sectionGap }]} padded={false}>
      {apps.map((app, i) => {
        const status = appSt[app.id];
        const p = Math.min(100, Math.round(progress[app.id] || 0));
        return (
          <ListRow
            key={app.id}
            icon={
              <View style={styles.iconWrap}>
                <IconTile bg={app.tile || colors.primary}>
                  <AppText variant="displaySemibold" size="callout" color={colors.white}>
                    {app.init}
                  </AppText>
                </IconTile>
                {status === 'installing' && (
                  <View style={[styles.installOverlay, { backgroundColor: TILE_SCRIM }]}>
                    <ProgressRing size={control.tile} progress={p} />
                    {/* Absolute so it sits INSIDE the ring. As a flow child it
                        stacked below the ring and overflowed the tile. */}
                    <View style={[styles.installSquare, { backgroundColor: colors.white }]} />
                  </View>
                )}
              </View>
            }
            label={app.name}
            // Publisher lives in the detail sheet, not here: it was the longest
            // and least actionable part of the row, so it was what got cut — an
            // ellipsised name tells you nothing. Size + push date always fit, and
            // the icon carries "pushed by IT" without spending the width. While a
            // row is installing, the live percentage is the only thing worth the
            // line — the ring on the tile is decorative, this is what a screen
            // reader can actually read.
            sub={status === 'installing' ? `Installing · ${p}%` : `${app.size} · ${app.pushedDate}`}
            onPress={() => onOpenDetail(app)}
            showChevron={false}
            bordered={i < apps.length - 1}
            accessibilityLabel={rowLabel(app, status, p)}
            accessibilityHint="Opens app details"
            // The row opens details AND carries its own Install/Update button —
            // two actions, so two a11y nodes. Without this the row's Pressable
            // wraps the button (a button inside a button) and iOS collapses them
            // into one node, leaving Install unreachable by VoiceOver.
            rightInteractive
            right={<AppActionButton status={status} name={app.name} onPress={() => appAction(app.id)} />}
          />
        );
      })}
    </Card>
  );
}

function AppActionButton({ status, name, onPress }: { status: AppInstallStatus; name: string; onPress: () => void }) {
  const { colors } = useTheme();
  if (status === 'available')
    return (
      <IconButton
        variant="primary"
        onPress={onPress}
        accessibilityLabel={`Install ${name}`}
        icon={<Download size={19} color={colors.white} strokeWidth={2.2} />}
      />
    );
  if (status === 'update')
    return (
      <IconButton
        variant="tinted"
        onPress={onPress}
        accessibilityLabel={`Update ${name}`}
        icon={<RefreshCw size={18} color={colors.primary} strokeWidth={2.2} />}
      />
    );
  if (status === 'restricted')
    return (
      <IconButton
        variant="neutral"
        onPress={onPress}
        accessibilityLabel={`Request access to ${name}`}
        icon={<Lock size={17} color={colors.text3} strokeWidth={2.2} />}
      />
    );
  // The states with no action are pure status. They used to be their own a11y
  // nodes, but inside a ListRow the row is the accessibility element, so a
  // nested node is unreachable — `rowLabel` speaks for these instead and the
  // pill stays decorative.
  if (status === 'requested')
    return (
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.statusSlot, { backgroundColor: colors.amberTint }]}
      >
        <Clock size={18} color={colors.amber} strokeWidth={2.2} />
      </View>
    );
  if (status === 'installed')
    return (
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.statusSlot, { backgroundColor: colors.successTint }]}
      >
        <Check size={19} color={colors.success} strokeWidth={2.6} />
      </View>
    );
  return <View style={styles.statusSlot} />; // installing — progress shown on the tile instead
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
  const activity = useAppStore((s) => s.activity);
  const installAudit = findAudit(activity, 'app', [`Installed ${app.name}`, `Updated ${app.name}`]);
  return (
    <View>
      <View style={styles.sheetHeader}>
        <IconTile size={space[14]} radius={radii.card} bg={app.tile || colors.primary}>
          <AppText variant="displaySemibold" size="title" color={colors.white}>
            {app.init}
          </AppText>
        </IconTile>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="bodySemibold" size="callout" numberOfLines={2}>
            {app.name}
          </AppText>
          <AppText
            variant="body"
            size="caption"
            color={colors.muted}
            style={{ marginTop: layout.captionGap }}
            numberOfLines={1}
          >
            {app.pub}
          </AppText>
        </View>
        <IconButton
          icon={<X size={control.icon.md} color={colors.text3} strokeWidth={2.4} />}
          onPress={onClose}
          accessibilityLabel="Close"
          variant="neutral"
          size={36}
        />
      </View>

      <View style={[styles.statsRow, { borderTopColor: colors.hairline, borderBottomColor: colors.hairline }]}>
        <DetailStat value={app.version} label="Version" />
        <View style={[styles.statDivider, { backgroundColor: colors.hairline }]} />
        <DetailStat value={app.size} label="Size" />
        <View style={[styles.statDivider, { backgroundColor: colors.hairline }]} />
        <DetailStat value={app.pushedDate} label="Pushed" />
      </View>

      <View style={styles.sheetBody}>
        <AppText variant="body" size="footnote" color={colors.text2}>
          {app.description}
        </AppText>
        <View style={styles.pushedByRow}>
          <UserCog size={control.icon.sm} color={colors.muted2} strokeWidth={2} />
          <AppText variant="body" size="caption" color={colors.muted2}>
            Pushed by {ORG_NAME} IT
          </AppText>
        </View>

        <View style={{ marginTop: layout.sectionGap }}>
          {status === 'installing' ? (
            <View style={styles.installingRow}>
              {/* ProgressRing defaults to a white ring on a white track — correct
                  over the row tile's dark scrim, invisible on this sheet. */}
              <ProgressRing
                size={space[6]}
                progress={progress}
                color={colors.primary}
                trackColor={colors.surfaceSunken}
              />
              <AppText variant="bodySemibold" size="footnote" color={colors.primary}>
                Installing · {progress}%
              </AppText>
            </View>
          ) : status === 'requested' ? (
            <View style={[styles.pendingBanner, { backgroundColor: colors.amberTint }]}>
              <AppText variant="bodySemibold" size="caption" color={colors.amberStrong}>
                Request sent — waiting on IT approval
              </AppText>
            </View>
          ) : status === 'installed' ? (
            <View>
              <View style={styles.installedRow}>
                <Check size={control.icon.md} color={colors.success} strokeWidth={2.6} />
                <AppText variant="bodySemibold" size="footnote" color={colors.success}>
                  Installed on this device
                </AppText>
              </View>
              {/* "Installed" persists long after its 4.5s toast is gone. The
                  line reads the real Activity entry, so an app IT pushed on
                  Jun 18 says so instead of claiming you did it just now. */}
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
          ) : (
            <Button
              label={status === 'available' ? 'Install' : status === 'update' ? 'Update' : 'Request access'}
              onPress={() => {
                haptics.tap();
                onAction();
              }}
            />
          )}
          <InfoNote text="Installs are pushed through the managed catalog and logged for compliance." />
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
        <AppText variant="displaySemibold" size="body">
          {value}
        </AppText>
      </View>
      <AppText variant="body" size="micro" color={colors.muted2} style={{ marginTop: layout.captionGap }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  updateBanner: { flexDirection: 'row', alignItems: 'center', gap: layout.rowGap, marginBottom: layout.blockGap },
  filterRow: { marginBottom: layout.blockGap },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: layout.labelGap },
  policyBadge: { borderRadius: space[2], paddingHorizontal: space[2], paddingVertical: space[1] },
  sectionCard: { overflow: 'hidden' },
  iconWrap: { width: control.tile, height: control.tile, flexShrink: 0 },
  installOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  installSquare: { position: 'absolute', width: space[3], height: space[3], borderRadius: 2 },
  statusSlot: {
    width: touch.min,
    height: touch.min,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: layout.sheetPad,
    paddingBottom: layout.cardGap,
    paddingTop: space[2],
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: layout.blockGap, borderTopWidth: 1, borderBottomWidth: 1 },
  statDivider: { width: 1, height: space[8] },
  detailStat: { flex: 1, alignItems: 'center' },
  detailStatValueRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  // No paddingBottom: BottomSheet owns the trailing pad + the home indicator.
  sheetBody: { paddingHorizontal: layout.sheetPad, paddingTop: layout.blockGap },
  pushedByRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: layout.labelGap },
  // The four action states share the Button's `lg` footprint so the sheet
  // doesn't resize as an app moves between them.
  installingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: layout.rowGap,
    minHeight: control.height.lg,
  },
  pendingBanner: {
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[4],
    minHeight: control.height.lg,
  },
  installedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    minHeight: control.height.lg,
  },
  auditWrap: { alignItems: 'center' },
});
