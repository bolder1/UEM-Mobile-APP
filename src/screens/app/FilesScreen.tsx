import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FileText,
  Sheet as SheetIcon,
  Image as ImageIcon,
  Play,
  X,
  Folder,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Check,
  Search,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { BottomSheet } from '../../components/BottomSheet';
import { SearchField } from '../../components/SearchField';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ListRow } from '../../components/ListRow';
import { IconTile } from '../../components/IconTile';
import { IconButton } from '../../components/IconButton';
import { InfoNote } from '../../components/InfoNote';
import { EmptyState } from '../../components/EmptyState';
import { useNavigation } from '@react-navigation/native';
import { useAppStore, ORG_NAME } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { Entrance, PressableScale, CountUp } from '../../components/Motion';
import { FILE_NODES, TYPE_LABELS, DRIVE_LABELS } from '../../data/mockData';
import { FileNode, DriveId, FileType } from '../../types';
import { radii } from '../../theme/platform';
import { space, layout, touch, control } from '../../theme/spacing';
import { type as typeScale } from '../../theme/typography';

// Matches ScreenHeader's own nav button, so the two controls flanking the title
// are the same box. Sub-44 by design — the slop below carries the target.
const FILTER_BOX = 38;
const FILTER_DOT = 10;
// Storage meter thickness. Not a gap, so not on the spacing grid.
const BAR = 6;
// The crumb "back one folder" button rides the system's `sm` control height.
const CRUMB_BACK = control.height.sm;

const DRIVES: { id: DriveId; label: string }[] = [
  { id: 'my', label: 'My Drive' },
  { id: 'team', label: 'Team Drive' },
  { id: 'shared', label: 'Shared with me' },
];

const TYPE_FILTERS: { id: FileType; label: string }[] = [
  { id: 'doc', label: 'Docs' },
  { id: 'sheet', label: 'Sheets' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'img', label: 'Images' },
  { id: 'vid', label: 'Videos' },
];

const SORTS: { id: 'name' | 'date' | 'size'; label: string }[] = [
  { id: 'date', label: 'Date modified' },
  { id: 'name', label: 'Name (A–Z)' },
  { id: 'size', label: 'Size' },
];

function sizeToKb(size?: string) {
  if (!size) return 0;
  const m = size.match(/([\d.]+)\s*(KB|MB)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2].toUpperCase() === 'MB' ? n * 1024 : n;
}

function fileIcon(kind: string, color: string) {
  switch (kind) {
    case 'pdf':
    case 'doc':
      return <FileText size={control.icon.lg} color={color} strokeWidth={2} />;
    case 'sheet':
      return <SheetIcon size={control.icon.lg} color={color} strokeWidth={2} />;
    case 'img':
      return <ImageIcon size={control.icon.lg} color={color} strokeWidth={2} />;
    case 'vid':
      return <Play size={control.icon.lg} color={color} strokeWidth={2} fill={color} />;
    default:
      return <FileText size={control.icon.lg} color={color} strokeWidth={2} />;
  }
}

function breadcrumbTrail(drive: DriveId, folderId: string | null): FileNode[] {
  const trail: FileNode[] = [];
  let cursor = folderId;
  while (cursor) {
    const node = FILE_NODES.find((n) => n.id === cursor && n.drive === drive);
    if (!node) break;
    trail.unshift(node);
    cursor = node.parentId;
  }
  return trail;
}

export function FilesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const drive = useAppStore((s) => s.drive);
  const currentFolderId = useAppStore((s) => s.currentFolderId);
  const setDrive = useAppStore((s) => s.setDrive);
  const openFolder = useAppStore((s) => s.openFolder);
  const goToFolder = useAppStore((s) => s.goToFolder);
  const [selected, setSelected] = useState<FileNode | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [q, setQ] = useState('');
  const [activeTypes, setActiveTypes] = useState<Set<FileType>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');

  const trail = useMemo(() => breadcrumbTrail(drive, currentFolderId), [drive, currentFolderId]);

  const children = useMemo(
    () => FILE_NODES.filter((n) => n.drive === drive && n.parentId === currentFolderId),
    [drive, currentFolderId],
  );
  const query = q.trim().toLowerCase();
  const folders = children.filter((n) => n.kind === 'folder' && (!query || n.name.toLowerCase().includes(query)));
  const files = useMemo(() => {
    let list = children.filter((n) => n.kind === 'file');
    if (query) list = list.filter((f) => f.name.toLowerCase().includes(query));
    if (activeTypes.size > 0) list = list.filter((f) => f.type && activeTypes.has(f.type));
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return sizeToKb(b.size) - sizeToKb(a.size);
      return 0; // 'date' — mock data is already newest-first per folder
    });
    return list;
  }, [children, activeTypes, sortBy, query]);

  const filterCount = activeTypes.size + (sortBy !== 'date' ? 1 : 0);

  const toggleType = (t: FileType) => {
    haptics.select();
    setActiveTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <Entrance delay={0}>
        <View style={styles.header}>
          <ScreenHeader
            title="Files"
            size="display"
            onBack={() => navigation.goBack()}
            right={
              <PressableScale
                onPress={() => setFilterOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Filter and sort"
                hitSlop={touch.slopFor(FILTER_BOX)}
                style={[styles.filterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <SlidersHorizontal size={17} color={colors.text2} strokeWidth={2.1} />
                {filterCount > 0 && (
                  <View style={[styles.filterDot, { backgroundColor: colors.primary, borderColor: colors.bg }]} />
                )}
              </PressableScale>
            }
          />
        </View>
      </Entrance>

      <Entrance delay={80} style={styles.searchWrap}>
        <SearchField value={q} onChangeText={setQ} placeholder="Search work files" label="files" />
      </Entrance>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + layout.screenBottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <Entrance delay={160}>
          <Card style={styles.storageCard}>
            <View style={styles.storageTop}>
              <View style={styles.storageLabel}>
                <FileText size={control.icon.sm} color={colors.text3} strokeWidth={2} />
                <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.microLabel}>
                  Work storage
                </AppText>
              </View>
              <AppText variant="body" size="caption" color={colors.muted2}>
                12.4 GB of 20 GB
              </AppText>
            </View>
            <View style={[styles.barTrack, { backgroundColor: colors.surfaceSunken }]}>
              <View style={[styles.barFill, { backgroundColor: colors.primary, width: '62%' }]} />
            </View>
          </Card>
        </Entrance>

        <Entrance delay={240}>
          <Breadcrumbs drive={drive} trail={trail} onNavigate={goToFolder} onSwitchDrive={() => setFilterOpen(true)} />
        </Entrance>

        {folders.length > 0 && (
          <View style={styles.folderGrid}>
            {folders.map((f, index) => (
              <Entrance key={f.id} delay={300 + Math.min(index, 7) * 55}>
                <CountUp value={f.itemCount ?? 0}>
                  {(d) => (
                    <PressableScale
                      onPress={() => openFolder(f.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Open folder ${f.name}`}
                    >
                      <Card padded={false} style={styles.folderTile}>
                        <ListRow
                          icon={
                            <IconTile bg={colors.surfaceSunken}>
                              <Folder size={control.icon.lg} color={colors.text3} strokeWidth={2} />
                            </IconTile>
                          }
                          label={f.name}
                          sub={`${d} items`}
                          showChevron={false}
                          right={<ChevronRight size={control.icon.sm} color={colors.faint} strokeWidth={2.2} />}
                        />
                      </Card>
                    </PressableScale>
                  )}
                </CountUp>
              </Entrance>
            ))}
          </View>
        )}

        <Card style={styles.listCard} padded={false}>
          {files.map((item, index) => (
            <Entrance key={item.id} delay={Math.min(index, 7) * 55}>
              <PressableScale
                onPress={() => setSelected(item)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.name}`}
              >
                <ListRow
                  icon={
                    <IconTile bg={colors.surfaceSunken}>{fileIcon(item.type!, colors.text3)}</IconTile>
                  }
                  label={item.name}
                  sub={`${item.size} · ${item.date}`}
                  showChevron={false}
                  bordered={index < files.length - 1}
                />
              </PressableScale>
            </Entrance>
          ))}
          {files.length === 0 && folders.length === 0 && (
            <EmptyState
              compact
              icon={
                query ? (
                  <Search size={22} color={colors.muted} strokeWidth={2} />
                ) : (
                  <Folder size={22} color={colors.muted} strokeWidth={2} />
                )
              }
              title={query ? `No files match “${q}”.` : 'This folder is empty.'}
            />
          )}
        </Card>
      </ScrollView>

      <BottomSheet visible={!!selected} onClose={() => setSelected(null)} accessibilityLabel="File details">
        {selected && (
          <>
            <View style={styles.sheetHeader}>
              <IconTile bg={colors.surfaceSunken} size={control.avatar}>
                {fileIcon(selected.type!, colors.text3)}
              </IconTile>
              <View style={styles.sheetTitleCol}>
                <AppText variant="bodySemibold" size="body" numberOfLines={1}>
                  {selected.name}
                </AppText>
                <AppText variant="body" size="caption" color={colors.muted}>
                  {TYPE_LABELS[selected.type!]}
                </AppText>
              </View>
              <IconButton
                icon={<X size={control.icon.md} color={colors.text3} strokeWidth={2.4} />}
                onPress={() => setSelected(null)}
                accessibilityLabel="Close"
                variant="neutral"
                size={control.height.sm}
              />
            </View>
            <View style={[styles.sheetBody, { borderTopColor: colors.hairline }]}>
              <SheetRow label="Size" value={selected.size ?? '—'} borderColor={colors.hairline2} />
              <SheetRow label="Modified" value={`${selected.date}, 2026`} borderColor={colors.hairline2} />
              <SheetRow
                label="Location"
                value={
                  trail.length > 0
                    ? `${DRIVE_LABELS[selected.drive]} / ${trail.map((t) => t.name).join(' / ')}`
                    : DRIVE_LABELS[selected.drive]
                }
                last
              />
              <InfoNote text={`Downloading to personal storage is disabled by ${ORG_NAME} policy.`} />
            </View>
          </>
        )}
      </BottomSheet>

      <BottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        maxHeightPct={80}
        accessibilityLabel="Filter and sort"
      >
        <View style={styles.filterHeader}>
          <AppText variant="displaySemibold" size="callout">
            Filter &amp; sort
          </AppText>
          <Pressable
            onPress={() => {
              haptics.tap();
              setActiveTypes(new Set());
              setSortBy('date');
            }}
            accessibilityRole="button"
            accessibilityLabel="Clear all"
            hitSlop={touch.slopFor(typeScale.footnote.lineHeight)}
          >
            <AppText variant="bodySemibold" size="footnote" color={colors.primary}>
              Clear all
            </AppText>
          </Pressable>
        </View>

        <ScrollView style={styles.filterScroll} contentContainerStyle={styles.filterBody} showsVerticalScrollIndicator={false}>
          <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.filterSectionLabel}>
            Drive
          </AppText>
          <View style={styles.filterChipRow}>
            {DRIVES.map((d) => (
              <Chip
                key={d.id}
                label={d.label}
                active={drive === d.id}
                onPress={() => setDrive(d.id)}
                icon={
                  drive === d.id ? <Check size={control.icon.sm} color={colors.white} strokeWidth={2.8} /> : undefined
                }
              />
            ))}
          </View>

          <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.filterSectionLabel}>
            File type
          </AppText>
          <View style={styles.filterChipRow}>
            {TYPE_FILTERS.map((t) => (
              <Chip
                key={t.id}
                label={t.label}
                active={activeTypes.has(t.id)}
                onPress={() => toggleType(t.id)}
                icon={
                  activeTypes.has(t.id) ? (
                    <Check size={control.icon.sm} color={colors.white} strokeWidth={2.8} />
                  ) : undefined
                }
              />
            ))}
          </View>

          <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.filterSectionLabel}>
            Sort by
          </AppText>
          <Card padded={false} style={styles.sortCard}>
            {SORTS.map((s, i) => (
              <ListRow
                key={s.id}
                label={s.label}
                onPress={() => {
                  haptics.select();
                  setSortBy(s.id);
                }}
                showChevron={false}
                bordered={i < SORTS.length - 1}
                accessibilityState={{ selected: sortBy === s.id }}
                right={
                  sortBy === s.id ? <Check size={control.icon.md} color={colors.primary} strokeWidth={2.6} /> : undefined
                }
              />
            ))}
          </Card>
        </ScrollView>

        <View style={[styles.filterFooter, { borderTopColor: colors.hairline }]}>
          <Button label="Apply" onPress={() => setFilterOpen(false)} />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function Breadcrumbs({
  drive,
  trail,
  onNavigate,
  onSwitchDrive,
}: {
  drive: DriveId;
  trail: FileNode[];
  onNavigate: (id: string | null) => void;
  onSwitchDrive: () => void;
}) {
  const { colors } = useTheme();

  if (trail.length === 0) {
    // At the drive root there's no folder to step back from — tapping the
    // drive name opens the filter sheet, which is now where drive switching
    // lives since the old chip row was removed.
    return (
      <PressableScale
        onPress={onSwitchDrive}
        // The crumb is one line of footnote, so the slop is derived from the
        // ramp's own lineHeight rather than guessed: 18 + 2*13 = 44.
        hitSlop={touch.slopFor(typeScale.footnote.lineHeight)}
        accessibilityRole="button"
        accessibilityLabel={`Switch drive, current ${DRIVE_LABELS[drive]}`}
        // alignSelf has to reach the touchable, not the view it wraps — on
        // `style` the Pressable still stretched the full width, so a tap
        // anywhere on this row opened the drive switcher.
        containerStyle={styles.rootCrumbWrap}
        style={styles.rootCrumb}
      >
        <AppText variant="bodySemibold" size="footnote">
          {DRIVE_LABELS[drive]}
        </AppText>
        <ChevronRight size={control.icon.sm} color={colors.faint} strokeWidth={2.4} />
      </PressableScale>
    );
  }

  return (
    <View style={styles.crumbRow}>
      <PressableScale
        onPress={() => onNavigate(trail.length >= 2 ? trail[trail.length - 2].id : null)}
        hitSlop={touch.slopFor(CRUMB_BACK)}
        accessibilityRole="button"
        accessibilityLabel="Back one folder"
        style={[styles.crumbBack, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        <ChevronLeft size={15} color={colors.text2} strokeWidth={2.4} />
      </PressableScale>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.crumbScroll}>
        <Pressable
          onPress={() => onNavigate(null)}
          accessibilityRole="button"
          accessibilityLabel={`Go to ${DRIVE_LABELS[drive]}`}
          hitSlop={touch.slopFor(typeScale.caption.lineHeight)}
        >
          <AppText variant="bodySemibold" size="caption" color={colors.muted}>
            {DRIVE_LABELS[drive]}
          </AppText>
        </Pressable>
        {trail.map((node, i) => {
          const isLast = i === trail.length - 1;
          return (
            <View key={node.id} style={styles.crumbSeg}>
              <AppText variant="body" size="caption" color={colors.faint} style={styles.crumbSlash}>
                /
              </AppText>
              <Pressable
                onPress={() => onNavigate(node.id)}
                disabled={isLast}
                accessibilityRole="button"
                accessibilityLabel={`Go to folder ${node.name}`}
                accessibilityState={{ disabled: isLast }}
                hitSlop={touch.slopFor(typeScale.caption.lineHeight)}
              >
                <AppText variant="bodySemibold" size="caption" color={isLast ? colors.text : colors.muted}>
                  {node.name}
                </AppText>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function SheetRow({ label, value, borderColor, last }: { label: string; value: string; borderColor?: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.sheetRow, !last && { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
      <AppText variant="body" size="footnote" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="bodySemibold" size="footnote" numberOfLines={1} style={styles.sheetRowValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: layout.gutter, paddingTop: layout.screenTop },
  filterBtn: {
    width: FILTER_BOX,
    height: FILTER_BOX,
    borderRadius: radii.tile,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute',
    top: -space[1],
    right: -space[1],
    width: FILTER_DOT,
    height: FILTER_DOT,
    borderRadius: FILTER_DOT / 2,
    borderWidth: 2,
  },
  searchWrap: { paddingHorizontal: layout.gutter, paddingBottom: layout.blockGap },
  scroll: { paddingHorizontal: layout.gutter },
  storageCard: { marginBottom: layout.blockGap },
  storageTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: layout.labelGap },
  storageLabel: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  microLabel: { letterSpacing: 1, textTransform: 'uppercase' },
  barTrack: { height: BAR, borderRadius: BAR / 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: BAR / 2 },
  rootCrumbWrap: { alignSelf: 'flex-start', marginBottom: layout.blockGap },
  rootCrumb: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  crumbRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginBottom: layout.blockGap },
  crumbScroll: { flex: 1 },
  crumbBack: {
    width: CRUMB_BACK,
    height: CRUMB_BACK,
    borderRadius: radii.tile,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crumbSeg: { flexDirection: 'row', alignItems: 'center' },
  crumbSlash: { marginHorizontal: space[1] },
  folderGrid: { gap: layout.cardGap, marginBottom: layout.blockGap },
  folderTile: { overflow: 'hidden' },
  listCard: { overflow: 'hidden' },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: layout.sheetPad,
    paddingBottom: layout.cardGap,
    paddingTop: space[2],
  },
  sheetTitleCol: { flex: 1, minWidth: 0, gap: layout.captionGap },
  // The sheet's own bottom pad now comes from BottomSheet (inset + screenBottom).
  sheetBody: { borderTopWidth: 1, paddingHorizontal: layout.sheetPad },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: layout.rowPadV },
  sheetRowValue: { flexShrink: 1, textAlign: 'right', marginLeft: space[3] },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.sheetPad,
    paddingBottom: layout.blockGap,
  },
  filterScroll: { maxHeight: 440 },
  filterBody: { paddingHorizontal: layout.sheetPad, paddingBottom: layout.cardGap },
  filterSectionLabel: { letterSpacing: 1, textTransform: 'uppercase', marginBottom: layout.labelGap },
  filterChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginBottom: layout.sectionGap },
  sortCard: { overflow: 'hidden', marginBottom: space[2] },
  filterFooter: { paddingHorizontal: layout.sheetPad, paddingTop: layout.cardGap, borderTopWidth: 1 },
});
