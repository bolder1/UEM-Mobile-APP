import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Power, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SpinningDashedRing } from '../../components/Animations';
import { useAppStore, ORG_NAME, DEFAULT_USER_NAME } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Vpn'>;

const RING_SIZE = 206;
const BTN_SIZE = 180;

export function VpnScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const vpn = useAppStore((s) => s.vpn);
  const vpnSecs = useAppStore((s) => s.vpnSecs);
  const toggleVpn = useAppStore((s) => s.toggleVpn);
  const form = useAppStore((s) => s.form);

  const vpnOn = vpn === 'on';
  const vpnConnecting = vpn === 'connecting';

  const mm = Math.floor(vpnSecs / 60);
  const ss = ('0' + (vpnSecs % 60)).slice(-2);

  const ringColor = vpnOn ? colors.success : vpnConnecting ? colors.primary : colors.dotInactive;
  const btnLabel = vpnOn ? 'Connected' : vpnConnecting ? 'Connecting…' : 'Connect';
  const btnLabelColor = vpnOn ? colors.success : vpnConnecting ? colors.primary : colors.text3;
  const headline = vpnOn ? 'Tap to disconnect from your VPN' : 'Tap to connect to your VPN';
  const description = vpnOn
    ? `Your traffic is encrypted end to end through ${ORG_NAME}'s WireGuard® gateway. Work apps stay reachable while this is on.`
    : `Connect to reach ${ORG_NAME}'s internal apps and services securely from anywhere. Personal traffic never passes through this tunnel.`;

  const email = form.email || 'priya.sharma@acme.com';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <ScreenHeader title="VPN configuration" onBack={() => navigation.goBack()} />
        <Pressable hitSlop={8} style={styles.logsBtn}>
          <AppText variant="bodySemibold" color={colors.muted} style={{ fontSize: 13 }}>
            View Logs
          </AppText>
        </Pressable>
      </View>

      <View style={styles.center}>
        <View style={[styles.emailPill, { backgroundColor: colors.surfaceSunken }]}>
          <View style={[styles.emailDot, { backgroundColor: colors.primary }]} />
          <AppText variant="bodyMedium" style={{ fontSize: 13.5 }}>
            {email}
          </AppText>
        </View>

        {vpnOn && (
          <View style={styles.timerBlock}>
            <AppText variant="body" color={colors.text3} style={{ fontSize: 13.5 }}>
              Connecting Time
            </AppText>
            <AppText variant="display" style={styles.timer}>
              {mm}:{ss}
            </AppText>
          </View>
        )}

        <View style={styles.ringWrap}>
          {vpnConnecting && <SpinningDashedRing size={RING_SIZE} color={colors.primary} duration={1400} strokeWidth={3} opacity={0.9} />}
          <Pressable
            onPress={toggleVpn}
            style={({ pressed }) => [
              styles.bigBtn,
              {
                borderColor: ringColor,
                backgroundColor: colors.surface,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            {vpnOn ? (
              <Check size={44} color={colors.success} strokeWidth={2} />
            ) : (
              <Power size={44} color={vpnConnecting ? colors.primary : colors.text2} strokeWidth={2} />
            )}
            <AppText variant="bodyMedium" color={btnLabelColor} style={{ fontSize: 16, marginTop: 24 }}>
              {btnLabel}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.textBlock}>
          <AppText variant="bodySemibold" style={{ fontSize: 16, textAlign: 'center' }}>
            {headline}
          </AppText>
          <AppText variant="body" color={colors.text3} style={{ fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 10 }}>
            {description}
          </AppText>
        </View>
      </View>

      <AppText variant="body" color={colors.muted2} style={styles.footer}>
        Managed by {ORG_NAME} IT
      </AppText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logsBtn: { paddingBottom: 14, paddingLeft: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  emailPill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 10 },
  emailDot: { width: 8, height: 8, borderRadius: 4 },
  timerBlock: { alignItems: 'center', gap: 6 },
  timer: { fontSize: 32 },
  ringWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  bigBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 3,
  },
  textBlock: { paddingHorizontal: 8, maxWidth: 340 },
  footer: { fontSize: 12, textAlign: 'center', paddingBottom: 20 },
});
