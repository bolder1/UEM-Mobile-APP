import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Palette, Bell, EyeOff, Activity as ActivityIcon, Smartphone, Headphones, ChevronRight, LogOut, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { DarkPanel } from '../../components/DarkPanel';
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

export function ProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const form = useAppStore((s) => s.form);
  const certs = useAppStore((s) => s.certs);
  const appSt = useAppStore((s) => s.appSt);
  const activity = useAppStore((s) => s.activity);
  const notifications = useAppStore((s) => s.notifications);
  const lastSync = useAppStore((s) => s.lastSync);
  const openChat = useAppStore((s) => s.openChat);
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
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Left' }] });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <DarkPanel style={{ paddingTop: insets.top + 16, paddingHorizontal: 22, paddingBottom: 34 }}>
            <View style={[styles.bigAvatar, { backgroundColor: colors.primary }]}>
              <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 24 }}>
                {initials}
              </AppText>
            </View>
            <AppText variant="display" color="#FFFFFF" style={{ fontSize: 21, marginTop: 12, letterSpacing: -0.3 }}>
              {userName}
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.6)" style={{ fontSize: 12.5, marginTop: 3 }}>
              {form.dept} · {ORG_NAME}
            </AppText>
            <View style={styles.chip}>
              <View style={[styles.dot, { backgroundColor: colors.successStrong }]} />
              <AppText variant="bodySemibold" color="rgba(255,255,255,0.9)" style={{ fontSize: 11.5 }}>
                {form.own === 'company' ? 'Company-owned' : 'Personal device'} · enrolled Jun 18
              </AppText>
            </View>
          </DarkPanel>

          <View style={{ paddingHorizontal: 20 }}>
            <Card style={styles.stats} padded={false}>
              <Stat value={String(appsInstalled)} label="APPS" />
              <Divider />
              <Stat value={`${certsInstalled}/${certsTotal}`} label="CERTIFICATES" />
              <Divider />
              <Stat value="100%" label="COMPLIANT" />
            </Card>

            <Card style={styles.cells} padded={false}>
              <Cell icon={<Palette size={17} color={colors.text3} strokeWidth={2} />} label="Appearance" onPress={() => navigation.navigate('Appearance')} bordered />
              <Cell
                icon={<Bell size={17} color={colors.text3} strokeWidth={2} />}
                label="Notifications"
                value={unreadNotifs > 0 ? `${unreadNotifs} new` : undefined}
                onPress={() => navigation.navigate('Notifications')}
                bordered
              />
              <Cell icon={<EyeOff size={17} color={colors.text3} strokeWidth={2} />} label="Privacy & what IT sees" onPress={() => navigation.navigate('Privacy')} bordered />
              <Cell
                icon={<ActivityIcon size={17} color={colors.text3} strokeWidth={2} />}
                label="Activity"
                value={`${activity.length}`}
                onPress={() => navigation.navigate('Activity')}
                bordered
              />
              <Cell
                icon={<Smartphone size={17} color={colors.text3} strokeWidth={2} />}
                label="Device & sync"
                value={`synced ${lastSync}`}
                onPress={() => navigation.navigate('About')}
                bordered
              />
              <Cell
                icon={<Headphones size={17} color={colors.text3} strokeWidth={2} />}
                label="Contact IT helpdesk"
                onPress={() => {
                  openChat('it');
                  navigation.navigate('ChatThread', { chatId: 'it' });
                }}
              />
            </Card>

            {certsPending > 0 ? (
              <Pressable onPress={() => navigation.navigate('Certs')}>
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
              </Pressable>
            ) : null}

            <Card style={styles.dangerCard} padded={false}>
              <Pressable
                onPress={() => {
                  haptics.tap();
                  setUnOpen(!unOpen);
                }}
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
                      style={[styles.unInput, { borderColor: colors.borderStrong, backgroundColor: colors.surface, color: colors.text }]}
                    />
                    <Button label="Remove" size="md" variant="danger" disabled={!canRemove} onPress={doUnenroll} style={{ paddingHorizontal: 16 }} />
                  </View>
                </View>
              ) : null}
            </Card>

            <AppText variant="body" color={colors.muted2} style={styles.footer}>
              UEM Companion · v3.0.0 (prototype){'\n'}WireGuard® tunnel engine · DPDPA-aligned privacy
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <AppText variant="display" style={{ fontSize: 19, letterSpacing: -0.4 }}>
        {value}
      </AppText>
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
  label,
  value,
  onPress,
  bordered,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress: () => void;
  bordered?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.cell,
        bordered && { borderBottomWidth: 1, borderBottomColor: colors.hairline },
        pressed && { backgroundColor: colors.surfaceHover },
      ]}
    >
      <View style={[styles.cellIcon, { backgroundColor: colors.surfaceSunken }]}>{icon}</View>
      <AppText variant="bodyMedium" style={{ fontSize: 13.5, flex: 1 }}>
        {label}
      </AppText>
      {value ? (
        <AppText variant="bodySemibold" color={colors.muted2} style={{ fontSize: 12 }}>
          {value}
        </AppText>
      ) : null}
      <ChevronRight size={16} color={colors.faint} strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bigAvatar: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  stats: { flexDirection: 'row', marginTop: -22, overflow: 'hidden' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 15 },
  cells: { marginTop: 14, overflow: 'hidden' },
  cell: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 15 },
  cellIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  nudge: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 14 },
  nudgeIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dangerCard: { overflow: 'hidden', marginTop: 14 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  unBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, paddingTop: 12 },
  unInput: { flex: 1, height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 13.5, fontFamily: 'Inter_400Regular' },
  footer: { fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 22 },
});
