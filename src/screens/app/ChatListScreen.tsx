import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Megaphone, Search, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { BottomSheet } from '../../components/BottomSheet';
import { SearchField } from '../../components/SearchField';
import { EmptyState } from '../../components/EmptyState';
import { ListRow } from '../../components/ListRow';
import { IconTile } from '../../components/IconTile';
import { IconButton } from '../../components/IconButton';
import { InfoNote } from '../../components/InfoNote';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAppStore, ORG_NAME } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { DIRECTORY } from '../../data/mockData';
import { Entrance, PressableScale } from '../../components/Motion';
import { space, layout, control } from '../../theme/spacing';
import { radii } from '../../theme/platform';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Chat'>,
  NativeStackScreenProps<RootStackParamList>
>;

const FAB = 56;

export function ChatListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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

  const header = (
    <>
      <Entrance delay={0}>
        <ScreenHeader
          title="Chat"
          size="display"
          onMenu={() => {
            haptics.tap();
            setDrawer(true);
          }}
        />
      </Entrance>

      <Entrance delay={80}>
        <View style={{ marginBottom: layout.blockGap }}>
          <SearchField value={q} onChangeText={setQ} placeholder="Search people and spaces" label="people and spaces" />
        </View>
      </Entrance>

      {!query ? (
        <Entrance delay={160}>
          <Card padded={false} style={{ marginBottom: layout.cardGap, overflow: 'hidden' }}>
            <ListRow
              icon={
                <IconTile bg={colors.primaryTint}>
                  <Megaphone size={control.icon.lg} color={colors.primary} strokeWidth={2} />
                </IconTile>
              }
              label="Company announcements"
              sub={`Broadcasts from ${ORG_NAME} IT`}
              onPress={() => navigation.navigate('Notifications')}
              showChevron={false}
              right={
                <View style={[styles.pinPill, { backgroundColor: colors.surfaceSunken }]}>
                  <AppText variant="bodyBold" size="micro" color={colors.muted2} style={{ letterSpacing: 0.9 }}>
                    PINNED
                  </AppText>
                </View>
              }
            />
          </Card>
        </Entrance>
      ) : null}
    </>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + layout.screenTop }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        // This list used to be `scrollEnabled={false}` inside a non-scrolling
        // View: every chat past the fold was simply unreachable, and the list
        // grows at runtime as you message new people. It is now the screen's
        // scroll container, with the header and note along for the ride.
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          // Clear the FAB, which floats over this list, plus the home indicator.
          paddingBottom: insets.bottom + layout.screenBottom + FAB + layout.cardGap,
        }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon={<Search size={22} color={colors.muted} strokeWidth={2} />}
            title="No people or spaces"
            body={`Nothing matches “${q}”.`}
          />
        }
        renderItem={({ item, index }) => (
          <Entrance delay={Math.min(index, 7) * 55}>
            <Card
              padded={false}
              radius={0}
              style={[
                styles.rowCard,
                index === 0 && styles.rowCardFirst,
                index === filtered.length - 1 && styles.rowCardLast,
              ]}
            >
              <ListRow
                icon={<Avatar initials={item.init} color={item.color} size={control.avatar} online={item.online} />}
                label={item.name}
                sub={item.lastText}
                onPress={() => openThread(item.id)}
                showChevron={false}
                accessibilityLabel={
                  `${item.name}${item.online ? ', online' : ''}. ${item.lastText}. ${item.time}.` +
                  (item.unread > 0 ? ` ${item.unread} unread.` : '')
                }
                bordered={index < filtered.length - 1}
                right={
                  <View style={styles.meta}>
                    <AppText variant="body" size="micro" color={colors.muted2}>
                      {item.time}
                    </AppText>
                    {item.unread > 0 ? (
                      <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                        <AppText variant="bodyBold" size="micro" color={colors.white}>
                          {item.unread}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                }
              />
            </Card>
          </Entrance>
        )}
        ListFooterComponent={
          filtered.length > 0 ? <InfoNote text="Work chat stays inside the work profile." /> : null
        }
      />

      <Pressable
        onPress={() => {
          haptics.tap();
          setSheetOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="New message"
        style={({ pressed }) => [
          styles.fab,
          {
            bottom: insets.bottom + layout.screenBottom,
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            transform: [{ scale: pressed ? 0.93 : 1 }],
          },
        ]}
      >
        <Plus size={24} color={colors.white} strokeWidth={2.4} />
      </Pressable>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        maxHeightPct={62}
        accessibilityLabel="New message"
      >
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            <AppText variant="displaySemibold" size="callout" accessibilityRole="header">
              New message
            </AppText>
            <AppText variant="body" size="caption" color={colors.muted}>
              {ORG_NAME} directory · {DIRECTORY.length} people
            </AppText>
          </View>
          <IconButton
            icon={<X size={control.icon.md} color={colors.text3} strokeWidth={2.4} />}
            onPress={() => setSheetOpen(false)}
            accessibilityLabel="Close"
            variant="neutral"
            size={36}
          />
        </View>
        <FlatList
          data={DIRECTORY}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          style={{ borderTopWidth: 1, borderTopColor: colors.hairline }}
          renderItem={({ item, index }) => (
            <Entrance delay={Math.min(index, 7) * 55}>
              <PressableScale onPress={() => selectContact(item.id)} accessibilityLabel={`Message ${item.name}`}>
                <ListRow
                  icon={<Avatar initials={item.init} color={item.color} size={control.tile} />}
                  label={item.name}
                  sub={item.role}
                  showChevron={false}
                  bordered={index < DIRECTORY.length - 1}
                />
              </PressableScale>
            </Entrance>
          )}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pinPill: { borderRadius: space[2], paddingHorizontal: space[2], paddingVertical: space[1] },
  // The list reads as one card: square the inner joins, round only the ends.
  rowCard: { borderTopWidth: 0, borderBottomWidth: 0 },
  rowCardFirst: { borderTopLeftRadius: radii.card, borderTopRightRadius: radii.card, borderTopWidth: 1 },
  rowCardLast: { borderBottomLeftRadius: radii.card, borderBottomRightRadius: radii.card, borderBottomWidth: 1 },
  meta: { alignItems: 'flex-end', gap: space[1] },
  unreadBadge: {
    minWidth: space[5],
    height: space[5],
    borderRadius: space[5] / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[1],
  },
  fab: {
    position: 'absolute',
    right: layout.gutter,
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: layout.sheetPad,
    paddingBottom: layout.cardGap,
    paddingTop: space[2],
  },
});
