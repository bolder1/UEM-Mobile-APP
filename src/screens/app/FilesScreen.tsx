import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Sheet as SheetIcon,
  Image as ImageIcon,
  Play,
  Lock,
  X,
  Folder,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { BottomSheet } from '../../components/BottomSheet';
import { SearchField } from '../../components/SearchField';
import { useNavigation } from '@react-navigation/native';
import { useAppStore, ORG_NAME } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { FILE_NODES, TYPE_LABELS, DRIVE_LABELS } from '../../data/mockData';
import { FileNode, DriveId, FileType } from '../../types';
import { ripple } from '../../theme/platform';

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

function fileIcon(type: string, color: string) {
  switch (type) {
    case 'pdf':
    case 'doc':
      return <FileText size={18} color={color} strokeWidth={2} />;
    case 'sheet':
      return <SheetIcon size={18} color={color} strokeWidth={2} />;
    case 'img':
      return <ImageIcon size={18} color={color} strokeWidth={2} />;
    case 'vid':
      return <Play size={18} color={color} strokeWidth={2} fill={color} />;
    default:
      return <FileText size={18} color={color} strokeWidth={2} />;
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
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back" style={styles.backBtn}>
            <ChevronLeft size={22} color={colors.text2} strokeWidth={2.2} />
          </Pressable>
          <AppText variant="display" style={{ fontSize: 22 }}>
            Files
          </AppText>
        </View>
        <Pressable
          onPress={() => {
            haptics.tap();
            setFilterOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Filter and sort"
          android_ripple={ripple(colors.surfaceActive, true) ?? undefined}
          style={[styles.filterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <SlidersHorizontal size={17} color={colors.text2} strokeWidth={2.1} />
          {filterCount > 0 && <View style={[styles.filterDot, { backgroundColor: colors.primary, borderColor: colors.bg }]} />}
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        <SearchField value={q} onChangeText={setQ} placeholder="Search work files" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <Card style={styles.storageCard}>
          <View style={styles.storageTop}>
            <View style={styles.storageLabel}>
              <FileText size={14} color={colors.text3} strokeWidth={2} />
              <AppText variant="bodySemibold" color={colors.text2} style={{ fontSize: 12.5 }}>
                Work storage
              </AppText>
            </View>
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5 }}>
              12.4 GB of 20 GB
            </AppText>
          </View>
          <View style={[styles.barTrack, { backgroundColor: colors.surfaceSunken }]}>
            <View style={[styles.barFill, { backgroundColor: colors.primary, width: '62%' }]} />
          </View>
        </Card>

        <Breadcrumbs drive={drive} trail={trail} onNavigate={goToFolder} onSwitchDrive={() => setFilterOpen(true)} />

        {folders.length > 0 && (
          <View style={styles.folderGrid}>
            {folders.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => {
                  haptics.tap();
                  openFolder(f.id);
                }}
                android_ripple={ripple(colors.surfaceActive) ?? undefined}
                style={({ pressed }) => [
                  styles.folderTile,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { backgroundColor: colors.surfaceActive },
                ]}
              >
                <View style={[styles.folderIcon, { backgroundColor: colors.surfaceSunken }]}>
                  <Folder size={20} color={colors.text3} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 13 }}>
                    {f.name}
                  </AppText>
                  <AppText variant="body" color={colors.muted2} style={{ fontSize: 11 }}>
                    {f.itemCount ?? 0} items
                  </AppText>
                </View>
                <ChevronRight size={16} color={colors.faint} strokeWidth={2.2} />
              </Pressable>
            ))}
          </View>
        )}

        <Card style={styles.listCard} padded={false}>
          {files.map((item, index) => {
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  haptics.tap();
                  setSelected(item);
                }}
                android_ripple={ripple(colors.surfaceActive) ?? undefined}
                style={({ pressed }) => [
                  styles.fileRow,
                  index < files.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.hairline },
                  pressed && { backgroundColor: colors.surfaceActive },
                ]}
              >
                <View style={[styles.fileIcon, { backgroundColor: colors.surfaceSunken }]}>
                  {fileIcon(item.type!, colors.text3)}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 13.5 }}>
                    {item.name}
                  </AppText>
                  <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, marginTop: 2 }}>
                    {item.size} · {item.date}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
          {files.length === 0 && folders.length === 0 && (
            <View style={styles.emptyBox}>
              <AppText variant="body" color={colors.muted2} style={{ fontSize: 12.5 }}>
                {query ? `No files match “${q}”.` : 'This folder is empty.'}
              </AppText>
            </View>
          )}
        </Card>
      </ScrollView>

      <BottomSheet visible={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <View style={styles.sheetHeader}>
              <View style={[styles.fileIcon, { backgroundColor: colors.surfaceSunken, width: 44, height: 44, borderRadius: 12 }]}>
                {fileIcon(selected.type!, colors.text3)}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 14.5 }}>
                  {selected.name}
                </AppText>
                <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
                  {TYPE_LABELS[selected.type!]}
                </AppText>
              </View>
              <Pressable onPress={() => setSelected(null)} style={[styles.closeBtn, { backgroundColor: colors.surfaceSunken }]}>
                <X size={14} color={colors.text3} strokeWidth={2.4} />
              </Pressable>
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
              <View style={styles.footNote}>
                <Lock size={12} color={colors.muted2} strokeWidth={2.2} />
                <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, flex: 1, lineHeight: 16 }}>
                  Downloading to personal storage is disabled by {ORG_NAME} policy.
                </AppText>
              </View>
            </View>
          </>
        )}
      </BottomSheet>

      <BottomSheet visible={filterOpen} onClose={() => setFilterOpen(false)} maxHeightPct={80}>
        <View style={styles.filterHeader}>
          <AppText variant="displaySemibold" style={{ fontSize: 16 }}>
            Filter &amp; sort
          </AppText>
          <Pressable
            onPress={() => {
              haptics.tap();
              setActiveTypes(new Set());
              setSortBy('date');
            }}
            hitSlop={8}
          >
            <AppText variant="bodySemibold" color={colors.primary} style={{ fontSize: 13 }}>
              Clear all
            </AppText>
          </Pressable>
        </View>

        <ScrollView style={{ maxHeight: 440 }} contentContainerStyle={styles.filterBody} showsVerticalScrollIndicator={false}>
          <AppText variant="displaySemibold" color={colors.text2} style={styles.filterSectionLabel}>
            Drive
          </AppText>
          <View style={styles.filterChipRow}>
            {DRIVES.map((d) => (
              <FilterChip key={d.id} label={d.label} active={drive === d.id} onPress={() => setDrive(d.id)} />
            ))}
          </View>

          <AppText variant="displaySemibold" color={colors.text2} style={styles.filterSectionLabel}>
            File type
          </AppText>
          <View style={styles.filterChipRow}>
            {TYPE_FILTERS.map((t) => (
              <FilterChip key={t.id} label={t.label} active={activeTypes.has(t.id)} onPress={() => toggleType(t.id)} />
            ))}
          </View>

          <AppText variant="displaySemibold" color={colors.text2} style={styles.filterSectionLabel}>
            Sort by
          </AppText>
          <Card padded={false} style={styles.sortCard}>
            {SORTS.map((s, i) => (
              <Pressable
                key={s.id}
                onPress={() => {
                  haptics.select();
                  setSortBy(s.id);
                }}
                android_ripple={ripple(colors.surfaceActive) ?? undefined}
                style={[styles.sortRow, i < SORTS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}
              >
                <AppText variant="bodyMedium" style={{ fontSize: 13.5, flex: 1 }}>
                  {s.label}
                </AppText>
                {sortBy === s.id && <Check size={16} color={colors.primary} strokeWidth={2.6} />}
              </Pressable>
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

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress();
      }}
      android_ripple={ripple(active ? 'rgba(255,255,255,0.2)' : colors.surfaceActive) ?? undefined}
      style={[
        styles.filterChip,
        { backgroundColor: active ? colors.primary : colors.surfaceSunken, borderColor: active ? colors.primary : colors.border },
      ]}
    >
      {active && <Check size={13} color="#FFFFFF" strokeWidth={2.8} />}
      <AppText variant="bodySemibold" color={active ? '#FFFFFF' : colors.text2} style={{ fontSize: 12.5 }}>
        {label}
      </AppText>
    </Pressable>
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
      <Pressable onPress={onSwitchDrive} hitSlop={6} style={styles.rootCrumb}>
        <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
          {DRIVE_LABELS[drive]}
        </AppText>
        <ChevronRight size={14} color={colors.faint} strokeWidth={2.4} />
      </Pressable>
    );
  }

  return (
    <View style={styles.crumbRow}>
      <Pressable
        onPress={() => {
          haptics.tap();
          onNavigate(trail.length >= 2 ? trail[trail.length - 2].id : null);
        }}
        hitSlop={8}
        style={[styles.crumbBack, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        <ChevronLeft size={15} color={colors.text2} strokeWidth={2.4} />
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
        <Pressable onPress={() => onNavigate(null)} hitSlop={6}>
          <AppText variant="bodySemibold" color={colors.muted} style={{ fontSize: 12.5 }}>
            {DRIVE_LABELS[drive]}
          </AppText>
        </Pressable>
        {trail.map((node, i) => {
          const isLast = i === trail.length - 1;
          return (
            <View key={node.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="body" color={colors.faint} style={{ fontSize: 12.5, marginHorizontal: 5 }}>
                /
              </AppText>
              <Pressable onPress={() => onNavigate(node.id)} hitSlop={6} disabled={isLast}>
                <AppText
                  variant={isLast ? 'bodySemibold' : 'bodySemibold'}
                  color={isLast ? colors.text : colors.muted}
                  style={{ fontSize: 12.5 }}
                >
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
      <AppText variant="body" color={colors.muted} style={{ fontSize: 13 }}>
        {label}
      </AppText>
      <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 13, flexShrink: 1, textAlign: 'right', marginLeft: 12 }}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
  filterBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterDot: { position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 110 },
  storageCard: { marginBottom: 14 },
  storageTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  storageLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  rootCrumb: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12, alignSelf: 'flex-start' },
  crumbRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  crumbBack: { width: 30, height: 30, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  folderGrid: { gap: 8, marginBottom: 14 },
  folderTile: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  folderIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  listCard: { overflow: 'hidden' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  fileIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emptyBox: { padding: 26, alignItems: 'center' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 14, paddingTop: 8 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  sheetBody: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 32 },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  footNote: { flexDirection: 'row', gap: 6, marginTop: 8 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  filterBody: { paddingHorizontal: 20, paddingBottom: 12 },
  filterSectionLabel: { fontSize: 12.5, marginBottom: 10, marginTop: 4 },
  filterChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 9 },
  sortCard: { overflow: 'hidden', marginBottom: 8 },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  filterFooter: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1 },
});
