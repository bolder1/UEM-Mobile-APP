import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Lock, Smartphone, MapPin, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { IconTile } from '../../components/IconTile';
import { useAppStore } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Permissions } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

export function PermissionsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const perms = useAppStore((s) => s.perms);
  const setPerm = useAppStore((s) => s.setPerm);

  const requiredOk = perms.notif && perms.vpn && perms.mgmt;

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
          Each one says exactly why it&rsquo;s needed. You can review these anytime.
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <PermRow
          icon={<Bell size={20} color={colors.primary} strokeWidth={2} />}
          tint={colors.primaryTint}
          title="Notifications"
          badge="Required"
          desc="IT broadcasts and required actions reach you here."
          granted={perms.notif}
          onAllow={() => setPerm('notif', true)}
        />
        <PermRow
          icon={<Lock size={20} color={colors.info} strokeWidth={2} />}
          tint={colors.infoTint}
          title="VPN configuration"
          badge="Required"
          desc="Lets this app create the secure tunnel to work."
          granted={perms.vpn}
          onAllow={() => setPerm('vpn', true)}
        />
        <PermRow
          icon={<Smartphone size={20} color={colors.violet} strokeWidth={2} />}
          tint={colors.violetTint}
          title="Device management"
          badge="Required"
          desc="Creates the work profile for apps and policies."
          granted={perms.mgmt}
          onAllow={() => setPerm('mgmt', true)}
        />
        <PermRow
          icon={<MapPin size={20} color={colors.success} strokeWidth={2} />}
          tint={colors.successTint}
          title="Location"
          badge="Optional"
          badgeColor={colors.info}
          badgeBg={colors.infoTint}
          desc="Used only for office geofence check-in. Off by default."
          granted={perms.loc}
          onAllow={() => setPerm('loc', true)}
          optional
        />
        <AppText variant="body" color={colors.muted2} style={styles.footNote}>
          Review what your company can and can&rsquo;t see anytime from More → About.
        </AppText>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continue to your workspace" onPress={enter} disabled={!requiredOk} />
      </View>
    </SafeAreaView>
  );
}

function PermRow({
  icon,
  tint,
  title,
  badge,
  badgeColor,
  badgeBg,
  desc,
  granted,
  onAllow,
  optional,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  badge: string;
  badgeColor?: string;
  badgeBg?: string;
  desc: string;
  granted: boolean;
  onAllow: () => void;
  optional?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Card style={styles.permCard}>
      <View style={styles.permRow}>
        <IconTile bg={tint}>{icon}</IconTile>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText variant="bodySemibold" style={{ fontSize: 14 }}>
              {title}
            </AppText>
            <View
              style={[
                styles.badge,
                { backgroundColor: badgeBg ?? colors.surfaceSunken, marginLeft: 4 },
              ]}
            >
              <AppText variant="bodySemibold" color={badgeColor ?? colors.muted} style={{ fontSize: 10.5 }}>
                {badge}
              </AppText>
            </View>
          </View>
          <AppText variant="body" color={colors.muted} style={{ fontSize: 12, lineHeight: 17, marginTop: 2 }}>
            {desc}
          </AppText>
        </View>
        {granted ? (
          <View style={styles.allowed}>
            <Check size={15} color={colors.success} strokeWidth={2.6} />
            <AppText variant="bodySemibold" color={colors.success} style={{ fontSize: 12.5 }}>
              Allowed
            </AppText>
          </View>
        ) : (
          <Button
            label="Allow"
            size="sm"
            variant={optional ? 'secondary' : 'primary'}
            onPress={onAllow}
            style={{ paddingHorizontal: 16 }}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 23, marginBottom: 6 },
  subtitle: { fontSize: 13.5, lineHeight: 19 },
  list: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 8, gap: 12 },
  permCard: { padding: 16 },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  allowed: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footNote: { fontSize: 11.5, lineHeight: 17, marginTop: 2, marginHorizontal: 4 },
  footer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
});
