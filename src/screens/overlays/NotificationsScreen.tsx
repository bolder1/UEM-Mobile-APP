import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, BadgeCheck, Megaphone, LayoutGrid, Cast, ShieldAlert, CheckCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Entrance, PressableScale } from '../../components/Motion';
import { useAppStore } from '../../state/store';
import { NotificationCategory, NotificationItem } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ColorScheme } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

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
      <View style={styles.headRow}>
        <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
        {unreadCount > 0 && (
          <PressableScale
            onPress={() => markAllNotifsRead()}
            style={styles.markAllBtn}
            hitSlop={8}
            accessibilityLabel="Mark all notifications read"
          >
            <CheckCheck size={14} color={colors.primary} strokeWidth={2.3} />
            <AppText variant="bodySemibold" color={colors.primary} style={{ fontSize: 12.5 }}>
              Mark all read
            </AppText>
          </PressableScale>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index }) => {
          const { bg, c, Icon } = categoryStyle(colors, item.category);
          return (
            <Entrance delay={Math.min(index, 7) * 55}>
              <PressableScale
                onPress={() => goToTarget(item)}
                accessibilityLabel={item.title}
                style={[
                  styles.row,
                  {
                    backgroundColor: item.read ? colors.surface : colors.surfaceHover,
                    borderColor: colors.border,
                  },
                ]}
              >
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                <View style={[styles.icon, { backgroundColor: bg }]}>
                  <Icon size={18} color={c} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
                    {item.title}
                  </AppText>
                  <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2, lineHeight: 17 }}>
                    {item.body}
                  </AppText>
                  <AppText variant="body" color={colors.muted2} style={{ fontSize: 11, marginTop: 5 }}>
                    {item.time}
                  </AppText>
                </View>
              </PressableScale>
            </Entrance>
          );
        }}
        ListEmptyComponent={
          <Entrance style={styles.empty}>
            <Bell size={28} color={colors.faint} strokeWidth={1.6} />
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 12.5, marginTop: 10 }}>
              You&rsquo;re all caught up.
            </AppText>
          </Entrance>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingBottom: 14 },
  list: { paddingBottom: 30 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderRadius: 16, padding: 14 },
  unreadDot: { position: 'absolute', top: 14, right: 14, width: 7, height: 7, borderRadius: 3.5 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  empty: { alignItems: 'center', paddingTop: 80 },
});
