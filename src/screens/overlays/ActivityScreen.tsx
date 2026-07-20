import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LayoutGrid, ShieldCheck, Lock, RefreshCw, Cast, ShieldAlert, BadgeCheck, History, Megaphone, Eye,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { ListRow } from '../../components/ListRow';
import { IconTile } from '../../components/IconTile';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SearchField } from '../../components/SearchField';
import { FilterChips } from '../../components/FilterChips';
import { EmptyState } from '../../components/EmptyState';
import { Entrance } from '../../components/Motion';
import { useAppStore } from '../../state/store';
import { ActivityKind } from '../../types';
import { ColorScheme } from '../../theme/colors';
import { space, layout, control } from '../../theme/spacing';
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
      <View style={styles.gutter}>
        <ScreenHeader title="Activity" onBack={() => navigation.goBack()} />
      </View>
      {/* The controls own the whole gap down to the list they drive (blockGap). */}
      <View style={styles.controls}>
        <SearchField value={q} onChangeText={setQ} placeholder="Search activity" label="activity" />
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
          <AppText variant="body" size="caption" color={colors.muted2} style={styles.intro}>
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
          <Card style={styles.list} padded={false}>
            {rows.map((a, i) => {
              const ks = kindStyle(a.kind, colors);
              return (
                <Entrance key={a.id} delay={Math.min(i, 7) * 55}>
                  <ListRow
                    icon={
                      <IconTile bg={ks.tint}>
                        <ks.Icon size={control.icon.md} color={ks.color} strokeWidth={2} />
                      </IconTile>
                    }
                    label={a.title}
                    sub={a.detail}
                    bordered={i < rows.length - 1}
                    // Time and actor stack into the trailing slot: a ListRow has a
                    // label and one sub-line, not a third meta line. Same shape the
                    // migrated ChatList uses for its time + unread column.
                    right={
                      <View style={styles.meta}>
                        <AppText variant="bodySemibold" size="micro" color={colors.muted2}>
                          {a.time}
                        </AppText>
                        <AppText
                          variant="bodySemibold"
                          size="micro"
                          color={a.actor.startsWith('IT') ? colors.info : colors.muted2}
                          numberOfLines={1}
                        >
                          {a.actor}
                        </AppText>
                      </View>
                    }
                  />
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
  gutter: { paddingHorizontal: layout.gutter },
  controls: { paddingHorizontal: layout.gutter, gap: layout.cardGap, paddingBottom: layout.blockGap },
  // SafeAreaView already owns the bottom inset — the content only adds the
  // resting gap above it.
  body: { paddingHorizontal: layout.gutter, paddingBottom: layout.screenBottom },
  intro: { marginBottom: layout.blockGap },
  list: { overflow: 'hidden' },
  meta: { alignItems: 'flex-end', gap: space[1] },
});
