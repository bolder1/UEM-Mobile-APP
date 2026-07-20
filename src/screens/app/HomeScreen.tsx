import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Bell, Lock, Folder, LayoutGrid, ShieldCheck, EyeOff, ChevronRight, Cast, Activity as ActivityIcon, Menu } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ListRow } from '../../components/ListRow';
import { IconTile } from '../../components/IconTile';
import { StatusDot } from '../../components/StatusDot';
import { DarkPanel } from '../../components/DarkPanel';
import { GlassChip } from '../../components/Glass';
import { PulseDot } from '../../components/Animations';
import { Entrance } from '../../components/Motion';
import {
  useAppStore, ORG_NAME, DEFAULT_USER_NAME, pendingCertCount, unreadNotifCount,
  policyChecks, passedCheckCount,
} from '../../state/store';
import { PRIVACY_VISIBLE_COUNT, PRIVACY_PRIVATE_COUNT } from '../../data/mockData';
import { haptics } from '../../utils/haptics';
import { ripple } from '../../theme/platform';
import { space, layout, touch, control } from '../../theme/spacing';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

/** The hero's glass chips read as 34 on the dark panel; slop carries them to 44. */
const CHIP = 34;

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const form = useAppStore((s) => s.form);
  const vpn = useAppStore((s) => s.vpn);
  const certs = useAppStore((s) => s.certs);
  const perms = useAppStore((s) => s.perms);
  const approved = useAppStore((s) => s.approved);
  const appSt = useAppStore((s) => s.appSt);
  const broadcastAcked = useAppStore((s) => s.broadcastAcked);
  const ackBroadcast = useAppStore((s) => s.ackBroadcast);
  const cast = useAppStore((s) => s.cast);
  const incomingCast = useAppStore((s) => s.incomingCastSession);
  const lastSync = useAppStore((s) => s.lastSync);
  const syncing = useAppStore((s) => s.syncing);
  const syncNow = useAppStore((s) => s.syncNow);
  const setDrawer = useAppStore((s) => s.setDrawer);
  const notifications = useAppStore((s) => s.notifications);
  const unreadNotifs = unreadNotifCount(notifications);

  const userName = form.name || DEFAULT_USER_NAME;
  const firstName = userName.split(' ')[0];

  const certsPending = pendingCertCount(certs);
  const appsToAct = Object.values(appSt).filter((s) => s === 'available' || s === 'update').length;
  const vpnOn = vpn === 'on';
  const castLive = cast === 'live';
  const castNudge = incomingCast || castLive;
  const actionsCount = (castNudge ? 1 : 0) + (certsPending > 0 ? 1 : 0) + (!broadcastAcked ? 1 : 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const onRefresh = () => {
    if (!syncing) syncNow();
  };

  // A count, not an adjective: "Compliant" was a literal that could never say
  // anything else, and with two certs pending it was also wrong.
  const checks = policyChecks({ approved, perms, certs });
  const checksPassed = passedCheckCount(checks);
  const allChecksPass = checksPassed === checks.length;
  const checksLine = `${checksPassed} of ${checks.length} checks passed`;

  // The card subs double as the screen-reader name for their (now pressable) Card,
  // so the announced label and the visible line can never drift apart.
  const statusText = vpnOn ? `Secure tunnel on · ${checksLine}` : `${checksLine} · synced ${lastSync}`;
  const castSub = castLive ? 'Session live with IT · Ravi Kumar' : 'IT · Ravi Kumar wants to start a session';
  const certsSub = `${certsPending} ${certsPending === 1 ? 'needs' : 'need'} installing · Wi-Fi & tunnel`;
  const privacySub =
    form.own === 'company'
      ? `Company device · ${PRIVACY_VISIBLE_COUNT} things visible`
      : `${PRIVACY_PRIVATE_COUNT} things stay private · ${PRIVACY_VISIBLE_COUNT} visible`;
  const privacyLabel = `What ${ORG_NAME} can see`;

  const goCast = () => navigation.navigate('Cast');
  const goCerts = () => navigation.navigate('Certs');

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <ScrollView
        // There is no tab bar — MainTabNavigator renders `tabBar={() => null}` —
        // so the only thing to clear down here is the home indicator.
        contentContainerStyle={{ paddingBottom: insets.bottom + layout.screenBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={syncing} onRefresh={onRefresh} tintColor={colors.muted} />}
      >
        {/* ---- dark greeting header ---- */}
        <DarkPanel style={{ paddingTop: insets.top + layout.screenTop, paddingHorizontal: layout.gutter, paddingBottom: space[6] }}>
          <View style={styles.brandRow}>
            <Pressable
              onPress={() => { haptics.tap(); setDrawer(true); }}
              hitSlop={touch.slopFor(CHIP)}
              accessibilityRole="button"
              accessibilityLabel="Open menu"
            >
              <GlassChip on="dark" size={CHIP} radius={CHIP / 2}>
                <Menu size={18} color={colors.white} strokeWidth={2} />
              </GlassChip>
            </Pressable>
            <AppText variant="bodySemibold" size="footnote" color={colors.white} style={{ flex: 1 }}>
              UEM Companion
            </AppText>
            <Pressable
              onPress={() => {
                haptics.tap();
                navigation.navigate('Notifications');
              }}
              hitSlop={touch.slopFor(CHIP)}
              accessibilityRole="button"
              accessibilityLabel={unreadNotifs > 0 ? `Notifications, ${unreadNotifs} unread` : 'Notifications'}
            >
              <GlassChip on="dark" size={CHIP} radius={CHIP / 2}>
                <Bell size={17} color={colors.white} strokeWidth={2} />
                {unreadNotifs > 0 ? <View style={[styles.bellDot, { backgroundColor: colors.primary }]} /> : null}
              </GlassChip>
            </Pressable>
          </View>

          <AppText variant="display" size="display" color={colors.white} style={styles.greet}>
            {greeting}, {firstName}
          </AppText>
          <AppText variant="body" size="caption" color="rgba(255,255,255,0.55)">
            {ORG_NAME} · work profile
          </AppText>

          {/* Status reads as a quiet line in the header stack, not a frosted chip.
              The dot carries the state; the glass capsule was just packaging.

              The dot follows the count. It used to be hardcoded green, which
              meant it showed all-clear over "3 of 4 checks passed" — a green
              light on a device that has something outstanding is the exact
              reassurance theatre this product exists to not do. */}
          <View style={styles.statusLine}>
            <StatusDot
              color={allChecksPass ? colors.successStrong : colors.amber}
              label={statusText}
              labelColor="rgba(255,255,255,0.62)"
            />
          </View>
        </DarkPanel>

        <View style={styles.body}>
          {/* ---- quick access launchpad (top) ---- */}
          <Entrance delay={0}>
          <AppText variant="displaySemibold" size="body" style={[styles.sectionLabel, styles.sectionLabelFirst]}>Quick access</AppText>
          <View style={styles.grid}>
            <QuickTile label="Secure tunnel" active={vpnOn} onPress={() => navigation.navigate('Vpn')}
              icon={<Lock size={control.icon.lg} color={colors.text3} strokeWidth={2} />} />
            <QuickTile label="Files" onPress={() => navigation.navigate('Files')}
              icon={<Folder size={control.icon.lg} color={colors.text3} strokeWidth={2} />} />
            <QuickTile label="Certificates" badge={certsPending} onPress={goCerts}
              icon={<ShieldCheck size={control.icon.lg} color={colors.text3} strokeWidth={2} />} />
            <QuickTile label="Screen cast" onPress={goCast}
              icon={<Cast size={control.icon.lg} color={colors.text3} strokeWidth={2} />} />
            <QuickTile label="Activity" onPress={() => navigation.navigate('Activity')}
              icon={<ActivityIcon size={control.icon.lg} color={colors.text3} strokeWidth={2} />} />
            <QuickTile label="Apps" badge={appsToAct} onPress={() => navigation.navigate('Apps')}
              icon={<LayoutGrid size={control.icon.lg} color={colors.text3} strokeWidth={2} />} />
          </View>
          </Entrance>

          {/* ---- needs your action (banner only when something needs you) ---- */}
          <Entrance delay={110}>
          {actionsCount > 0 ? (
            <>
              <View style={styles.sectionHead}>
                <AppText variant="displaySemibold" size="body">Needs your action</AppText>
                <View style={[styles.countPill, { backgroundColor: colors.primary }]}>
                  <AppText variant="bodyBold" size="micro" color={colors.white}>{actionsCount}</AppText>
                </View>
              </View>
              <View style={styles.cardGroup}>
                {/* The Card is a surface, not a button. These rows carry their own
                    Review/Install button, and a pressable Card around one nests a
                    button inside a button: invalid on web, and on iOS the outer
                    swallows the inner so the action can't be reached at all.
                    ListRow's `rightInteractive` is exactly this shape — the row
                    taps through, the trailing control stays its own target. */}
                {castNudge ? (
                  <Card padded={false} style={styles.rowCard}>
                    <ListRow
                      icon={
                        <IconTile bg={castLive ? colors.successTint : colors.primaryTint}>
                          <Cast size={control.icon.lg} color={castLive ? colors.success : colors.primary} strokeWidth={2} />
                        </IconTile>
                      }
                      label="Screen cast"
                      sub={castSub}
                      onPress={() => { haptics.tap(); goCast(); }}
                      rightInteractive={!castLive}
                      showChevron={false}
                      right={
                        castLive ? (
                          <StatusDot color={colors.success} label="Live" labelColor={colors.success} />
                        ) : (
                          <Button label="Review" size="sm" onPress={goCast} style={styles.rowAction} />
                        )
                      }
                    />
                  </Card>
                ) : null}

                {certsPending > 0 ? (
                  <Card padded={false} style={styles.rowCard}>
                    <ListRow
                      icon={
                        <IconTile bg={colors.amberTint}>
                          <ShieldCheck size={control.icon.lg} color={colors.amber} strokeWidth={2} />
                        </IconTile>
                      }
                      label="Certificates"
                      sub={certsSub}
                      onPress={() => { haptics.tap(); goCerts(); }}
                      rightInteractive
                      showChevron={false}
                      right={<Button label="Install" size="sm" onPress={goCerts} style={styles.rowAction} />}
                    />
                  </Card>
                ) : null}

                {!broadcastAcked ? (
                  // Not a ListRow: the broadcast body is a paragraph, and ListRow
                  // clamps its `sub` to two lines — which would silently eat copy.
                  <Card style={styles.broadcastCard}>
                    <View style={styles.broadcastDot}>
                      <StatusDot color={colors.info} label="New" labelHidden />
                    </View>
                    <View style={styles.broadcastText}>
                      <AppText variant="bodySemibold" size="footnote">From your IT team</AppText>
                      <AppText variant="body" size="caption" color={colors.muted}>
                        Secure tunnel maintenance Saturday 2–4 AM IST. Sessions may briefly drop.
                      </AppText>
                    </View>
                    <Button label="Got it" size="sm" variant="secondary" onPress={ackBroadcast} style={styles.rowAction} />
                  </Card>
                ) : null}
              </View>
            </>
          ) : (
            <>
              <AppText variant="displaySemibold" size="body" style={styles.sectionLabel}>Your device</AppText>
              <Card padded={false} style={styles.rowCard}>
                <ListRow
                  icon={
                    <IconTile bg={colors.successTint}>
                      <ShieldCheck size={control.icon.lg} color={colors.success} strokeWidth={2} />
                    </IconTile>
                  }
                  label="You’re all caught up"
                  sub={`Nothing needs you right now · synced ${lastSync}`}
                  showChevron={false}
                />
              </Card>
            </>
          )}
          </Entrance>

          {/* ---- privacy signature ---- */}
          <Entrance delay={200}>
          <AppText variant="displaySemibold" size="body" style={styles.sectionLabel}>Your privacy</AppText>
          <Card
            padded={false}
            style={styles.rowCard}
            onPress={() => { haptics.tap(); navigation.navigate('Privacy'); }}
            accessibilityLabel={`${privacyLabel}. ${privacySub}`}
          >
            <ListRow
              icon={
                <IconTile bg={colors.successTint}>
                  <EyeOff size={control.icon.lg} color={colors.success} strokeWidth={2} />
                </IconTile>
              }
              label={privacyLabel}
              sub={privacySub}
              showChevron={false}
              right={<ChevronRight size={control.icon.sm} color={colors.faint} strokeWidth={2.2} />}
            />
          </Card>
          </Entrance>

        </View>
      </ScrollView>
    </View>
  );
}

function QuickTile({
  icon, label, badge, active, onPress,
}: {
  icon: React.ReactNode; label: string; badge?: number; active?: boolean; onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      android_ripple={ripple(colors.surfaceActive) ?? undefined}
      accessibilityRole="button"
      accessibilityLabel={badge && badge > 0 ? `${label}, ${badge} pending` : label}
      style={({ pressed }) => [
        styles.qtile,
        { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
    >
      {badge && badge > 0 ? (
        <View style={[styles.qbadge, { backgroundColor: colors.text }]}>
          <AppText variant="bodyBold" size="micro" color={colors.bg}>{badge}</AppText>
        </View>
      ) : null}
      <IconTile bg={colors.surfaceSunken}>{icon}</IconTile>
      <AppText variant="bodySemibold" size="micro" color={colors.text2}>{label}</AppText>
      {/* live = a breathing dot, not a static underline: it reads as "running now". */}
      {active ? (
        <View style={styles.qactive}>
          <PulseDot color={colors.successStrong} size={7} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: layout.rowGap },
  bellDot: { position: 'absolute', top: space[2], right: space[2], width: space[2], height: space[2], borderRadius: space[1] },
  greet: { letterSpacing: -0.4, marginTop: layout.blockGap, marginBottom: layout.captionGap },
  statusLine: { marginTop: layout.blockGap },
  body: { paddingHorizontal: layout.gutter, paddingTop: layout.blockGap },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: layout.cardGap },
  qtile: { width: '31.5%', borderWidth: 1, borderRadius: 16, paddingVertical: layout.cardPad, alignItems: 'center', gap: layout.labelGap, position: 'relative', overflow: 'hidden' },
  qbadge: { position: 'absolute', top: space[2], right: space[2], minWidth: space[4], height: space[4], borderRadius: space[4] / 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[1], zIndex: 2 },
  qactive: { position: 'absolute', top: space[2], right: space[2] },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: layout.sectionGap, marginBottom: layout.labelGap },
  countPill: { minWidth: space[5], height: space[5], borderRadius: space[5] / 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[1] },
  sectionLabel: { marginTop: layout.sectionGap, marginBottom: layout.labelGap },
  sectionLabelFirst: { marginTop: space[0] },
  cardGroup: { gap: layout.cardGap },
  rowCard: { overflow: 'hidden' },
  rowAction: { paddingHorizontal: space[3] },
  broadcastCard: { flexDirection: 'row', alignItems: 'flex-start', gap: layout.rowGap },
  // Sits the dot on the first line's optical centre: (18 lineHeight - 8 dot) / 2.
  broadcastDot: { paddingTop: space[1] },
  broadcastText: { flex: 1, gap: layout.captionGap },
});
