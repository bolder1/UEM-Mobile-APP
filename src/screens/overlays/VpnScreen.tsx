import React from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone, Server, Lock, Shield, Power, Square, ArrowDown, ArrowUp, Signal, Activity, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAppStore, ORG_NAME } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Vpn'>;

export function VpnScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const vpn = useAppStore((s) => s.vpn);
  const vpnSecs = useAppStore((s) => s.vpnSecs);
  const vpnDown = useAppStore((s) => s.vpnDown);
  const vpnUp = useAppStore((s) => s.vpnUp);
  const vpnPing = useAppStore((s) => s.vpnPing);
  const toggleVpn = useAppStore((s) => s.toggleVpn);

  const on = vpn === 'on';
  const connecting = vpn === 'connecting';
  const mm = Math.floor(vpnSecs / 60);
  const ss = ('0' + (vpnSecs % 60)).slice(-2);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: 24 }}>
        <ScreenHeader title="Secure tunnel" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <PathViz state={vpn} />
        <AppText variant="bodyMedium" color={colors.muted2} style={styles.caption}>
          This device · Secure tunnel · {ORG_NAME} office gateway
        </AppText>

        <View style={styles.statusWrap}>
          <View style={[styles.badge, { backgroundColor: on ? colors.successTint : colors.surfaceSunken }]}>
            <View style={[styles.badgeDot, { backgroundColor: on ? colors.success : connecting ? colors.primary : colors.faint }]} />
            <AppText variant="bodyBold" color={on ? colors.success : connecting ? colors.primary : colors.muted} style={{ fontSize: 12.5 }}>
              {on ? 'Connected' : connecting ? 'Connecting…' : 'Not connected'}
            </AppText>
          </View>
          {on ? (
            <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5, marginTop: 6 }}>
              WireGuard® · office gateway · {mm}:{ss}
            </AppText>
          ) : (
            <AppText variant="body" color={colors.muted} style={styles.statusSub}>
              Turn on to reach work apps, files and internal sites.
            </AppText>
          )}
        </View>

        {on ? (
          <>
            <View style={styles.stats}>
              <Stat Icon={ArrowDown} value={`${vpnDown} Mbps`} label="Download" />
              <Stat Icon={ArrowUp} value={`${vpnUp} Mbps`} label="Upload" />
              <Stat Icon={Signal} value={`${vpnPing} ms`} label="Ping" />
            </View>
            <View style={[styles.note, { backgroundColor: colors.successTint }]}>
              <Shield size={18} color={colors.success} strokeWidth={2} />
              <AppText variant="bodyMedium" color={colors.text2} style={styles.noteText}>
                Only work traffic is routed · AES-256 end-to-end. Personal apps go direct.
              </AppText>
            </View>
            <Pressable style={[styles.linkRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Activity size={17} color={colors.text3} strokeWidth={2} />
              <AppText variant="bodySemibold" style={{ fontSize: 13, flex: 1 }}>
                View tunnel activity
              </AppText>
              <ChevronRight size={16} color={colors.faint} strokeWidth={2.2} />
            </Pressable>
          </>
        ) : (
          <>
            <View style={[styles.gwRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.gwTile, { backgroundColor: colors.primaryTint }]}>
                <Server size={18} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>Office gateway</AppText>
                <AppText variant="body" color={colors.muted} style={{ fontSize: 11.5, marginTop: 1 }}>WireGuard® · recommended</AppText>
              </View>
              <ChevronRight size={17} color={colors.faint} strokeWidth={2.2} />
            </View>
            <View style={[styles.note, { backgroundColor: colors.surfaceSunken, alignItems: 'flex-start' }]}>
              <Lock size={18} color={colors.muted} strokeWidth={2} />
              <AppText variant="bodyMedium" color={colors.text3} style={styles.noteText}>
                Only work traffic uses the tunnel — your personal apps and browsing go direct and stay private.
              </AppText>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            if (connecting) return;
            haptics.tap();
            toggleVpn();
          }}
          accessibilityRole="button"
          accessibilityLabel={on ? 'Disconnect' : 'Connect'}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: on ? colors.dangerTint : colors.primary,
              opacity: connecting ? 0.6 : pressed ? 0.92 : 1,
            },
          ]}
        >
          {on ? (
            <Square size={16} color={colors.dangerText} strokeWidth={2.2} />
          ) : (
            <Power size={17} color={colors.white} strokeWidth={2.2} />
          )}
          <AppText variant="bodySemibold" color={on ? colors.dangerText : colors.white} style={{ fontSize: 15.5 }}>
            {on ? 'Disconnect' : connecting ? 'Connecting…' : 'Connect'}
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PathViz({ state }: { state: 'off' | 'connecting' | 'on' }) {
  const { colors } = useTheme();
  const on = state === 'on';
  const wire = on ? colors.success : state === 'connecting' ? colors.primary : colors.borderStrong;
  const nodeIcon = on ? colors.text3 : colors.muted;
  const lockBg = on ? colors.success : state === 'connecting' ? colors.primary : colors.surfaceActive;
  const lockIcon = on || state === 'connecting' ? colors.white : colors.muted;
  return (
    <View style={styles.path}>
      <View style={[styles.node, { backgroundColor: colors.surfaceSunken }]}>
        <Smartphone size={22} color={nodeIcon} strokeWidth={2} />
      </View>
      <View style={[styles.wire, { backgroundColor: wire }]} />
      <View style={[styles.lockNode, { backgroundColor: lockBg }, on && { shadowColor: colors.success, shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6 }]}>
        <Lock size={27} color={lockIcon} strokeWidth={2} />
      </View>
      <View style={[styles.wire, { backgroundColor: wire }]} />
      <View style={[styles.node, { backgroundColor: colors.surfaceSunken }]}>
        <Server size={22} color={nodeIcon} strokeWidth={2} />
      </View>
    </View>
  );
}

function Stat({ Icon, value, label }: { Icon: any; value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surfaceSunken }]}>
      <Icon size={16} color={colors.text3} strokeWidth={2} />
      <AppText variant="displaySemibold" style={{ fontSize: 13.5, marginTop: 6 }}>{value}</AppText>
      <AppText variant="body" color={colors.muted2} style={{ fontSize: 10.5, marginTop: 1 }}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  path: { flexDirection: 'row', alignItems: 'center' },
  node: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  lockNode: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  wire: { flex: 1, height: 3, borderRadius: 2 },
  caption: { fontSize: 11.5, textAlign: 'center', marginTop: 12 },
  statusWrap: { alignItems: 'center', marginTop: 26 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 99, paddingHorizontal: 13, paddingVertical: 7 },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  statusSub: { fontSize: 13.5, textAlign: 'center', marginTop: 8, maxWidth: 290, lineHeight: 19 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 24 },
  stat: { flex: 1, borderRadius: 14, alignItems: 'center', paddingVertical: 14 },
  note: { flexDirection: 'row', gap: 11, alignItems: 'center', borderRadius: 14, padding: 14, marginTop: 12 },
  noteText: { fontSize: 12, lineHeight: 17, flex: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13, marginTop: 10 },
  gwRow: { flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 14, marginTop: 24 },
  gwTile: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, height: 54, borderRadius: 15 },
});
