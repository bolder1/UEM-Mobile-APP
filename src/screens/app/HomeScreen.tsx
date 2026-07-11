import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Bell, Lock, Folder, LayoutGrid, ShieldCheck, EyeOff, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { DarkPanel } from '../../components/DarkPanel';
import {
  useAppStore, ORG_NAME, DEFAULT_USER_NAME, pendingCertCount, unreadNotifCount,
} from '../../state/store';
import { haptics } from '../../utils/haptics';
import { ripple } from '../../theme/platform';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const form = useAppStore((s) => s.form);
  const vpn = useAppStore((s) => s.vpn);
  const certs = useAppStore((s) => s.certs);
  const appSt = useAppStore((s) => s.appSt);
  const broadcastAcked = useAppStore((s) => s.broadcastAcked);
  const ackBroadcast = useAppStore((s) => s.ackBroadcast);
  const lastSync = useAppStore((s) => s.lastSync);
  const syncing = useAppStore((s) => s.syncing);
  const syncNow = useAppStore((s) => s.syncNow);
  const notifications = useAppStore((s) => s.notifications);
  const unreadNotifs = unreadNotifCount(notifications);

  const userName = form.name || DEFAULT_USER_NAME;
  const firstName = userName.split(' ')[0];
  const initials = userName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const certsPending = pendingCertCount(certs);
  const appsToAct = Object.values(appSt).filter((s) => s === 'available' || s === 'update').length;
  const vpnOn = vpn === 'on';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const onRefresh = () => {
    if (!syncing) syncNow();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={syncing} onRefresh={onRefresh} tintColor={colors.muted} />}
      >
        {/* ---- dark greeting header ---- */}
        <DarkPanel style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 26 }}>
          <View style={styles.brandRow}>
            <Image source={require('../../../assets/logo-mark.png')} style={{ width: 22, height: 22 }} resizeMode="contain" />
            <AppText variant="bodySemibold" color="#FFFFFF" style={{ fontSize: 13.5, flex: 1 }}>
              UEM Companion
            </AppText>
            <Pressable
              onPress={() => {
                haptics.tap();
                navigation.navigate('Notifications');
              }}
              hitSlop={6}
              style={styles.iconBtn}
            >
              <Bell size={17} color="#FFFFFF" strokeWidth={2} />
              {unreadNotifs > 0 ? <View style={[styles.bellDot, { backgroundColor: colors.primary }]} /> : null}
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Profile')} style={[styles.avatar, { backgroundColor: colors.primary }]} hitSlop={4}>
              <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 12.5 }}>
                {initials}
              </AppText>
            </Pressable>
          </View>

          <AppText variant="display" color="#FFFFFF" style={styles.greet}>
            {greeting}, {firstName}
          </AppText>
          <AppText variant="body" color="rgba(255,255,255,0.55)" style={{ fontSize: 12.5 }}>
            {ORG_NAME} · secure workspace
          </AppText>

          <View style={styles.hchip}>
            <View style={[styles.dot, { backgroundColor: vpnOn ? colors.successStrong : '#3DBB7D' }]} />
            <AppText variant="bodySemibold" color="rgba(255,255,255,0.9)" style={{ fontSize: 12 }}>
              {vpnOn ? 'Secure tunnel on · WireGuard®' : `Compliant · synced ${lastSync}`}
            </AppText>
          </View>
        </DarkPanel>

        <View style={styles.body}>
          {/* ---- uniform quick tiles ---- */}
          <View style={styles.quads}>
            <Quad label="Tunnel" active={vpnOn} onPress={() => navigation.navigate('Vpn')}
              icon={<Lock size={19} color={colors.text3} strokeWidth={2} />} />
            <Quad label="Files" onPress={() => navigation.navigate('Files')}
              icon={<Folder size={19} color={colors.text3} strokeWidth={2} />} />
            <Quad label="Apps" badge={appsToAct} onPress={() => navigation.navigate('Apps')}
              icon={<LayoutGrid size={19} color={colors.text3} strokeWidth={2} />} />
            <Quad label="Certs" badge={certsPending} onPress={() => navigation.navigate('Certs')}
              icon={<ShieldCheck size={19} color={colors.text3} strokeWidth={2} />} />
          </View>

          {/* ---- privacy signature ---- */}
          <AppText variant="displaySemibold" style={styles.sectionLabel}>Your privacy</AppText>
          <Pressable onPress={() => { haptics.tap(); navigation.navigate('Privacy'); }}>
            <Card style={styles.rowCard}>
              <View style={[styles.rowIcon, { backgroundColor: colors.successTint }]}>
                <EyeOff size={20} color={colors.success} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="bodySemibold" style={{ fontSize: 14 }}>What {ORG_NAME} can see</AppText>
                <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
                  {form.own === 'company' ? 'Company device · 6 things visible' : '9 things stay private · 6 visible'}
                </AppText>
              </View>
              <ChevronRight size={17} color={colors.faint} strokeWidth={2.2} />
            </Card>
          </Pressable>

          {/* ---- needs your action ---- */}
          {(certsPending > 0 || !broadcastAcked) ? (
            <AppText variant="displaySemibold" style={styles.sectionLabel}>Needs your action</AppText>
          ) : null}
          <View style={{ gap: 10 }}>
            {certsPending > 0 ? (
              <Pressable onPress={() => { haptics.tap(); navigation.navigate('Certs'); }}>
                <Card style={styles.rowCard}>
                  <View style={[styles.rowIcon, { backgroundColor: colors.amberTint }]}>
                    <ShieldCheck size={20} color={colors.amber} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodySemibold" style={{ fontSize: 14 }}>Certificates</AppText>
                    <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
                      {certsPending} {certsPending === 1 ? 'needs' : 'need'} installing · Wi-Fi &amp; tunnel
                    </AppText>
                  </View>
                  <View style={[styles.pill, { backgroundColor: colors.primary }]}>
                    <AppText variant="bodySemibold" color="#FFFFFF" style={{ fontSize: 12 }}>Install</AppText>
                  </View>
                </Card>
              </Pressable>
            ) : null}

            {!broadcastAcked ? (
              <Card style={[styles.rowCard, { alignItems: 'flex-start' }]}>
                <View style={[styles.miniDot, { backgroundColor: colors.info, marginTop: 6 }]} />
                <View style={{ flex: 1 }}>
                  <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>From your IT team</AppText>
                  <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 1, lineHeight: 17 }}>
                    Tunnel gateway maintenance Saturday 2–4 AM IST. Sessions may briefly drop.
                  </AppText>
                </View>
                <Pressable
                  onPress={() => { haptics.tap(); ackBroadcast(); }}
                  style={[styles.pillOutline, { borderColor: colors.borderStrong }]}
                >
                  <AppText variant="bodySemibold" color={colors.text2} style={{ fontSize: 12 }}>Got it</AppText>
                </Pressable>
              </Card>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Quad({
  icon, label, badge, active, onPress,
}: {
  icon: React.ReactNode; label: string; badge?: number; active?: boolean; onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      android_ripple={ripple(colors.surfaceActive) ?? undefined}
      style={({ pressed }) => [
        styles.quad,
        { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}
    >
      {badge && badge > 0 ? (
        <View style={[styles.quadBadge, { backgroundColor: colors.text }]}>
          <AppText variant="bodyBold" color={colors.bg} style={{ fontSize: 9.5 }}>{badge}</AppText>
        </View>
      ) : null}
      <View style={[styles.quadIcon, { backgroundColor: colors.surfaceSunken }]}>{icon}</View>
      <AppText variant="bodySemibold" color={colors.text2} style={{ fontSize: 10.5 }}>{label}</AppText>
      {active ? <View style={[styles.activeBar, { backgroundColor: colors.successStrong }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 2 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.09)', alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 3.5 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginLeft: 2 },
  greet: { fontSize: 24, letterSpacing: -0.4, marginTop: 18, marginBottom: 4 },
  hchip: {
    flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 15, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  body: { paddingHorizontal: 20, paddingTop: 18 },
  quads: { flexDirection: 'row', gap: 9 },
  quad: { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 13, alignItems: 'center', gap: 8, position: 'relative', overflow: 'hidden' },
  quadIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quadBadge: { position: 'absolute', top: 8, right: 9, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, zIndex: 2 },
  activeBar: { position: 'absolute', bottom: 0, left: 14, right: 14, height: 3, borderRadius: 2 },
  sectionLabel: { fontSize: 14, marginTop: 22, marginBottom: 10, marginHorizontal: 2 },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  rowIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pill: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  pillOutline: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  miniDot: { width: 7, height: 7, borderRadius: 3.5 },
});
