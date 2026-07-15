import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LayoutGrid, ShieldCheck, Lock, RefreshCw, Cast, ShieldAlert, BadgeCheck, History, Megaphone, Eye,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SearchField } from '../../components/SearchField';
import { FilterChips } from '../../components/FilterChips';
import { EmptyState } from '../../components/EmptyState';
import { Entrance } from '../../components/Motion';
import { useAppStore } from '../../state/store';
import { ActivityKind } from '../../types';
import { ColorScheme } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Activity'>;

function kindStyle(kind: ActivityKind, c: ColorScheme): { Icon: any; tint: string; color: string } {
  switch (kind) {
    case 'app': return { Icon: LayoutGrid, tint: c.infoTint, color: c.info };
    case 'cert': return { Icon: ShieldCheck, tint: c.amberTint, color: c.amber };
    case 'tunnel': return { Icon: Lock, tint: c.primaryTint, color: c.primary };
    case 'sync': return { Icon: RefreshCw, tint: c.infoTint, color: c.info };
    case 'cast': return { Icon: Cast, tint: c.violetTint, color: c.violet };
    case 'security': return { Icon: ShieldAlert, tint: c.dangerTint, color: c.danger };
    case 'broadcast': return { Icon: Megaphone, tint: c.infoTint, color: c.info };
    case 'privacy': return { Icon: Eye, tint: c.violetTint, color: c.violet };
    default: return { Icon: BadgeCheck, tint: c.successTint, color: c.success };
  }
}

export function ActivityScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const activity = useAppStore((s) => s.activity);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'you' | 'it'>('all');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return activity.filter((a) => {
      if (filter === 'you' && a.actor !== 'you') return false;
      if (filter === 'it' && !a.actor.startsWith('IT')) return false;
      if (!query) return true;
      return (a.title + ' ' + a.detail + ' ' + a.actor).toLowerCase().includes(query);
    });
  }, [activity, q, filter]);

  const youCount = activity.filter((a) => a.actor === 'you').length;
  const itCount = activity.filter((a) => a.actor.startsWith('IT')).length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: 20 }}>
        <ScreenHeader title="Activity" onBack={() => navigation.goBack()} />
      </View>
      <View style={{ paddingHorizontal: 20, gap: 12, paddingBottom: 6 }}>
        <SearchField value={q} onChangeText={setQ} placeholder="Search activity" />
        <FilterChips
          value={filter}
          onChange={(k) => setFilter(k as typeof filter)}
          options={[
            { key: 'all', label: `All · ${activity.length}` },
            { key: 'you', label: `By you · ${youCount}` },
            { key: 'it', label: `By IT · ${itCount}` },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Entrance delay={0}>
          <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, marginBottom: 10, marginHorizontal: 2 }}>
            Every action taken on this device, by you or IT. Nothing here is hidden from you.
          </AppText>
        </Entrance>

        {rows.length === 0 ? (
          <Entrance delay={80}>
            <EmptyState
              icon={<History size={22} color={colors.muted} strokeWidth={2} />}
              title={q ? 'No matching activity' : 'Nothing logged yet'}
              body={q ? `Nothing matches “${q}”.` : 'Actions you or IT take will appear here.'}
            />
          </Entrance>
        ) : (
          <Card style={{ overflow: 'hidden' }} padded={false}>
            {rows.map((a, i) => {
              const ks = kindStyle(a.kind, colors);
              return (
                <Entrance key={a.id} delay={Math.min(i, 7) * 55}>
                  <View
                    style={[styles.row, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}
                  >
                    <View style={[styles.icon, { backgroundColor: ks.tint }]}>
                      <ks.Icon size={16} color={ks.color} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
                        {a.title}
                      </AppText>
                      <AppText variant="body" color={colors.muted} style={{ fontSize: 11.5, marginTop: 1 }} numberOfLines={1}>
                        {a.detail}
                      </AppText>
                      <View style={styles.meta}>
                        <AppText variant="bodySemibold" color={colors.muted2} style={{ fontSize: 11 }}>
                          {a.time}
                        </AppText>
                        <View style={[styles.metaDot, { backgroundColor: colors.faint }]} />
                        <AppText
                          variant="bodySemibold"
                          color={a.actor.startsWith('IT') ? colors.info : colors.muted2}
                          style={{ fontSize: 11 }}
                        >
                          {a.actor}
                        </AppText>
                      </View>
                    </View>
                  </View>
                </Entrance>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 34 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5 },
});
