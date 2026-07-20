import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, BadgeCheck, Megaphone, LayoutGrid, Cast, ShieldAlert, CheckCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { ListRow } from '../../components/ListRow';
import { IconTile } from '../../components/IconTile';
import { StatusDot } from '../../components/StatusDot';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Entrance, PressableScale } from '../../components/Motion';
import { useAppStore } from '../../state/store';
import { NotificationCategory, NotificationItem } from '../../types';
import { space, layout, touch, control } from '../../theme/spacing';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ColorScheme } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

// "Mark all read" is icon + one line of caption text, so it renders ~16 tall.
// The box stays that size; the slop carries the target to 44.
const MARK_ALL_H = 16;

function categoryStyle(colors: ColorScheme, cat: NotificationCategory) {
  switch (cat) {
    case 'cert':
      return { bg: colors.amberTint, c: colors.amber, Icon: BadgeCheck };
    case 'broadcast':
      return { bg: colors.infoTint, c: colors.info, Icon: Megaphone };
    case 'app':
      return { bg: colors.violetTint, c: colors.violet, Icon: LayoutGrid };
    case 'cast':
      return { bg: colors.primaryTint, c: colors.primary, Icon: Cast };
    case 'security':
      return { bg: colors.dangerTint, c: colors.danger, Icon: ShieldAlert };
  }
}

export function NotificationsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const notifications = useAppStore((s) => s.notifications);
  const markNotifRead = useAppStore((s) => s.markNotifRead);
  const markAllNotifsRead = useAppStore((s) => s.markAllNotifsRead);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const goToTarget = (n: NotificationItem) => {
    markNotifRead(n.id);
    if (n.category === 'cert') navigation.navigate('Certs');
    else if (n.category === 'cast') navigation.navigate('Cast');
    else if (n.category === 'app') navigation.navigate('MainTabs', { screen: 'Apps' });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        right={
          unreadCount > 0 ? (
            <PressableScale
              onPress={() => markAllNotifsRead()}
              style={styles.markAllBtn}
              hitSlop={touch.slopFor(MARK_ALL_H)}
              accessibilityLabel="Mark all notifications read"
            >
              <CheckCheck size={control.icon.sm} color={colors.primary} strokeWidth={2.3} />
              <AppText variant="bodySemibold" size="caption" color={colors.primary}>
                Mark all read
              </AppText>
            </PressableScale>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: layout.cardGap }} />}
        renderItem={({ item, index }) => {
          const { bg, c, Icon } = categoryStyle(colors, item.category);
          return (
            <Entrance delay={Math.min(index, 7) * 55}>
              <PressableScale
                onPress={() => goToTarget(item)}
                // The row carried "unread" in a background tint and a bare dot, and
                // announced only the title — so unread, body and time reached a
                // screen reader not at all. The Pressable groups its children, so
                // the whole row has to be spelled out here.
                accessibilityLabel={
                  `${item.title}. ${item.body}. ${item.time}.` + (item.read ? '' : ' Unread.')
                }
              >
                <Card padded={false} style={{ backgroundColor: item.read ? colors.surface : colors.surfaceHover }}>
                  <ListRow
                    icon={
                      <IconTile bg={bg}>
                        <Icon size={control.icon.lg} color={c} strokeWidth={2} />
                      </IconTile>
                    }
                    label={item.title}
                    sub={item.body}
                    right={
                      <View style={styles.meta}>
                        <AppText variant="body" size="micro" color={colors.muted2}>
                          {item.time}
                        </AppText>
                        {!item.read ? (
                          <StatusDot color={colors.primary} label="Unread" labelHidden />
                        ) : null}
                      </View>
                    }
                  />
                </Card>
              </PressableScale>
            </Entrance>
          );
        }}
        ListEmptyComponent={
          <Entrance>
            <EmptyState
              icon={<Bell size={28} color={colors.faint} strokeWidth={1.6} />}
              title="You’re all caught up."
            />
          </Entrance>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: layout.gutter },
  // No paddingBottom to line it up with the header any more — ScreenHeader's
  // `right` slot centres it against the title itself.
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  // SafeAreaView already owns the bottom inset.
  list: { paddingBottom: layout.screenBottom },
  meta: { alignItems: 'flex-end', gap: space[1] },
});
