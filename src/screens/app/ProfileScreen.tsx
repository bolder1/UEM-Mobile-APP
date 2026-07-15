import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
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
  Check,
  Menu,
  LayoutGrid,
  MapPin,
  Lock,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { DarkPanel } from '../../components/DarkPanel';
import { Entrance, PressableScale, GlowOrb, CountUp } from '../../components/Motion';
import { GlassChip, GlassPill, EmbossedDisc } from '../../components/Glass';
import { MONO } from '../../theme/typography';
import { useReducedMotion } from '../../utils/useReducedMotion';
import {
  useAppStore,
  ORG_NAME,
  DEFAULT_USER_NAME,
  pendingCertCount,
  unreadNotifCount,
} from '../../state/store';
import { haptics } from '../../utils/haptics';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** SVG ring that draws its arc on mount (strokeDashoffset, ease-out).
 *  Children render centered inside the ring. */
function DrawRing({
  size,
  strokeWidth,
  color,
  trackColor,
  progress,
  delay = 0,
  duration = 600,
  children,
}: {
  size: number;
  strokeWidth: number;
  color: string;
  trackColor: string;
  /** 0..1 — how much of the ring is lit. */
  progress: number;
  delay?: number;
  duration?: number;
  children?: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    const a = Animated.timing(v, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // drives an SVG stroke prop, not a transform
    });
    a.start();
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dashoffset = v.interpolate({ inputRange: [0, 1], outputRange: [c, c * (1 - progress)] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0, transform: [{ rotate: '-90deg' }] }}
      >
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={dashoffset as unknown as number}
        />
      </Svg>
      {children}
    </View>
  );
}

export function ProfileScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const form = useAppStore((s) => s.form);
  const certs = useAppStore((s) => s.certs);
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

  const doUnenroll = () => {
    if (!canRemove) return;
    logActivity('enroll', 'Device removed from management', 'You unenrolled this device', 'you');
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Left' }] });
  };

  // Track strokes: the hero is always a dark surface; cards follow the theme.
  const heroTrack = 'rgba(255,255,255,0.14)';
  const cardTrack = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(23,24,26,0.10)';
  const discTrack = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(23,24,26,0.09)';

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 34 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <DarkPanel style={{ paddingTop: insets.top + 14, paddingHorizontal: 22, paddingBottom: 40 }}>
            {/* ambient compliance wash — success-tinted because the device is compliant */}
            <GlowOrb
              size={260}
              colors={[colors.successStrong, colors.success]}
              opacity={0.22}
              style={{ top: -60, right: -70 }}
            />

            {/* header row: back to Home (left) · drawer menu (right) */}
            <Entrance delay={0}>
              <View style={styles.menuRow}>
                <PressableScale
                  onPress={() => navigation.navigate('Home')}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Home"
                  hitSlop={6}
                >
                  <GlassChip size={34} radius={17} on="dark">
                    <ChevronLeft size={18} color="#FFFFFF" strokeWidth={2} />
                  </GlassChip>
                </PressableScale>
                <PressableScale
                  onPress={() => setDrawer(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open menu"
                  hitSlop={6}
                >
                  <GlassChip size={34} radius={17} on="dark">
                    <Menu size={18} color="#FFFFFF" strokeWidth={2} />
                  </GlassChip>
                </PressableScale>
              </View>
            </Entrance>

            <View style={styles.heroRow}>
              {/* identity block */}
              <Entrance delay={60} style={{ flex: 1, paddingRight: 12 }}>
                <View style={styles.avatarWrap}>
                  <DrawRing size={80} strokeWidth={2.5} color={colors.successStrong} trackColor={heroTrack} progress={1}>
                    <View style={[styles.bigAvatar, { backgroundColor: colors.primary }]}>
                      <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 22 }}>
                        {initials}
                      </AppText>
                    </View>
                  </DrawRing>
                </View>
                <AppText variant="display" color="#FFFFFF" style={{ fontSize: 21, marginTop: 12, letterSpacing: -0.3 }}>
                  {userName}
                </AppText>
                <AppText variant="body" color="rgba(255,255,255,0.6)" style={{ fontSize: 12.5, marginTop: 3 }}>
                  {form.dept} · {ORG_NAME}
                </AppText>
                <GlassPill on="dark" tint={colors.successStrong} style={{ marginTop: 14 }}>
                  <View style={[styles.dot, { backgroundColor: colors.successStrong }]} />
                  <AppText variant="bodySemibold" color="rgba(255,255,255,0.9)" style={{ fontSize: 11.5 }}>
                    {form.own === 'company' ? 'Company-owned' : 'Personal device'} · enrolled Jun 18
                  </AppText>
                </GlassPill>
              </Entrance>

              {/* compliance gauge */}
              <Entrance delay={120}>
                <View accessible accessibilityLabel="Compliance 100 percent">
                  <EmbossedDisc size={120}>
                    <DrawRing size={106} strokeWidth={4} color={colors.successStrong} trackColor={discTrack} progress={1}>
                      <View style={{ alignItems: 'center' }}>
                        <CountUp value={100}>
                          {(display) => (
                            <AppText variant="display" style={{ fontSize: 27, letterSpacing: -0.5 }}>
                              {display}
                            </AppText>
                          )}
                        </CountUp>
                        <AppText
                          variant="bodySemibold"
                          color={colors.muted}
                          style={{ fontSize: 8.5, letterSpacing: 1.1, marginTop: 2 }}
                        >
                          COMPLIANCE
                        </AppText>
                      </View>
                    </DrawRing>
                  </EmbossedDisc>
                </View>
              </Entrance>
            </View>
          </DarkPanel>

          <View style={{ paddingHorizontal: 20 }}>
            {/* transparency dashboard — overlaps the hero skirt */}
            <Entrance delay={160}>
              <Card style={styles.seeCard}>
                <AppText
                  variant="bodySemibold"
                  color={colors.muted}
                  style={{ fontSize: 10.5, letterSpacing: 1.1, marginBottom: 14 }}
                >
                  WHAT IT CAN SEE
                </AppText>
                <View style={styles.seeRow}>
                  <SeeGauge
                    icon={<LayoutGrid size={15} color={colors.info} strokeWidth={2} />}
                    color={colors.info}
                    trackColor={cardTrack}
                    progress={1}
                    delay={300}
                    label="Work apps"
                    sub="visible"
                    accessibilityLabel="Work apps: visible to IT. Opens privacy details"
                    onPress={() => navigation.navigate('Privacy')}
                  />
                  <SeeGauge
                    icon={<MapPin size={15} color={colors.amber} strokeWidth={2} />}
                    color={colors.amber}
                    trackColor={cardTrack}
                    progress={0.45}
                    delay={380}
                    label="Location"
                    sub="while on tunnel"
                    accessibilityLabel="Location: visible only while on the tunnel. Opens privacy details"
                    onPress={() => navigation.navigate('Privacy')}
                  />
                  <SeeGauge
                    icon={<Lock size={15} color={colors.success} strokeWidth={2} />}
                    color={colors.success}
                    trackColor={cardTrack}
                    progress={1}
                    delay={460}
                    label="Personal"
                    sub="never visible"
                    accessibilityLabel="Personal data: never visible to IT. Opens privacy details"
                    onPress={() => navigation.navigate('Privacy')}
                  />
                </View>
              </Card>
            </Entrance>

            <Entrance delay={220}>
              <Card style={styles.stats} padded={false}>
                <Stat value={appsInstalled} label="APPS" />
                <Divider />
                <Stat value={certsInstalled} formatter={(n) => `${Math.round(n)}/${certsTotal}`} label="CERTIFICATES" />
                <Divider />
                <Stat value={100} formatter={(n) => `${Math.round(n)}%`} label="COMPLIANT" />
              </Card>
            </Entrance>

            <Entrance delay={280}>
              <Card style={styles.cells} padded={false}>
                <Cell
                  icon={<Palette size={15} color={colors.violet} strokeWidth={2} />}
                  tint={colors.violet}
                  label="Appearance"
                  onPress={() => navigation.navigate('Appearance')}
                  bordered
                />
                <Cell
                  icon={<Bell size={15} color={colors.amber} strokeWidth={2} />}
                  tint={colors.amber}
                  label="Notifications"
                  value={unreadNotifs > 0 ? `${unreadNotifs} new` : undefined}
                  onPress={() => navigation.navigate('Notifications')}
                  bordered
                />
                <Cell
                  icon={<EyeOff size={15} color={colors.info} strokeWidth={2} />}
                  tint={colors.info}
                  label="Privacy & what IT sees"
                  onPress={() => navigation.navigate('Privacy')}
                  bordered
                />
                <Cell
                  icon={<ActivityIcon size={15} color={colors.success} strokeWidth={2} />}
                  tint={colors.success}
                  label="Activity"
                  value={`${activity.length}`}
                  onPress={() => navigation.navigate('Activity')}
                  bordered
                />
                <Cell
                  icon={<Smartphone size={15} color={colors.primary} strokeWidth={2} />}
                  tint={colors.primary}
                  label="Device & sync"
                  value={`synced ${lastSync}`}
                  onPress={() => navigation.navigate('About')}
                  bordered
                />
                <Cell
                  icon={<Headphones size={15} color={colors.primary} strokeWidth={2} />}
                  tint={colors.primary}
                  label="Contact IT helpdesk"
                  onPress={() => {
                    openChat('it');
                    navigation.navigate('ChatThread', { chatId: 'it' });
                  }}
                />
              </Card>
            </Entrance>

            {certsPending > 0 ? (
              <PressableScale
                onPress={() => navigation.navigate('Certs')}
                scaleTo={0.98}
                accessibilityRole="button"
                accessibilityLabel={`${certsPending} ${certsPending === 1 ? 'certificate needs' : 'certificates need'} installing. Opens certificates`}
              >
                <Card style={styles.nudge}>
                  <View style={[styles.nudgeIcon, { backgroundColor: colors.amberTint }]}>
                    <Check size={16} color={colors.amber} strokeWidth={2.4} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodySemibold" style={{ fontSize: 13 }}>
                      {certsPending} {certsPending === 1 ? 'certificate needs' : 'certificates need'} installing
                    </AppText>
                    <AppText variant="body" color={colors.muted} style={{ fontSize: 11.5, marginTop: 1 }}>
                      Keeps Wi-Fi and the tunnel working
                    </AppText>
                  </View>
                  <ChevronRight size={16} color={colors.faint} strokeWidth={2.2} />
                </Card>
              </PressableScale>
            ) : null}

            <Card style={styles.dangerCard} padded={false}>
              <Pressable
                onPress={() => {
                  haptics.tap();
                  setUnOpen(!unOpen);
                }}
                accessibilityRole="button"
                accessibilityLabel="Remove this device from management"
                accessibilityState={{ expanded: unOpen }}
                style={({ pressed }) => [styles.dangerRow, pressed && { backgroundColor: colors.surfaceHover }]}
              >
                <LogOut size={17} color={colors.danger} strokeWidth={2} />
                <AppText variant="bodyMedium" color={colors.danger} style={{ fontSize: 13.5, flex: 1 }}>
                  Remove this device from management
                </AppText>
              </Pressable>
              {unOpen ? (
                <View style={[styles.unBody, { borderTopColor: colors.hairline }]}>
                  <AppText variant="body" color={colors.text3} style={{ fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
                    You&rsquo;ll lose work apps, files, chat and the secure tunnel. Your personal data is untouched.
                    Type <AppText variant="bodyBold" color={colors.text}>REMOVE</AppText> to confirm.
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TextInput
                      value={unVal}
                      onChangeText={setUnVal}
                      placeholder="Type REMOVE"
                      placeholderTextColor={colors.muted2}
                      autoCapitalize="characters"
                      accessibilityLabel="Type REMOVE to confirm unenrollment"
                      style={[styles.unInput, { borderColor: colors.borderStrong, backgroundColor: colors.surface, color: colors.text }]}
                    />
                    <Button label="Remove" size="md" variant="danger" disabled={!canRemove} onPress={doUnenroll} style={{ paddingHorizontal: 16 }} />
                  </View>
                </View>
              ) : null}
            </Card>

            <AppText color={colors.muted2} style={[styles.footerMono, { fontFamily: MONO }]}>
              UEM Companion · v3.0.0 (prototype)
            </AppText>
            <AppText variant="body" color={colors.muted2} style={styles.footer}>
              WireGuard® tunnel engine · DPDPA-aligned privacy
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/** One "what IT can see" category — icon in a color-coded ring that draws on
 *  mount; full ring + calm color = the honest answer at a glance. */
function SeeGauge({
  icon,
  color,
  trackColor,
  progress,
  delay,
  label,
  sub,
  accessibilityLabel,
  onPress,
}: {
  icon: React.ReactNode;
  color: string;
  trackColor: string;
  progress: number;
  delay: number;
  label: string;
  sub: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale onPress={onPress} scaleTo={0.95} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={styles.seeItem}>
      <DrawRing size={46} strokeWidth={2.5} color={color} trackColor={trackColor} progress={progress} delay={delay}>
        {icon}
      </DrawRing>
      <AppText variant="bodySemibold" style={{ fontSize: 11.5, marginTop: 8 }} numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="body" color={colors.muted} style={{ fontSize: 10.5, marginTop: 1 }} numberOfLines={1}>
        {sub}
      </AppText>
    </PressableScale>
  );
}

function Stat({
  value,
  label,
  formatter,
}: {
  value: number;
  label: string;
  formatter?: (n: number) => string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <CountUp value={value} formatter={formatter}>
        {(display) => (
          <AppText variant="display" style={{ fontSize: 19, letterSpacing: -0.4 }}>
            {display}
          </AppText>
        )}
      </CountUp>
      <AppText variant="bodySemibold" color={colors.muted} style={{ fontSize: 10, letterSpacing: 0.4, marginTop: 2 }}>
        {label}
      </AppText>
    </View>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ width: 1, backgroundColor: colors.hairline }} />;
}

function Cell({
  icon,
  tint,
  label,
  value,
  onPress,
  bordered,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value?: string;
  onPress: () => void;
  bordered?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      style={[styles.cell, bordered ? { borderBottomWidth: 1, borderBottomColor: colors.hairline } : null]}
    >
      <GlassChip size={30} radius={9} tint={tint}>
        {icon}
      </GlassChip>
      <AppText variant="bodyMedium" style={{ fontSize: 13.5, flex: 1 }}>
        {label}
      </AppText>
      {value ? (
        <AppText variant="bodySemibold" color={colors.muted2} style={{ fontSize: 12 }}>
          {value}
        </AppText>
      ) : null}
      <ChevronRight size={16} color={colors.faint} strokeWidth={2.2} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-end' },
  avatarWrap: { alignSelf: 'flex-start' },
  bigAvatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  seeCard: { marginTop: -26 },
  seeRow: { flexDirection: 'row' },
  seeItem: { flex: 1, alignItems: 'center' },
  stats: { flexDirection: 'row', marginTop: 14, overflow: 'hidden' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 15 },
  cells: { marginTop: 14, overflow: 'hidden' },
  cell: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 15 },
  nudge: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 14 },
  nudgeIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dangerCard: { overflow: 'hidden', marginTop: 14 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  unBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, paddingTop: 12 },
  unInput: { flex: 1, height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 13.5, fontFamily: 'Inter_400Regular' },
  footerMono: { fontSize: 10.5, textAlign: 'center', marginTop: 22, letterSpacing: 0.3 },
  footer: { fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 3 },
});
