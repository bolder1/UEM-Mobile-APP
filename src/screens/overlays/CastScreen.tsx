import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cast, Monitor, Headphones, Lock, Shield, Square, Clock, Signal, History, UserCog } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PulseRings, SpinningDashedRing, PulseDot } from '../../components/Animations';
import { useAppStore, ORG_NAME } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { CAST_TARGETS } from '../../data/mockData';
import { CastTarget } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ripple } from '../../theme/platform';

type Props = NativeStackScreenProps<RootStackParamList, 'Cast'>;

const IT_ASSIST_TARGET = CAST_TARGETS.find((t) => t.isAssist)!;

export function CastScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const cast = useAppStore((s) => s.cast);
  const castTarget = useAppStore((s) => s.castTarget);
  const castSecs = useAppStore((s) => s.castSecs);
  const startCast = useAppStore((s) => s.startCast);
  const stopCast = useAppStore((s) => s.stopCast);
  const form = useAppStore((s) => s.form);
  const castHistory = useAppStore((s) => s.castHistory);
  const incomingCastSession = useAppStore((s) => s.incomingCastSession);
  const dismissIncomingCast = useAppStore((s) => s.dismissIncomingCast);

  const elapsed = `${Math.floor(castSecs / 60)}:${('0' + (castSecs % 60)).slice(-2)}`;
  const stageColor = cast === 'live' ? colors.success : colors.primary;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: 24 }}>
        <ScreenHeader title="Remote Cast" onBack={() => navigation.goBack()} />
      </View>

      {cast === 'idle' ? (
        <>
        <ScrollView contentContainerStyle={styles.idleWrap} showsVerticalScrollIndicator={false}>
          {incomingCastSession && (
            <Card style={[styles.sessionBanner, { backgroundColor: colors.primaryTint, borderColor: colors.primary }]}>
              <View style={[styles.headerIcon, { backgroundColor: colors.surface, marginBottom: 12 }]}>
                <Monitor size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <AppText variant="displaySemibold" style={{ fontSize: 17, marginBottom: 4 }}>
                Session available
              </AppText>
              <AppText variant="body" color={colors.text2} style={{ fontSize: 13, lineHeight: 19 }}>
                An IT admin has started a remote session. Use Join session below to connect.
              </AppText>
              <Pressable onPress={dismissIncomingCast} hitSlop={8} style={{ marginTop: 12, alignSelf: 'flex-start' }}>
                <AppText variant="bodySemibold" color={colors.muted} style={{ fontSize: 12.5 }}>
                  Dismiss
                </AppText>
              </Pressable>
            </Card>
          )}

          <View style={[styles.headerIcon, { backgroundColor: colors.primaryTint }]}>
            <Cast size={27} color={colors.primary} strokeWidth={2} />
          </View>
          <AppText variant="display" style={{ fontSize: 21, marginBottom: 6 }}>
            Cast this screen
          </AppText>
          <AppText variant="body" color={colors.muted} style={{ fontSize: 13, lineHeight: 20 }}>
            Mirror your device to an approved meeting-room display, or share it live with IT for remote help.
          </AppText>

          <AppText variant="bodyBold" color={colors.muted2} style={styles.nearbyLabel}>
            AVAILABLE NEARBY
          </AppText>
          <View style={{ gap: 10 }}>
            {CAST_TARGETS.map((t) => (
              <TargetRow key={t.id} target={t} onPress={() => startCast(t)} />
            ))}
          </View>

          <View style={styles.historyHead}>
            <History size={14} color={colors.muted2} strokeWidth={2.2} />
            <AppText variant="bodyBold" color={colors.muted2} style={styles.nearbyLabelInline}>
              SESSION HISTORY
            </AppText>
          </View>
          {castHistory.length === 0 ? (
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 12.5 }}>
              No previous sessions.
            </AppText>
          ) : (
            <Card style={styles.historyCard} padded={false}>
              {castHistory.map((h, i) => (
                <View
                  key={h.id}
                  style={[styles.historyRow, i < castHistory.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}
                >
                  <View style={[styles.historyIcon, { backgroundColor: h.initiatedBy === 'admin' ? colors.violetTint : colors.infoTint }]}>
                    {h.initiatedBy === 'admin' ? (
                      <UserCog size={16} color={colors.violet} strokeWidth={2} />
                    ) : (
                      <Monitor size={16} color={colors.info} strokeWidth={2} />
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 13 }}>
                      {h.targetName}
                    </AppText>
                    <AppText variant="body" color={colors.muted2} style={{ fontSize: 11, marginTop: 2 }}>
                      {h.startedAt} · {h.duration} · {h.quality}
                    </AppText>
                  </View>
                </View>
              ))}
            </Card>
          )}

          <View style={[styles.noteBox, { backgroundColor: colors.surfaceSunken }]}>
            <Lock size={16} color={colors.muted} strokeWidth={2} style={{ marginTop: 1 }} />
            <AppText variant="body" color={colors.text3} style={{ fontSize: 11.5, lineHeight: 17, flex: 1 }}>
              Casting is managed by {ORG_NAME} IT. Only approved displays appear here, and every session is logged
              for security.
            </AppText>
          </View>
        </ScrollView>
        {incomingCastSession && (
          <View style={[styles.footer, { borderTopColor: colors.hairline, backgroundColor: colors.bg }]}>
            <Button
              label="Join session"
              onPress={() => {
                haptics.tap();
                startCast(IT_ASSIST_TARGET);
              }}
            />
          </View>
        )}
        </>
      ) : (
        <>
        <ScrollView contentContainerStyle={styles.busyWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.stageRing}>
            {cast === 'connecting' && (
              <>
                <PulseRings size={168} color={colors.primary} duration={1600} count={2} />
                <SpinningDashedRing size={208} color={colors.primary} duration={2400} />
              </>
            )}
            {cast === 'live' && <PulseRings size={168} color={colors.success} duration={2600} count={2} />}
            <View style={[styles.stageBox, { backgroundColor: stageColor, shadowColor: stageColor }]}>
              <Cast size={46} color="#FFFFFF" strokeWidth={2} />
            </View>
          </View>

          {cast === 'connecting' ? (
            <>
              <AppText variant="displaySemibold" style={{ fontSize: 17, marginTop: 12 }}>
                Connecting…
              </AppText>
              <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5, marginTop: 2 }}>
                {castTarget?.name}
              </AppText>
            </>
          ) : (
            <>
              <Card style={[styles.activeCard, { borderColor: colors.success }]}>
                <View style={styles.activeTopRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="displaySemibold" style={{ fontSize: 16 }}>
                      Screen sharing active
                    </AppText>
                    <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 2 }}>
                      {castTarget?.isAssist ? 'Your screen is visible to the admin' : `Mirroring to ${castTarget?.name}`}
                    </AppText>
                  </View>
                  <View style={[styles.activePill, { backgroundColor: colors.successTint }]}>
                    <PulseDot color={colors.success} size={7} />
                    <AppText variant="bodyBold" color={colors.success} style={{ fontSize: 11 }}>
                      Active
                    </AppText>
                  </View>
                </View>
              </Card>

              <View style={styles.statTiles}>
                <StatTile icon={<Clock size={16} color={colors.text3} strokeWidth={2} />} value={elapsed} label="Duration" />
                <StatTile icon={<Signal size={16} color={colors.text3} strokeWidth={2} />} value="HD" label="Quality" />
                <StatTile icon={<Shield size={16} color={colors.text3} strokeWidth={2} />} value="AES-256" label="Encrypted" />
              </View>

              <Card style={[styles.liveInfoCard, { marginTop: 18 }]} padded={false}>
                <InfoLine icon={<Shield size={17} color={colors.text3} strokeWidth={2} />} text="Session protected with AES-256 end-to-end encryption" />
                <InfoLine
                  icon={<Monitor size={17} color={colors.text3} strokeWidth={2} />}
                  text={castTarget?.isAssist ? 'This session was started by your IT administrator' : 'Notifications are hidden while casting'}
                  bordered
                />
                {form.own === 'personal' && (
                  <InfoLine
                    icon={<Shield size={17} color={colors.text3} strokeWidth={2} />}
                    text="Personal apps stay private on your device"
                    bordered
                  />
                )}
              </Card>
            </>
          )}
        </ScrollView>
        {cast === 'live' && (
          <View style={[styles.footer, { borderTopColor: colors.hairline, backgroundColor: colors.bg }]}>
            <Button
              label="Leave session"
              variant="danger"
              onPress={stopCast}
              icon={<Square size={16} color="#FFFFFF" fill="#FFFFFF" />}
            />
          </View>
        )}
        </>
      )}
    </SafeAreaView>
  );
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statTile, { backgroundColor: colors.surfaceSunken }]}>
      {icon}
      <AppText variant="displaySemibold" style={{ fontSize: 14, marginTop: 6 }}>
        {value}
      </AppText>
      <AppText variant="body" color={colors.muted2} style={{ fontSize: 10.5, marginTop: 1 }}>
        {label}
      </AppText>
    </View>
  );
}

function TargetRow({ target, onPress }: { target: CastTarget; onPress: () => void }) {
  const { colors } = useTheme();
  const tint = target.isAssist ? colors.successTint : colors.infoTint;
  const iconColor = target.isAssist ? colors.success : colors.primary;
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      android_ripple={ripple(colors.surfaceActive) ?? undefined}
      style={({ pressed }) => [
        styles.targetRow,
        { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={[styles.targetIcon, { backgroundColor: tint }]}>
        {target.isAssist ? (
          <Headphones size={20} color={iconColor} strokeWidth={2} />
        ) : (
          <Monitor size={20} color={iconColor} strokeWidth={2} />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="bodySemibold" style={{ fontSize: 14 }}>
          {target.name}
        </AppText>
        <AppText variant="body" color={colors.muted} style={{ fontSize: 12, marginTop: 1 }}>
          {target.sub}
        </AppText>
      </View>
      <View style={styles.statusTag}>
        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
        <AppText variant="bodySemibold" color={colors.success} style={{ fontSize: 11.5 }}>
          {target.status}
        </AppText>
      </View>
    </Pressable>
  );
}

function InfoLine({ icon, text, bordered }: { icon: React.ReactNode; text: string; bordered?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoLine, bordered && { borderTopWidth: 1, borderTopColor: colors.hairline }]}>
      {icon}
      <AppText variant="body" color={colors.text2} style={{ fontSize: 12.5, flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  idleWrap: { paddingHorizontal: 24, paddingBottom: 24 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 14, borderTopWidth: 1 },
  sessionBanner: { borderWidth: 1.5, marginBottom: 22, alignItems: 'flex-start' },
  headerIcon: { width: 58, height: 58, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  nearbyLabel: { fontSize: 11, letterSpacing: 0.6, marginTop: 18, marginBottom: 10 },
  nearbyLabelInline: { fontSize: 11, letterSpacing: 0.6 },
  historyHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 22, marginBottom: 10 },
  historyCard: { overflow: 'hidden' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
  historyIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderRadius: 16, padding: 15 },
  targetIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  noteBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, padding: 14, marginTop: 18 },
  busyWrap: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30 },
  stageRing: { width: 208, height: 208, alignItems: 'center', justifyContent: 'center' },
  stageBox: {
    width: 116,
    height: 116,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 18 },
    elevation: 6,
  },
  activeCard: { width: '100%', borderWidth: 1.5, marginTop: 8 },
  activeTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statTiles: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 12 },
  statTile: { flex: 1, borderRadius: 14, alignItems: 'center', paddingVertical: 14 },
  liveInfoCard: { width: '100%', marginTop: 18, paddingHorizontal: 16 },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11 },
});
