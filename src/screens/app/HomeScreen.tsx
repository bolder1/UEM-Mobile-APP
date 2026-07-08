import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Power, Lock, Folder, LayoutGrid, BadgeCheck, RefreshCw, Cast, Smartphone, Bell, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { DotGrid } from '../../components/DotGrid';
import { Spinner } from '../../components/Animations';
import { useAppStore, ORG_NAME, DEFAULT_USER_NAME, pendingCertCount, unreadNotifCount } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { ripple } from '../../theme/platform';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const form = useAppStore((s) => s.form);
  const vpn = useAppStore((s) => s.vpn);
  const certs = useAppStore((s) => s.certs);
  const broadcastAcked = useAppStore((s) => s.broadcastAcked);
  const ackBroadcast = useAppStore((s) => s.ackBroadcast);
  const lastSync = useAppStore((s) => s.lastSync);
  const syncing = useAppStore((s) => s.syncing);
  const syncNow = useAppStore((s) => s.syncNow);
  const cast = useAppStore((s) => s.cast);
  const castTarget = useAppStore((s) => s.castTarget);
  const castSecs = useAppStore((s) => s.castSecs);
  const incomingCastSession = useAppStore((s) => s.incomingCastSession);
  const notifications = useAppStore((s) => s.notifications);
  const unreadNotifs = unreadNotifCount(notifications);

  const userName = form.name || DEFAULT_USER_NAME;
  const firstName = userName.split(' ')[0];
  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const certsPending = pendingCertCount(certs);
  const vpnOn = vpn === 'on';
  const vpnConnecting = vpn === 'connecting';

  const heroDot = vpnOn ? colors.successStrong : vpnConnecting ? colors.primary : colors.muted2;
  const heroLabel = vpnOn ? 'Secure Access — Connected' : vpnConnecting ? 'Connecting…' : 'Secure Access — Off';
  const heroSub = vpnOn
    ? 'miniOrangeVPN · WireGuard® tunnel active'
    : vpnConnecting
    ? 'Handshake with in.gw.miniorange.com'
    : 'Tap to open the secure tunnel';
  const heroBtnBg = vpnOn ? colors.success : vpnConnecting ? colors.primaryStrong : 'rgba(255,255,255,0.14)';

  const castLive = cast === 'live';
  const castElapsed = `${Math.floor(castSecs / 60)}:${('0' + (castSecs % 60)).slice(-2)}`;

  const onRefresh = () => {
    if (!syncing) syncNow();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={syncing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <View style={styles.headRow}>
          <View>
            <AppText variant="display" style={{ fontSize: 19 }}>
              Good morning, {firstName}
            </AppText>
            <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
              {ORG_NAME} · Managed by miniOrange UEM
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable
              onPress={() => {
                haptics.tap();
                navigation.navigate('Notifications');
              }}
              android_ripple={ripple(colors.surfaceActive, true) ?? undefined}
              style={[styles.bellBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              hitSlop={6}
            >
              <Bell size={18} color={colors.text2} strokeWidth={2} />
              {unreadNotifs > 0 && <View style={[styles.bellDot, { backgroundColor: colors.primary, borderColor: colors.bg }]} />}
            </Pressable>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 14 }}>
                {initials}
              </AppText>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => {
            haptics.tap();
            navigation.navigate('Vpn');
          }}
          style={({ pressed }) => [
            styles.hero,
            { backgroundColor: colors.heroBg, transform: [{ scale: pressed ? 0.985 : 1 }] },
          ]}
        >
          <DotGrid color="rgba(255,255,255,0.07)" size={14} />
          <View style={styles.heroTop}>
            <View>
              <View style={styles.heroTitleRow}>
                <View style={[styles.heroDot, { backgroundColor: heroDot, shadowColor: heroDot }]} />
                <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 16 }}>
                  {heroLabel}
                </AppText>
              </View>
              <AppText variant="body" color="rgba(255,255,255,0.55)" style={{ fontSize: 12, marginTop: 5 }}>
                {heroSub}
              </AppText>
            </View>
            <View style={[styles.heroBtn, { backgroundColor: heroBtnBg }]}>
              <Power size={24} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          </View>
          <View style={styles.heroFoot}>
            <View style={[styles.miniDot, { backgroundColor: colors.successStrong }]} />
            <AppText variant="bodyMedium" color="rgba(255,255,255,0.85)" style={{ fontSize: 12 }}>
              Device meets company policy · 4 of 4 checks
            </AppText>
          </View>
        </Pressable>

        <View style={styles.quickGrid}>
          <QuickAction icon={<Lock size={20} color={colors.primary} strokeWidth={2} />} label="Tunnel" onPress={() => navigation.navigate('Vpn')} />
          <QuickAction icon={<Folder size={20} color={colors.info} strokeWidth={2} />} label="Files" onPress={() => navigation.navigate('Files')} />
          <QuickAction icon={<LayoutGrid size={20} color={colors.violet} strokeWidth={2} />} label="Apps" onPress={() => navigation.navigate('Apps')} />
        </View>

        <SectionLabel>Security & support</SectionLabel>
        <View style={{ gap: 10 }}>
          <Pressable
            onPress={() => {
              haptics.tap();
              navigation.navigate('Certs');
            }}
          >
            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: certsPending > 0 ? colors.amberTint : colors.successTint }]}>
                <BadgeCheck size={22} color={certsPending > 0 ? colors.amber : colors.success} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="bodySemibold" style={{ fontSize: 14 }}>
                  Certificates
                </AppText>
                {certsPending > 0 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <View style={[styles.miniDot, { backgroundColor: colors.amber, marginTop: 0 }]} />
                    <AppText variant="body" color={colors.muted} style={{ fontSize: 12 }}>
                      {certsPending === 1 ? '1 certificate needs' : `${certsPending} certificates need`} your action
                    </AppText>
                  </View>
                ) : (
                  <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
                    All certificates installed
                  </AppText>
                )}
              </View>
              {certsPending > 0 ? (
                <View style={[styles.pillBtn, { backgroundColor: colors.primaryTint }]}>
                  <AppText variant="bodySemibold" color={colors.primaryStrong} style={{ fontSize: 12 }}>
                    Install
                  </AppText>
                </View>
              ) : (
                <ChevronRight size={17} color={colors.faint} strokeWidth={2.2} />
              )}
            </Card>
          </Pressable>

          <Pressable
            onPress={() => {
              haptics.tap();
              navigation.navigate('Cast');
            }}
          >
            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: castLive ? colors.successTint : colors.primaryTint }]}>
                <Cast size={21} color={castLive ? colors.success : colors.primary} strokeWidth={2} />
                {incomingCastSession && !castLive && (
                  <View style={[styles.featureIconDot, { backgroundColor: colors.primary, borderColor: colors.surface }]} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="bodySemibold" style={{ fontSize: 14 }}>
                  {castLive ? `Casting to ${castTarget?.name}` : 'Remote cast'}
                </AppText>
                {castLive ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <View style={[styles.miniDot, { backgroundColor: colors.success, marginTop: 0 }]} />
                    <AppText variant="body" color={colors.muted} style={{ fontSize: 12 }}>
                      Live · {castElapsed}
                    </AppText>
                  </View>
                ) : incomingCastSession ? (
                  <AppText variant="bodySemibold" color={colors.primary} style={{ fontSize: 12, marginTop: 2 }}>
                    IT admin wants to start a session
                  </AppText>
                ) : (
                  <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
                    Mirror to a meeting display or IT support
                  </AppText>
                )}
              </View>
              <ChevronRight size={17} color={colors.faint} strokeWidth={2.2} />
            </Card>
          </Pressable>
        </View>

        <SectionLabel>For you</SectionLabel>
        <View style={{ gap: 10 }}>
          {!broadcastAcked && (
            <Card style={[styles.feedCard, { alignItems: 'flex-start' }]}>
              <View style={[styles.miniDot, { backgroundColor: colors.info, marginTop: 5 }]} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodySemibold" style={{ fontSize: 13 }}>
                  IT broadcast
                </AppText>
                <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 1, lineHeight: 17 }}>
                  VPN gateway maintenance Saturday 2–4 AM IST. Sessions may briefly drop.
                </AppText>
              </View>
              <Pressable
                onPress={() => {
                  haptics.tap();
                  ackBroadcast();
                }}
                style={[styles.pillBtnOutline, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}
              >
                <AppText variant="bodySemibold" color={colors.text2} style={{ fontSize: 12 }}>
                  Got it
                </AppText>
              </Pressable>
            </Card>
          )}
          {broadcastAcked && (
            <View style={[styles.emptyFeed, { borderColor: colors.dotInactive }]}>
              <AppText variant="body" color={colors.muted2} style={{ fontSize: 12.5 }}>
                You&rsquo;re all caught up.
              </AppText>
            </View>
          )}
        </View>

        <SectionLabel>This device</SectionLabel>
        <Card style={styles.deviceCard}>
          <View style={[styles.deviceIcon, { backgroundColor: colors.surfaceSunken }]}>
            <Smartphone size={20} color={colors.text3} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
              {firstName}&rsquo;s iPhone
            </AppText>
            <AppText variant="body" color={colors.muted} style={{ fontSize: 11.5, marginTop: 2 }}>
              {form.own === 'company' ? 'Company-owned' : 'Personal (BYOD)'} · Last sync {lastSync}
            </AppText>
          </View>
          <Pressable
            onPress={() => {
              haptics.tap();
              syncNow();
            }}
            style={[styles.syncBtn, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}
          >
            {syncing ? (
              <Spinner>
                <RefreshCw size={13} color={colors.text2} strokeWidth={2.2} />
              </Spinner>
            ) : (
              <RefreshCw size={13} color={colors.text2} strokeWidth={2.2} />
            )}
            <AppText variant="bodySemibold" color={colors.text2} style={{ fontSize: 12 }}>
              Sync
            </AppText>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <AppText variant="displaySemibold" style={styles.sectionLabel}>
      {children}
    </AppText>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  dot,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  dot?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      android_ripple={ripple(colors.surfaceActive) ?? undefined}
      style={({ pressed }) => [
        styles.quickAction,
        { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}
    >
      {dot && <View style={[styles.qaDot, { backgroundColor: colors.primary }]} />}
      {icon}
      <AppText variant="bodySemibold" color={colors.text2} style={{ fontSize: 10.5 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 110 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bellBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 6, right: 7, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },
  featureCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  featureIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  featureIconDot: { position: 'absolute', top: -2, right: -2, width: 11, height: 11, borderRadius: 5.5, borderWidth: 2 },
  hero: { borderRadius: 20, padding: 20, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroDot: { width: 9, height: 9, borderRadius: 4.5, shadowOpacity: 0.9, shadowRadius: 6 },
  heroBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  heroFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 10,
  },
  miniDot: { width: 7, height: 7, borderRadius: 3.5 },
  quickGrid: { flexDirection: 'row', gap: 10, marginTop: 16 },
  quickAction: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 7,
    position: 'relative',
  },
  qaDot: { position: 'absolute', top: 8, right: 10, width: 8, height: 8, borderRadius: 4 },
  sectionLabel: { fontSize: 14, marginTop: 22, marginBottom: 10, marginHorizontal: 4 },
  feedCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  pillBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  pillBtnOutline: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  emptyFeed: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, padding: 18, alignItems: 'center' },
  deviceCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  deviceIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  syncBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
});
