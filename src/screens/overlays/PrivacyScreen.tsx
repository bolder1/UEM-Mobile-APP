import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { ListRow } from '../../components/ListRow';
import { IconTile } from '../../components/IconTile';
import { StatusDot } from '../../components/StatusDot';
import { ScreenHeader } from '../../components/ScreenHeader';
import { FilterChips } from '../../components/FilterChips';
import { Entrance, CountUp } from '../../components/Motion';
import { useAppStore, ORG_NAME } from '../../state/store';
import { PRIVACY_DATA, PRIVACY_VISIBLE_COUNT, PRIVACY_PRIVATE_COUNT } from '../../data/mockData';
import { space, layout, control } from '../../theme/spacing';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

export function PrivacyScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const form = useAppStore((s) => s.form);
  const [filter, setFilter] = useState<'all' | 'visible' | 'private'>('all');

  const visibleCount = PRIVACY_VISIBLE_COUNT;
  const privateCount = PRIVACY_PRIVATE_COUNT;

  const rows = useMemo(
    () => PRIVACY_DATA.filter((d) => (filter === 'all' ? true : filter === 'visible' ? d.visible : !d.visible)),
    [filter],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.gutter}>
        <ScreenHeader title="Privacy" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Entrance delay={0}>
          <AppText variant="body" size="caption" color={colors.muted} style={styles.intro}>
            You&rsquo;re on a {form.own === 'company' ? 'company-owned' : 'personal (BYOD)'} device. Here is the exact
            line between what {ORG_NAME} can see and what stays yours.
          </AppText>
        </Entrance>

        <Entrance delay={80}>
          <View style={styles.tally}>
            <Card style={[styles.tallyCard, { borderColor: colors.border }]}>
              <View style={styles.tallyTop}>
                <Eye size={control.icon.md} color={colors.info} strokeWidth={2.2} />
                <CountUp value={visibleCount}>
                  {(d) => (
                    <AppText variant="display" size="display" style={styles.tallyCount}>
                      {d}
                    </AppText>
                  )}
                </CountUp>
              </View>
              <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.tallyLabel}>
                VISIBLE TO IT
              </AppText>
            </Card>
            <Card style={[styles.tallyCard, { borderColor: colors.border }]}>
              <View style={styles.tallyTop}>
                <EyeOff size={control.icon.md} color={colors.success} strokeWidth={2.2} />
                <CountUp value={privateCount}>
                  {(d) => (
                    <AppText variant="display" size="display" style={styles.tallyCount}>
                      {d}
                    </AppText>
                  )}
                </CountUp>
              </View>
              <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.tallyLabel}>
                STAYS PRIVATE
              </AppText>
            </Card>
          </View>
        </Entrance>

        <Entrance delay={160}>
          <View style={styles.chips}>
            <FilterChips
              value={filter}
              onChange={(k) => setFilter(k as typeof filter)}
              options={[
                { key: 'all', label: `All · ${PRIVACY_DATA.length}` },
                { key: 'visible', label: `Visible · ${visibleCount}` },
                { key: 'private', label: `Private · ${privateCount}` },
              ]}
            />
          </View>
        </Entrance>

        <Card style={styles.list} padded={false}>
          {rows.map((r, i) => (
            <Entrance key={r.label} delay={220 + Math.min(i, 7) * 55}>
              <ListRow
                icon={
                  <IconTile bg={r.visible ? colors.infoTint : colors.successTint}>
                    <r.Icon size={control.icon.md} color={r.visible ? colors.info : colors.success} strokeWidth={2} />
                  </IconTile>
                }
                label={r.label}
                sub={r.detail}
                bordered={i < rows.length - 1}
                right={
                  <View style={[styles.pill, { backgroundColor: r.visible ? colors.infoTint : colors.successTint }]}>
                    {/* The status word renders right beside the dot, so the dot
                        only has to stop being anonymous — it doesn't repeat it. */}
                    <StatusDot color={r.visible ? colors.info : colors.success} label={r.visible ? 'IT' : 'Private'} labelHidden />
                    <AppText variant="bodyBold" size="micro" color={r.visible ? colors.info : colors.success}>
                      {r.visible ? 'IT' : 'Private'}
                    </AppText>
                  </View>
                }
              />
            </Entrance>
          ))}
        </Card>

        <Entrance delay={260}>
          {/* The "personal devices share far less than company-owned" line is
              gone: this list is a module constant that never varies by
              ownership, so a company-owned device rendered the identical rows
              under a claim they were different. Showing the ledger IS the
              product — claiming something about it that the ledger doesn't
              show is the thing this app exists not to do. */}
          <AppText variant="body" size="micro" color={colors.muted2} style={styles.foot}>
            Managed by {ORG_NAME} IT · you can review this anytime.
          </AppText>
        </Entrance>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gutter: { paddingHorizontal: layout.gutter },
  // SafeAreaView already owns the bottom inset.
  body: { paddingHorizontal: layout.gutter, paddingBottom: layout.screenBottom },
  intro: { marginBottom: layout.blockGap },
  tally: { flexDirection: 'row', gap: layout.cardGap, marginBottom: layout.sectionGap },
  tallyCard: { flex: 1 },
  tallyCount: { letterSpacing: -0.5 },
  tallyLabel: { letterSpacing: 1, textTransform: 'uppercase' },
  tallyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: layout.captionGap },
  chips: { marginBottom: layout.blockGap },
  list: { overflow: 'hidden' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: space[2], borderRadius: 8, paddingHorizontal: space[2], paddingVertical: space[1] },
  foot: { marginTop: layout.sectionGap },
});
