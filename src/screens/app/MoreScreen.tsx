import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sun, Moon, Monitor, BadgeCheck, Cast, Headphones, LogOut, Bell, Info } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { ListRow } from '../../components/ListRow';
import { ThemePicker } from '../../components/ThemePicker';
import { Button } from '../../components/Button';
import { useAppStore, ORG_NAME, DEFAULT_USER_NAME, pendingCertCount, unreadNotifCount } from '../../state/store';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'More'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function MoreScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const form = useAppStore((s) => s.form);
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const certs = useAppStore((s) => s.certs);
  const cast = useAppStore((s) => s.cast);
  const notifications = useAppStore((s) => s.notifications);
  const unreadNotifs = unreadNotifCount(notifications);
  const [unOpen, setUnOpen] = React.useState(false);
  const [unVal, setUnVal] = React.useState('');
  const resetAll = useAppStore((s) => s.resetAll);
  const openChat = useAppStore((s) => s.openChat);

  const userName = form.name || DEFAULT_USER_NAME;
  const initials = userName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const certsPending = pendingCertCount(certs);
  const canRemove = unVal.trim().toUpperCase() === 'REMOVE';

  const doUnenroll = () => {
    if (!canRemove) return;
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Left' }] });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="display" style={{ fontSize: 22, marginBottom: 14 }}>
          More
        </AppText>

        <Card style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 17 }}>
              {initials}
            </AppText>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="bodySemibold" style={{ fontSize: 15 }}>
              {userName}
            </AppText>
            <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
              {form.email || 'priya.sharma@acme.com'}
            </AppText>
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, marginTop: 1 }}>
              {form.empId || 'ACM-1042'} · {form.dept} · {ORG_NAME}
            </AppText>
          </View>
        </Card>

        <Card style={styles.appearanceCard}>
          <View style={styles.appearanceHead}>
            <Monitor size={18} color={colors.text3} strokeWidth={2} />
            <AppText variant="bodySemibold" style={{ fontSize: 14, flex: 1 }}>
              Appearance
            </AppText>
          </View>
          <ThemePicker
            value={themeMode}
            onChange={setThemeMode}
            options={[
              { value: 'light', label: 'Light', icon: (c) => <Sun size={18} color={c} strokeWidth={2.2} /> },
              { value: 'dark', label: 'Dark', icon: (c) => <Moon size={18} color={c} strokeWidth={2.2} /> },
              { value: 'system', label: 'System', icon: (c) => <Monitor size={18} color={c} strokeWidth={2.2} /> },
            ]}
          />
          <AppText variant="body" color={colors.muted2} style={{ fontSize: 11.5, marginTop: 9 }}>
            {themeMode === 'system' ? 'Following your device setting' : `Always ${themeMode[0].toUpperCase()}${themeMode.slice(1)}`}
          </AppText>
        </Card>

        <Card style={styles.linksCard} padded={false}>
          <ListRow
            icon={<Bell size={18} color={colors.text3} strokeWidth={2} />}
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
            bordered
            right={
              unreadNotifs > 0 ? (
                <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                  <AppText variant="bodyBold" color="#FFFFFF" style={{ fontSize: 10.5 }}>
                    {unreadNotifs}
                  </AppText>
                </View>
              ) : null
            }
          />
          <ListRow
            icon={<BadgeCheck size={18} color={colors.text3} strokeWidth={2} />}
            label="Certificates"
            onPress={() => navigation.navigate('Certs')}
            bordered
            right={
              certsPending > 0 ? (
                <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                  <AppText variant="bodyBold" color="#FFFFFF" style={{ fontSize: 10.5 }}>
                    {certsPending}
                  </AppText>
                </View>
              ) : null
            }
          />
          <ListRow
            icon={<Cast size={18} color={colors.text3} strokeWidth={2} />}
            label="Screen cast"
            onPress={() => navigation.navigate('Cast')}
            bordered
            right={
              cast === 'live' ? (
                <View style={styles.liveTag}>
                  <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
                  <AppText variant="bodyBold" color={colors.success} style={{ fontSize: 11 }}>
                    Live
                  </AppText>
                </View>
              ) : null
            }
          />
          <ListRow
            icon={<Headphones size={18} color={colors.text3} strokeWidth={2} />}
            label="Contact IT helpdesk"
            onPress={() => {
              openChat('it');
              navigation.navigate('ChatThread', { chatId: 'it' });
            }}
            bordered
          />
          <ListRow
            icon={<Info size={18} color={colors.text3} strokeWidth={2} />}
            label="About"
            onPress={() => navigation.navigate('About')}
          />
        </Card>

        <Card style={styles.dangerCard} padded={false}>
          <Pressable
            onPress={() => setUnOpen(!unOpen)}
            style={({ pressed }) => [styles.dangerRow, pressed && { backgroundColor: colors.surfaceHover }]}
          >
            <LogOut size={18} color={colors.danger} strokeWidth={2} />
            <AppText variant="bodyMedium" color={colors.danger} style={{ fontSize: 14, flex: 1 }}>
              Remove from management
            </AppText>
          </Pressable>
          {unOpen && (
            <View style={[styles.unenrollBody, { borderTopColor: colors.hairline }]}>
              <AppText variant="body" color={colors.text3} style={{ fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
                You&rsquo;ll lose access to work apps, files, chat and the secure tunnel. Your personal data is
                untouched. Type <AppText variant="bodyBold" color={colors.text}>REMOVE</AppText> to confirm.
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
          )}
        </Card>

        <View style={styles.footer}>
          <AppText variant="body" color={colors.muted2} style={{ fontSize: 11, lineHeight: 17, textAlign: 'center' }}>
            miniOrange UEM · v3.0.0 (prototype){'\n'}WireGuard® tunnel engine · DPDPA-aligned privacy
          </AppText>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 110 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  appearanceCard: { marginBottom: 14 },
  appearanceHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  linksCard: { overflow: 'hidden', marginBottom: 14 },
  countBadge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  dangerCard: { overflow: 'hidden', marginBottom: 14 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  unenrollBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, paddingTop: 12 },
  unInput: { flex: 1, height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 13.5, fontFamily: 'Inter_400Regular' },
  footer: { paddingTop: 6, paddingBottom: 10 },
});
