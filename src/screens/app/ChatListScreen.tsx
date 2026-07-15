import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Lock, X, Megaphone, Search, Menu } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { BottomSheet } from '../../components/BottomSheet';
import { SearchField } from '../../components/SearchField';
import { EmptyState } from '../../components/EmptyState';
import { useAppStore, ORG_NAME } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { DIRECTORY } from '../../data/mockData';
import { Entrance, PressableScale, CountUp } from '../../components/Motion';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Chat'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ChatListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const chats = useAppStore((s) => s.chats);
  const messages = useAppStore((s) => s.messages);
  const unread = useAppStore((s) => s.unread);
  const openChat = useAppStore((s) => s.openChat);
  const startChatWithContact = useAppStore((s) => s.startChatWithContact);
  const setDrawer = useAppStore((s) => s.setDrawer);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [q, setQ] = useState('');

  const rows = chats.map((c, i) => {
    const msgs = messages[c.id] || [];
    const last = msgs[msgs.length - 1];
    return {
      ...c,
      lastText: last ? (last.mine ? 'You: ' + last.text : last.text) : '',
      time: last ? last.t : '',
      unread: unread[c.id] || 0,
      online: i < 2,
    };
  });

  const query = q.trim().toLowerCase();
  const filtered = query ? rows.filter((r) => (r.name + ' ' + r.lastText).toLowerCase().includes(query)) : rows;

  const openThread = (id: string) => {
    openChat(id);
    navigation.navigate('ChatThread', { chatId: id });
  };

  const selectContact = (id: string) => {
    startChatWithContact(id);
    setSheetOpen(false);
    navigation.navigate('ChatThread', { chatId: id });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <Pressable
        onPress={() => { haptics.tap(); setDrawer(true); }}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        style={[styles.menuBtn, { backgroundColor: colors.surfaceSunken }]}
      >
        <Menu size={18} color={colors.text3} strokeWidth={2} />
      </Pressable>
      <Entrance delay={0}>
        <View style={styles.header}>
          <AppText variant="display" style={{ fontSize: 22 }}>
            Chat
          </AppText>
        </View>
      </Entrance>

      <Entrance delay={80}>
        <View style={{ marginBottom: 14 }}>
          <SearchField value={q} onChangeText={setQ} placeholder="Search people and spaces" />
        </View>
      </Entrance>

      {!query ? (
        <Entrance delay={160}>
          <PressableScale onPress={() => navigation.navigate('Notifications')}>
            <Card style={styles.pinned}>
              <View style={[styles.pinIcon, { backgroundColor: colors.primaryTint }]}>
                <Megaphone size={18} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
                  Company announcements
                </AppText>
                <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 1 }}>
                  Broadcasts from {ORG_NAME} IT
                </AppText>
              </View>
              <View style={[styles.pinPill, { backgroundColor: colors.surfaceSunken }]}>
                <AppText variant="bodyBold" color={colors.muted2} style={{ fontSize: 10, letterSpacing: 0.9 }}>
                  PINNED
                </AppText>
              </View>
            </Card>
          </PressableScale>
        </Entrance>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={22} color={colors.muted} strokeWidth={2} />}
          title="No people or spaces"
          body={`Nothing matches “${q}”.`}
        />
      ) : (
        <Entrance delay={240}>
        <Card style={styles.listCard} padded={false}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <Entrance delay={Math.min(index, 7) * 55}>
              <Pressable
                onPress={() => openThread(item.id)}
                style={({ pressed }) => [
                  styles.row,
                  index < filtered.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.hairline },
                  pressed && { backgroundColor: colors.surfaceActive, transform: [{ scale: 0.985 }] },
                ]}
              >
                <Avatar initials={item.init} color={item.color} size={44} online={item.online} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.rowTop}>
                  <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 14, flexShrink: 1 }}>
                    {item.name}
                  </AppText>
                  <AppText variant="body" color={colors.muted2} style={{ fontSize: 11 }}>
                    {item.time}
                  </AppText>
                </View>
                <View style={styles.rowBottom}>
                  <AppText variant="body" color={colors.muted} numberOfLines={1} style={{ fontSize: 12.5, flex: 1 }}>
                    {item.lastText}
                  </AppText>
                  {item.unread > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                      <AppText variant="bodyBold" color="#FFFFFF" style={{ fontSize: 10.5 }}>
                        {item.unread}
                      </AppText>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
              </Entrance>
          )}
        />
        </Card>
        </Entrance>
      )}

      <View style={styles.footNote}>
        <Lock size={12} color={colors.muted2} strokeWidth={2.2} />
        <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5 }}>
          Work chat is end-to-end inside the work profile.
        </AppText>
      </View>

      <Pressable
        onPress={() => {
          haptics.tap();
          setSheetOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="New message"
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, shadowColor: colors.primary, transform: [{ scale: pressed ? 0.93 : 1 }] },
        ]}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.4} />
      </Pressable>

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} maxHeightPct={62}>
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            <AppText variant="displaySemibold" style={{ fontSize: 16 }}>
              New message
            </AppText>
            <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
              {ORG_NAME} directory ·{' '}
              <CountUp value={DIRECTORY.length}>
                {(d) => (
                  <AppText variant="body" color={colors.muted} style={{ fontSize: 12 }}>
                    {d}
                  </AppText>
                )}
              </CountUp>{' '}
              people
            </AppText>
          </View>
          <Pressable
            onPress={() => setSheetOpen(false)}
            style={[styles.closeBtn, { backgroundColor: colors.surfaceSunken }]}
          >
            <X size={14} color={colors.text3} strokeWidth={2.4} />
          </Pressable>
        </View>
        <FlatList
          data={DIRECTORY}
          keyExtractor={(item) => item.id}
          style={{ borderTopWidth: 1, borderTopColor: colors.hairline }}
          contentContainerStyle={{ paddingBottom: 28 }}
          renderItem={({ item, index }) => (
            <Entrance delay={Math.min(index, 7) * 55}>
              <PressableScale
                onPress={() => selectContact(item.id)}
                accessibilityLabel={`Message ${item.name}`}
                style={[styles.directoryRow, { borderBottomColor: colors.hairline2 }]}
              >
                <Avatar initials={item.init} color={item.color} size={40} online />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 14 }}>
                    {item.name}
                  </AppText>
                  <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 1 }}>
                    {item.role}
                  </AppText>
                </View>
              </PressableScale>
            </Entrance>
          )}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  header: { paddingVertical: 10 },
  menuBtn: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  pinned: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, marginBottom: 12 },
  pinIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  pinPill: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  listCard: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 2 },
  unreadBadge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  footNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, marginHorizontal: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  directoryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 20, borderBottomWidth: 1 },
});
