import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Lock, Smartphone, MapPin, Star } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { IconTile } from '../../components/IconTile';
import { ListRow } from '../../components/ListRow';
import { ToggleSwitch } from '../../components/ToggleSwitch';
import { useAppStore } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { space, layout, control } from '../../theme/spacing';

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

  // Grants the three required permissions only. Location is deliberately left
  // out: it is optional, "off by default" is a promise this screen makes, and
  // setPerm audit-logs it — a bulk accept must not opt you into being seen.
  const allowRequired = () => {
    setPerm('notif', true);
    setPerm('vpn', true);
    setPerm('mgmt', true);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AppText variant="display" size="display" accessibilityRole="header" style={styles.title}>
          A few permissions
        </AppText>
        <AppText variant="body" size="footnote" color={colors.text3}>
          Each says exactly why it&rsquo;s needed. Turn on the three required ones to continue — change any of
          them later in Profile.
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Card style={{ overflow: 'hidden' }} padded={false}>
          <PermRow
            icon={<Bell size={control.icon.lg} color={colors.text3} strokeWidth={2} />}
            title="Notifications"
            required
            desc="IT broadcasts and required actions reach you."
            granted={perms.notif}
            onChange={(v) => setPerm('notif', v)}
            bordered
          />
          <PermRow
            icon={<Lock size={control.icon.lg} color={colors.text3} strokeWidth={2} />}
            title="Secure tunnel"
            required
            desc="Lets the app create the WireGuard® tunnel to work."
            granted={perms.vpn}
            onChange={(v) => setPerm('vpn', v)}
            bordered
          />
          <PermRow
            icon={<Smartphone size={control.icon.lg} color={colors.text3} strokeWidth={2} />}
            title="Device management"
            required
            desc="Creates the work profile for apps and policy."
            granted={perms.mgmt}
            onChange={(v) => setPerm('mgmt', v)}
            bordered
          />
          <PermRow
            icon={<MapPin size={control.icon.lg} color={colors.text3} strokeWidth={2} />}
            title="Location"
            desc="Office geofence check-in only. Off by default."
            granted={perms.loc}
            onChange={(v) => setPerm('loc', v)}
          />
        </Card>

        <AppText variant="body" size="caption" color={colors.muted2} style={styles.footNote}>
          See exactly what your company can and can&rsquo;t see anytime from Profile → Privacy.
        </AppText>
      </ScrollView>

      <View style={styles.footer}>
        {/* One-tap way past the gate — drops out once there's nothing left to grant. */}
        {!requiredOk && (
          <Button
            label="Allow all required"
            variant="ghost"
            size="md"
            onPress={allowRequired}
            style={{ marginBottom: space[2] }}
          />
        )}
        <Button
          label={requiredOk ? 'Continue' : `Turn on ${3 - grantedCount} more to continue`}
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
    <ListRow
      icon={<IconTile bg={colors.surfaceSunken}>{icon}</IconTile>}
      label={title}
      sub={desc}
      bordered={bordered}
      // The switch is this row's only action, so it stays its own a11y node
      // rather than something a tappable row would swallow.
      rightInteractive
      right={
        <View style={styles.trailing}>
          {required ? (
            <View style={[styles.reqPill, { backgroundColor: colors.primaryTint }]}>
              <Star size={9} color={colors.primaryStrong} strokeWidth={2.6} fill={colors.primaryStrong} />
              <AppText variant="bodyBold" size="micro" color={colors.primaryStrong} style={{ letterSpacing: 0.2 }}>
                Required
              </AppText>
            </View>
          ) : (
            <AppText variant="bodySemibold" size="micro" color={colors.muted2}>
              Optional
            </AppText>
          )}
          {/* All four switches announced as an anonymous "switch, on" before
              this — you could not tell which permission you had just granted. */}
          <ToggleSwitch
            value={granted}
            onChange={onChange}
            onColor={required ? colors.primary : colors.success}
            label={title}
            hint={desc}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // One gutter, app-wide: header, list and footer all sit on `layout.gutter`.
  // This screen used to run its own 24.
  header: { paddingHorizontal: layout.gutter, paddingTop: layout.screenTop },
  title: { marginBottom: layout.captionGap },
  list: { paddingHorizontal: layout.gutter, paddingTop: layout.blockGap, paddingBottom: layout.labelGap },
  trailing: { alignItems: 'flex-end', gap: space[2] },
  reqPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    borderRadius: 99,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
  },
  footNote: { marginTop: layout.blockGap },
  footer: { paddingHorizontal: layout.gutter, paddingTop: layout.cardGap, paddingBottom: layout.screenBottom },
});
