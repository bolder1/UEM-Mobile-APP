import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Lock, Smartphone, MapPin, Star } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { IconTile } from '../../components/IconTile';
import { ToggleSwitch } from '../../components/ToggleSwitch';
import { useAppStore } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

export function PermissionsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const perms = useAppStore((s) => s.perms);
  const setPerm = useAppStore((s) => s.setPerm);

  const requiredOk = perms.notif && perms.vpn && perms.mgmt;
  const grantedCount = [perms.notif, perms.vpn, perms.mgmt].filter(Boolean).length;

  const enter = () => {
    if (requiredOk) navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AppText variant="display" style={styles.title}>
          A few permissions
        </AppText>
        <AppText variant="body" color={colors.text3} style={styles.subtitle}>
          Each says exactly why it&rsquo;s needed. Turn on the three required ones to continue — change any of
          them later in Profile.
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Card style={{ overflow: 'hidden' }} padded={false}>
          <PermRow
            icon={<Bell size={19} color={colors.text3} strokeWidth={2} />}
            title="Notifications"
            required
            desc="IT broadcasts and required actions reach you."
            granted={perms.notif}
            onChange={(v) => setPerm('notif', v)}
            bordered
          />
          <PermRow
            icon={<Lock size={19} color={colors.text3} strokeWidth={2} />}
            title="Secure tunnel"
            required
            desc="Lets the app create the WireGuard® tunnel to work."
            granted={perms.vpn}
            onChange={(v) => setPerm('vpn', v)}
            bordered
          />
          <PermRow
            icon={<Smartphone size={19} color={colors.text3} strokeWidth={2} />}
            title="Device management"
            required
            desc="Creates the work profile for apps and policy."
            granted={perms.mgmt}
            onChange={(v) => setPerm('mgmt', v)}
            bordered
          />
          <PermRow
            icon={<MapPin size={19} color={colors.text3} strokeWidth={2} />}
            title="Location"
            desc="Office geofence check-in only. Off by default."
            granted={perms.loc}
            onChange={(v) => setPerm('loc', v)}
          />
        </Card>

        <AppText variant="body" color={colors.muted2} style={styles.footNote}>
          See exactly what your company can and can&rsquo;t see anytime from Profile → Privacy.
        </AppText>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={requiredOk ? 'Continue to your workspace' : `Turn on ${3 - grantedCount} more to continue`}
          onPress={enter}
          disabled={!requiredOk}
        />
      </View>
    </SafeAreaView>
  );
}

function PermRow({
  icon,
  title,
  required,
  desc,
  granted,
  onChange,
  bordered,
}: {
  icon: React.ReactNode;
  title: string;
  required?: boolean;
  desc: string;
  granted: boolean;
  onChange: (v: boolean) => void;
  bordered?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.permRow, bordered && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}>
      <View style={[styles.tile, { backgroundColor: colors.surfaceSunken }]}>{icon}</View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.titleRow}>
          <AppText variant="bodySemibold" style={{ fontSize: 14 }}>
            {title}
          </AppText>
          {required ? (
            <View style={[styles.reqPill, { backgroundColor: colors.primaryTint }]}>
              <Star size={9} color={colors.primaryStrong} strokeWidth={2.6} fill={colors.primaryStrong} />
              <AppText variant="bodyBold" color={colors.primaryStrong} style={{ fontSize: 9.5, letterSpacing: 0.2 }}>
                Required
              </AppText>
            </View>
          ) : (
            <AppText variant="bodySemibold" color={colors.muted2} style={{ fontSize: 10.5 }}>
              Optional
            </AppText>
          )}
        </View>
        <AppText variant="body" color={colors.muted} style={{ fontSize: 12, lineHeight: 17, marginTop: 2 }}>
          {desc}
        </AppText>
      </View>
      <ToggleSwitch value={granted} onChange={onChange} onColor={required ? colors.primary : colors.success} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 23, marginBottom: 6 },
  subtitle: { fontSize: 13, lineHeight: 19 },
  list: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, paddingHorizontal: 14 },
  tile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flex: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  reqPill: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2.5 },
  footNote: { fontSize: 11.5, lineHeight: 17, marginTop: 14, marginHorizontal: 6 },
  footer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
});
