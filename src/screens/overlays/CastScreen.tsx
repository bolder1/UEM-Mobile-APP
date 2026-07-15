import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Cast, Monitor, Headphones, Lock, Shield, Square, Clock, Signal, History, UserCog, Eye, Check, Pause, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { BottomSheet } from '../../components/BottomSheet';
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
  const logActivity = useAppStore((s) => s.logActivity);
  const showToast = useAppStore((s) => s.showToast);

  // Accepting an IT screen share is the High-stake action (someone sees your
  // screen), so it goes through an explicit consent sheet. Mirroring to a
  // meeting-room display is low-stake and starts directly.
  const [consentTarget, setConsentTarget] = useState<CastTarget | null>(null);

  const requestCast = (t: CastTarget) => {
    if (t.isAssist) {
      setConsentTarget(t);
    } else {
      startCast(t);
    }
  };

  const acceptCast = () => {
    const t = consentTarget;
    setConsentTarget(null);
    if (t) startCast(t);
  };

  const declineCast = () => {
    setConsentTarget(null);
    dismissIncomingCast();
    logActivity('cast', 'Declined IT screen share', 'Ravi Kumar · IT Admin', 'you');
    showToast('Screen share declined', 'info', { logged: true, actor: 'you' });
  };

  const elapsed = `${Math.floor(castSecs / 60)}:${('0' + (castSecs % 60)).slice(-2)}`;
  const stageColor = colors.primary;

  // A live screen share is a focused, take-over moment — render it as its own
  // dark session rather than inside the light casting chrome.
  if (cast === 'live') {
    return <LiveSession target={castTarget} elapsed={elapsed} ownPersonal={form.own === 'personal'} onEnd={stopCast} />;
  }

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
                IT is requesting your screen
              </AppText>
              <AppText variant="body" color={colors.text2} style={{ fontSize: 13, lineHeight: 19 }}>
                Ravi Kumar (IT Admin) wants to view this screen to help you. Review the request below — nothing is
                shared until you allow it.
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
              <TargetRow key={t.id} target={t} onPress={() => requestCast(t)} />
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
              label="Review request"
              onPress={() => {
                haptics.tap();
                requestCast(IT_ASSIST_TARGET);
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
            <View style={[styles.stageBox, { backgroundColor: stageColor, shadowColor: stageColor }]}>
              <Cast size={46} color="#FFFFFF" strokeWidth={2} />
            </View>
          </View>

          <AppText variant="displaySemibold" style={{ fontSize: 17, marginTop: 12 }}>
            Connecting…
          </AppText>
          <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5, marginTop: 2 }}>
            {castTarget?.name}
          </AppText>
        </ScrollView>
        </>
      )}

      <BottomSheet visible={!!consentTarget} onClose={() => setConsentTarget(null)} maxHeightPct={90}>
        <ScrollView contentContainerStyle={styles.consent} showsVerticalScrollIndicator={false}>
          <View style={[styles.consentIcon, { backgroundColor: colors.amberTint }]}>
            <Eye size={24} color={colors.amber} strokeWidth={2} />
          </View>
          <AppText variant="display" style={{ fontSize: 19, marginBottom: 6 }}>
            Let IT see your screen?
          </AppText>
          <AppText variant="body" color={colors.muted} style={{ fontSize: 13, lineHeight: 20 }}>
            {consentTarget?.sub ?? 'Ravi Kumar · IT Admin'} is asking to view this screen live to help you. Nothing is
            shared until you allow it, and you can end the session at any time.
          </AppText>

          <AppText variant="bodyBold" color={colors.muted2} style={styles.consentGroupLabel}>
            WHILE YOU SHARE, THEY CAN SEE
          </AppText>
          <ConsentRow tone="see" text="Everything on your screen, live" />

          <AppText variant="bodyBold" color={colors.muted2} style={styles.consentGroupLabel}>
            THEY CAN NEVER
          </AppText>
          <ConsentRow tone="never" text="See your screen once you tap End" />
          <ConsentRow tone="never" text="Tap, type or control your device" />
          {form.own === 'personal' && <ConsentRow tone="never" text="See your personal apps or data" />}

          <View style={styles.consentActions}>
            <Button label="Decline" variant="secondary" style={{ flex: 1 }} onPress={declineCast} />
            <Button label="Allow screen share" style={{ flex: 1.5 }} onPress={acceptCast} />
          </View>
          <AppText variant="body" color={colors.muted2} style={{ fontSize: 11, textAlign: 'center', marginTop: 12 }}>
            Your choice is logged to Activity.
          </AppText>
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

/** The dark, focused "you are live" screen-share session. */
function LiveSession({ target, elapsed, ownPersonal, onEnd }: { target: CastTarget | null; elapsed: string; ownPersonal: boolean; onEnd: () => void }) {
  const [paused, setPaused] = useState(false);
  const isAssist = !!target?.isAssist;
  const RED = '#F35B5B';
  const AMBER = '#E0A93C';
  const accent = paused ? AMBER : RED;
  return (
    <SafeAreaView style={liveStyles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={liveStyles.top}>
        <View style={[liveStyles.pill, { backgroundColor: paused ? 'rgba(224,169,60,0.16)' : 'rgba(243,91,91,0.16)' }]}>
          <View style={[liveStyles.pillDot, { backgroundColor: accent }]} />
          <AppText variant="bodyBold" color={accent} style={{ fontSize: 11.5, letterSpacing: 0.4 }}>
            {paused ? 'PAUSED' : 'LIVE'}
          </AppText>
        </View>
        <View style={{ flex: 1 }} />
        <AppText variant="bodySemibold" color="rgba(255,255,255,0.85)" style={{ fontSize: 13.5 }}>
          {elapsed}
        </AppText>
      </View>

      <View style={liveStyles.stage}>
        <View style={liveStyles.hero}>
          {!paused && <PulseRings size={132} color={RED} duration={2400} count={2} />}
          <View style={[liveStyles.avatar, !isAssist && { backgroundColor: '#2A323C' }]}>
            {isAssist ? (
              <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 28 }}>RK</AppText>
            ) : (
              <Monitor size={38} color="#FFFFFF" strokeWidth={2} />
            )}
          </View>
          <View style={[liveStyles.eyeBadge, { backgroundColor: accent }]}>
            <Eye size={17} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </View>
        <AppText variant="display" color="#FFFFFF" style={liveStyles.h1}>
          {paused ? 'Sharing paused' : isAssist ? 'Ravi Kumar is viewing your screen' : `Mirroring to ${target?.name}`}
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.55)" style={liveStyles.sub}>
          {isAssist ? `IT Admin · ${ORG_NAME} · started ${elapsed} ago` : target?.sub}
        </AppText>
      </View>

      <View style={liveStyles.card}>
        <LiveRow ok={!paused} highlight={paused} text={paused ? 'Paused — they can’t see your screen right now' : 'They see this screen, live'} />
        <LiveRow ok={false} bordered text="They can’t tap or control your device" />
        <LiveRow ok={false} bordered text="Nothing is kept after you end the session" />
      </View>

      <View style={liveStyles.preview}>
        <View style={liveStyles.previewThumb}>
          <Monitor size={16} color="#8A929C" strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="bodySemibold" color="rgba(255,255,255,0.9)" style={{ fontSize: 12.5 }}>
            Your screen · {paused ? 'paused' : 'shared'}
          </AppText>
          {ownPersonal ? (
            <AppText variant="body" color="rgba(255,255,255,0.5)" style={{ fontSize: 11, marginTop: 1 }}>
              Personal apps stay hidden
            </AppText>
          ) : null}
        </View>
        <View style={[liveStyles.gd, { backgroundColor: paused ? AMBER : '#3DBB7D' }]} />
      </View>

      <View style={{ flex: 1 }} />

      <View style={liveStyles.controls}>
        <Pressable
          onPress={() => { haptics.tap(); setPaused((p) => !p); }}
          accessibilityRole="button"
          accessibilityLabel={paused ? 'Resume sharing' : 'Pause sharing'}
          style={liveStyles.pauseBtn}
        >
          {paused ? <Cast size={20} color="#FFFFFF" strokeWidth={2} /> : <Pause size={20} color="#FFFFFF" strokeWidth={2} />}
        </Pressable>
        <Pressable
          onPress={() => { haptics.tap(); onEnd(); }}
          accessibilityRole="button"
          accessibilityLabel="End session"
          style={[liveStyles.endBtn, { backgroundColor: RED }]}
        >
          <Square size={17} color="#FFFFFF" strokeWidth={2.2} />
          <AppText variant="bodySemibold" color="#FFFFFF" style={{ fontSize: 15.5 }}>End session</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function LiveRow({ ok, bordered, highlight, text }: { ok: boolean; bordered?: boolean; highlight?: boolean; text: string }) {
  return (
    <View style={[liveStyles.liveRow, bordered && { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }]}>
      <View style={[liveStyles.rowChip, { backgroundColor: highlight ? 'rgba(224,169,60,0.22)' : ok ? 'rgba(29,158,95,0.22)' : 'rgba(255,255,255,0.08)' }]}>
        {ok ? (
          <Check size={14} color="#3DBB7D" strokeWidth={2.6} />
        ) : highlight ? (
          <Pause size={13} color="#E0A93C" strokeWidth={2.4} />
        ) : (
          <X size={14} color="#8A929C" strokeWidth={2.6} />
        )}
      </View>
      <AppText variant="bodyMedium" color={ok || highlight ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.62)'} style={{ fontSize: 13, flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}

const liveStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E1217', paddingHorizontal: 24, paddingTop: 8 },
  top: { flexDirection: 'row', alignItems: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  stage: { alignItems: 'center', marginTop: 40 },
  hero: { width: 132, height: 132, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#7A5AF8', alignItems: 'center', justifyContent: 'center' },
  eyeBadge: { position: 'absolute', right: 4, bottom: 4, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#0E1217' },
  h1: { fontSize: 21, textAlign: 'center', marginTop: 22, letterSpacing: -0.2 },
  sub: { fontSize: 12.5, textAlign: 'center', marginTop: 5 },
  card: { backgroundColor: '#1B2129', borderRadius: 18, paddingHorizontal: 15, marginTop: 24 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowChip: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1B2129', borderRadius: 14, paddingHorizontal: 13, paddingVertical: 11, marginTop: 12 },
  previewThumb: { width: 46, height: 32, borderRadius: 6, backgroundColor: '#0E1217', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  gd: { width: 8, height: 8, borderRadius: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8 },
  pauseBtn: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#1B2129', alignItems: 'center', justifyContent: 'center' },
  endBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, height: 54, borderRadius: 16 },
});

function ConsentRow({ tone, text }: { tone: 'see' | 'never'; text: string }) {
  const { colors } = useTheme();
  const isSee = tone === 'see';
  return (
    <View style={styles.consentRow}>
      <View style={[styles.consentRowIcon, { backgroundColor: isSee ? colors.amberTint : colors.successTint }]}>
        {isSee ? (
          <Eye size={13} color={colors.amber} strokeWidth={2.4} />
        ) : (
          <Check size={13} color={colors.success} strokeWidth={2.4} />
        )}
      </View>
      <AppText variant="bodyMedium" style={{ fontSize: 13, flex: 1 }}>
        {text}
      </AppText>
    </View>
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
  consent: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26 },
  consentIcon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  consentGroupLabel: { fontSize: 11, letterSpacing: 0.6, marginTop: 20, marginBottom: 10 },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 6 },
  consentRowIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  consentActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
});
