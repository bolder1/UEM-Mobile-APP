import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Palette,
  Bell,
  EyeOff,
  Activity as ActivityIcon,
  Smartphone,
  Headphones,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Menu,
  ShieldAlert,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { ListRow } from '../../components/ListRow';
import { Avatar } from '../../components/Avatar';
import { StatusDot } from '../../components/StatusDot';
import { Entrance, PressableScale, CountUp } from '../../components/Motion';
import { MONO, type as typeScale } from '../../theme/typography';
import { space, layout, control } from '../../theme/spacing';
import {
  useAppStore,
  ORG_NAME,
  DEFAULT_USER_NAME,
  pendingCertCount,
  unreadNotifCount,
  policyChecks,
  passedCheckCount,
} from '../../state/store';
import { PRIVACY_VISIBLE_COUNT, PRIVACY_PRIVATE_COUNT } from '../../data/mockData';
import { haptics } from '../../utils/haptics';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

/* Grouped-list profile: identity, a neutral compliance strip, then plain rows
 * with monochrome icons. One accent (primary) for the avatar, success only for
 * the managed/compliant dot, danger only for unenrollment. */

/** Matches ScreenHeader's nav box, so every back/menu control in the app is one size. */
const NAV_BOX = 38;

export function ProfileScreen({ navigation }: Props) {
  const { colors, isDark, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const form = useAppStore((s) => s.form);
  const certs = useAppStore((s) => s.certs);
  const perms = useAppStore((s) => s.perms);
  const approved = useAppStore((s) => s.approved);
  const appSt = useAppStore((s) => s.appSt);
  const activity = useAppStore((s) => s.activity);
  const notifications = useAppStore((s) => s.notifications);
  const lastSync = useAppStore((s) => s.lastSync);
  const openChat = useAppStore((s) => s.openChat);
  const logActivity = useAppStore((s) => s.logActivity);
  const setDrawer = useAppStore((s) => s.setDrawer);
  const [unOpen, setUnOpen] = useState(false);
  const [unVal, setUnVal] = useState('');

  const userName = form.name || DEFAULT_USER_NAME;
  const initials = userName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const appsInstalled = Object.values(appSt).filter((s) => s === 'installed').length;
  const certsInstalled = Object.values(certs).filter((v) => v === 'installed').length;
  const certsTotal = Object.keys(certs).length;
  const unreadNotifs = unreadNotifCount(notifications);
  const certsPending = pendingCertCount(certs);
  const canRemove = unVal.trim().toUpperCase() === 'REMOVE';

  const checks = policyChecks({ approved, perms, certs });
  const checksPassed = passedCheckCount(checks);

  const doUnenroll = () => {
    if (!canRemove) return;
    logActivity(
      'enroll',
      'Device removed from management',
      'Work apps, files and the secure tunnel removed',
      'you',
    );
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Left' }] });
  };

  // Identity receipt line — ownership · enrollment · employee id (when known).
  const empId = (form.empId || '').trim();
  const idLine = [
    form.own === 'company' ? 'Company-owned' : 'Personal device',
    'Enrolled Jun 18',
    empId || null,
  ]
    .filter(Boolean)
    .join(' · ');

  // Every row icon is the same weight and the same neutral colour — no rainbow.
  const rowIcon = (Icon: typeof Palette) => <Icon size={17} color={colors.text3} strokeWidth={1.9} />;

  const certsNudgeLabel = `${certsPending} ${certsPending === 1 ? 'certificate needs' : 'certificates need'} installing`;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          // No tab bar to clear (MainTabNavigator renders `tabBar={() => null}`),
          // so the bottom rest is the home indicator plus the page's own gap.
          contentContainerStyle={{
            paddingTop: insets.top + layout.screenTop,
            paddingHorizontal: layout.gutter,
            paddingBottom: insets.bottom + layout.screenBottom,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* header row: back to Home (left) · drawer menu (right) */}
          <Entrance delay={0}>
            <View style={styles.navRow}>
              <IconButton
                icon={<ChevronLeft size={18} color={colors.text2} strokeWidth={2.2} />}
                onPress={() => navigation.navigate('Home')}
                accessibilityLabel="Back to Home"
                variant="neutral"
                size={NAV_BOX}
              />
              <IconButton
                icon={<Menu size={18} color={colors.text2} strokeWidth={2.2} />}
                onPress={() => setDrawer(true)}
                accessibilityLabel="Open menu"
                variant="neutral"
                size={NAV_BOX}
              />
            </View>
          </Entrance>

          {/* identity */}
          <Entrance delay={60}>
            <View style={styles.idRow}>
              <Avatar initials={initials} color={colors.primary} size={space[14]} name={userName} />
              <View style={styles.idText}>
                <AppText variant="display" size="title" style={{ letterSpacing: -0.3 }} numberOfLines={1}>
                  {userName}
                </AppText>
                <AppText variant="body" size="caption" color={colors.muted} numberOfLines={1}>
                  {form.dept} · {ORG_NAME}
                </AppText>
              </View>
            </View>
            <View style={styles.idLineRow}>
              {/* The receipt line is an identity string, not a status word — so the
                  dot carries "managed" to the screen reader on its own. */}
              <StatusDot color={colors.success} label="Managed" labelHidden />
              <AppText color={colors.muted2} size="micro" style={styles.idLine} numberOfLines={1}>
                {idLine}
              </AppText>
            </View>
          </Entrance>

          {/* neutral compliance strip */}
          <Entrance delay={120} style={{ marginTop: layout.blockGap }}>
            <Card style={styles.stats} padded={false}>
              <Stat value={appsInstalled} label="APPS" />
              <Divider />
              <Stat value={certsInstalled} formatter={(n) => `${Math.round(n)}/${certsTotal}`} label="CERTIFICATES" />
              <Divider />
              {/* Was `value={100}` with a "COMPLIANT" label — a literal that
                  could never render anything else, next to two certificates
                  that were not installed. This counts, and it can fail. */}
              <Stat
                value={checksPassed}
                formatter={(n) => `${Math.round(n)}/${checks.length}`}
                label="CHECKS PASSED"
                a11y={`Policy checks, ${checksPassed} of ${checks.length} passed`}
              />
            </Card>
          </Entrance>

          {/* Transparency — the product's whole thesis, so it leads.
              This was four rows ("Work apps", "Location", "Personal data",
              "Privacy & what IT sees") that ALL navigated to the same Privacy
              screen: four taps advertising one destination, and none of them
              said anything the destination doesn't. It is one row now, and it
              carries the real counts instead of a teaser — show, don't claim. */}
          <Section label="TRANSPARENCY" delay={180}>
            <Row
              icon={rowIcon(EyeOff)}
              label={`What ${ORG_NAME} can see`}
              sub={`${PRIVACY_VISIBLE_COUNT} visible · ${PRIVACY_PRIVATE_COUNT} stay private`}
              a11y={`What ${ORG_NAME} can see: ${PRIVACY_VISIBLE_COUNT} things visible, ${PRIVACY_PRIVATE_COUNT} stay private. Opens privacy details`}
              onPress={() => navigation.navigate('Privacy')}
              bordered
            />
            <Row
              icon={rowIcon(ActivityIcon)}
              label="Activity"
              sub="Every change, logged"
              value={`${activity.length}`}
              a11y={`Activity, ${activity.length} entries. Opens the log`}
              onPress={() => navigation.navigate('Activity')}
            />
          </Section>

          {/* Everything else Profile owns. The drawer deliberately carries none
              of these (see Drawer.tsx), so this group is their only way in. */}
          <Section label="SETTINGS" delay={240}>
            <Row
              icon={rowIcon(Bell)}
              label="Notifications"
              value={unreadNotifs > 0 ? `${unreadNotifs} new` : undefined}
              onPress={() => navigation.navigate('Notifications')}
              bordered
            />
            <Row
              icon={rowIcon(Palette)}
              label="Appearance"
              onPress={() => navigation.navigate('Appearance')}
              bordered
            />
            <Row
              icon={rowIcon(Smartphone)}
              label="About this device"
              value={`synced ${lastSync}`}
              onPress={() => navigation.navigate('About')}
              bordered
            />
            {/* Self-serve first, ticket last: PRODUCT.md puts "contact IT" as
                the fallback, so it sits at the bottom of the list, not the top. */}
            <Row
              icon={rowIcon(Headphones)}
              label="Contact IT helpdesk"
              onPress={() => {
                openChat('it');
                navigation.navigate('ChatThread', { chatId: 'it' });
              }}
            />
          </Section>

          {certsPending > 0 ? (
            <Entrance delay={420} style={{ marginTop: layout.blockGap }}>
              <PressableScale
                onPress={() => navigation.navigate('Certs')}
                scaleTo={0.985}
                accessibilityRole="button"
                accessibilityLabel={`${certsNudgeLabel}. Opens certificates`}
              >
                <Card style={styles.nudge} padded={false}>
                  <ListRow
                    icon={<View style={styles.rowIcon}><ShieldAlert size={17} color={colors.primary} strokeWidth={2} /></View>}
                    label={certsNudgeLabel}
                    sub="Keeps Wi-Fi and the tunnel working"
                    showChevron={false}
                    right={<ChevronRight size={control.icon.sm} color={colors.faint} strokeWidth={2} />}
                  />
                </Card>
              </PressableScale>
            </Entrance>
          ) : null}

          <Entrance delay={480} style={{ marginTop: layout.blockGap }}>
            <Card style={styles.dangerCard} padded={false}>
              <ListRow
                icon={<View style={styles.rowIcon}><LogOut size={17} color={colors.danger} strokeWidth={2} /></View>}
                label="Remove this device from management"
                labelColor={colors.danger}
                showChevron={false}
                accessibilityState={{ expanded: unOpen }}
                onPress={() => {
                  haptics.tap();
                  setUnOpen(!unOpen);
                }}
              />
              {unOpen ? (
                <View style={[styles.unBody, { borderTopColor: colors.hairline }]}>
                  <AppText variant="body" size="caption" color={colors.text3} style={styles.unCopy}>
                    You&rsquo;ll lose work apps, files, chat and the secure tunnel. Your personal data is untouched.
                    Type <AppText variant="bodyBold" color={colors.text}>REMOVE</AppText> to confirm.
                  </AppText>
                  <View style={styles.unRow}>
                    <TextInput
                      value={unVal}
                      onChangeText={setUnVal}
                      placeholder="Type REMOVE"
                      placeholderTextColor={colors.muted2}
                      autoCapitalize="characters"
                      accessibilityLabel="Type REMOVE to confirm removing this device from management"
                      style={[
                        styles.unInput,
                        {
                          borderColor: colors.borderStrong,
                          backgroundColor: colors.surface,
                          color: colors.text,
                          fontFamily: fonts.body,
                        },
                      ]}
                    />
                    <Button label="Remove" size="md" variant="danger" disabled={!canRemove} onPress={doUnenroll} style={styles.unButton} />
                  </View>
                </View>
              ) : null}
            </Card>
          </Entrance>

          <AppText color={colors.muted2} size="micro" style={[styles.footerMono, { fontFamily: MONO }]}>
            UEM Companion · v3.0.0 (prototype)
          </AppText>
          <AppText variant="body" size="micro" color={colors.muted2} style={styles.footer}>
            WireGuard® tunnel engine · DPDPA-aligned privacy
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/** A labelled group of rows — uppercase micro label over a seamless card. */
function Section({ label, delay, children }: { label: string; delay: number; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Entrance delay={delay} style={{ marginTop: layout.sectionGap }}>
      <AppText variant="bodySemibold" size="micro" color={colors.muted2} style={styles.groupLabel}>
        {label}
      </AppText>
      <Card style={styles.group} padded={false}>
        {children}
      </Card>
    </Entrance>
  );
}

/** One grouped-list row: monochrome icon · label · optional value · chevron.
 *  ListRow owns the geometry; PressableScale stays outside it so the row keeps
 *  the app's press-dip (ListRow's own Pressable would flatten it). */
function Row({
  icon,
  label,
  sub,
  value,
  a11y,
  onPress,
  bordered,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  value?: string;
  a11y?: string;
  onPress: () => void;
  bordered?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={a11y ?? (value ? `${label}, ${value}` : label)}
    >
      <ListRow
        icon={<View style={styles.rowIcon}>{icon}</View>}
        label={label}
        sub={sub}
        showChevron={false}
        bordered={bordered}
        right={
          <>
            {value ? (
              <AppText variant="body" size="caption" color={colors.muted2} numberOfLines={1}>
                {value}
              </AppText>
            ) : null}
            <ChevronRight size={control.icon.sm} color={colors.faint} strokeWidth={2} />
          </>
        }
      />
    </PressableScale>
  );
}

function Stat({
  value,
  label,
  formatter,
  a11y,
}: {
  value: number;
  label: string;
  formatter?: (n: number) => string;
  /** Groups the value + label into one screen-reader node under this label. */
  a11y?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat} accessible={a11y ? true : undefined} accessibilityLabel={a11y}>
      <CountUp value={value} formatter={formatter}>
        {(display) => (
          <AppText variant="display" size="title" style={{ letterSpacing: -0.4 }}>
            {display}
          </AppText>
        )}
      </CountUp>
      <AppText variant="bodySemibold" size="micro" color={colors.muted2} style={styles.statLabel}>
        {label}
      </AppText>
    </View>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ width: 1, backgroundColor: colors.hairline }} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: layout.blockGap },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: layout.rowGap },
  idText: { flex: 1, gap: layout.captionGap },
  idLineRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: layout.blockGap },
  idLine: { letterSpacing: 0.2, flex: 1 },
  stats: { flexDirection: 'row', overflow: 'hidden' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: layout.cardPad },
  statLabel: { letterSpacing: 1, marginTop: layout.captionGap },
  groupLabel: { letterSpacing: 1.1, marginBottom: layout.labelGap },
  group: { overflow: 'hidden' },
  rowIcon: { width: control.icon.lg, alignItems: 'center' },
  nudge: { overflow: 'hidden' },
  dangerCard: { overflow: 'hidden' },
  unBody: { padding: layout.cardPad, borderTopWidth: 1 },
  unCopy: { marginBottom: layout.labelGap },
  unRow: { flexDirection: 'row', gap: layout.cardGap },
  unInput: {
    flex: 1,
    height: control.height.md,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: space[3],
    ...typeScale.footnote,
  },
  unButton: { paddingHorizontal: space[4] },
  footerMono: { textAlign: 'center', marginTop: layout.sectionGap, letterSpacing: 0.3 },
  footer: { textAlign: 'center', marginTop: layout.captionGap },
});
