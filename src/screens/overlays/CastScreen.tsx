import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import {
  Cast,
  Monitor,
  Headphones,
  Lock,
  ShieldCheck,
  History,
  UserCog,
  Eye,
  EyeOff,
  Check,
  Pause,
  Play,
  X,
  Square,
  ChevronRight,
  Smartphone,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { IconTile } from '../../components/IconTile';
import { ListRow } from '../../components/ListRow';
import { StatusDot } from '../../components/StatusDot';
import { BottomSheet } from '../../components/BottomSheet';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Entrance, PressableScale, GlowOrb, StateSwap } from '../../components/Motion';
import { GlassPill, hexA } from '../../components/Glass';
import { PulseRings, PulseDot, EqualizerBars } from '../../components/Animations';
import { MONO } from '../../theme/typography';
import { space, layout, touch, control } from '../../theme/spacing';
import { radii } from '../../theme/platform';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { useAppStore, ORG_NAME } from '../../state/store';
import { CAST_TARGETS } from '../../data/mockData';
import { CastTarget } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Cast'>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const IT_ASSIST_TARGET = CAST_TARGETS.find((t) => t.isAssist)!;

/** Mirrors store.startCast's connecting delay — the handshake ritual has to
 *  land just BEFORE the store flips to 'live', never after. Keep LAND_AT
 *  derived so the lead time survives a change to either number. */
const CONNECT_MS = 2200;
const LAND_LEAD_MS = 420;
const LAND_AT = CONNECT_MS - LAND_LEAD_MS; // 1780

const SESSION_ID = 'CAST-7F2A';

/* connecting geometry */
const STAGE = 232;
const RING_SIZE = 132;
const RING_R = 60;
const RING_C = 2 * Math.PI * RING_R; // ≈ 377
const CHECK_BOX = 44;
const CHECK_LEN = 32;


/** The session world's neutral glass — reads on canvas in BOTH themes, so the
 *  session can feel set-apart without hardcoding a near-black. */
function skin(isDark: boolean) {
  return {
    fill: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.035)',
    edge: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.09)',
    hair: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  };
}

const mmss = (n: number) => `${Math.floor(n / 60)}:${('0' + (n % 60)).slice(-2)}`;

export function CastScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
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

  // Letting IT see your screen is the high-stake action, so an isAssist share
  // never starts directly: choosing the assist target — or reviewing the
  // incoming request banner — raises the full-screen consent step, and only
  // Allow starts the cast. A display target casts straight from the CTA.
  const [consentTarget, setConsentTarget] = useState<CastTarget | null>(null);
  // Whether the consent step was raised by IT's request or by the user's own
  // CTA — a decline is only a *decline* if somebody actually asked.
  const [fromRequest, setFromRequest] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(CAST_TARGETS[0].id);
  const selected = CAST_TARGETS.find((t) => t.id === selectedId) ?? CAST_TARGETS[0];

  const requestCast = (t: CastTarget) => {
    if (t.isAssist) {
      setFromRequest(false);
      setConsentTarget(t);
    } else {
      startCast(t);
    }
  };

  const reviewRequest = () => {
    setFromRequest(true);
    setConsentTarget(IT_ASSIST_TARGET);
  };

  const acceptCast = () => {
    const t = consentTarget ?? IT_ASSIST_TARGET;
    setConsentTarget(null);
    startCast(t);
  };

  const declineCast = () => {
    setConsentTarget(null);
    if (!fromRequest) return; // backing out of your own request is a cancel, not a decline
    dismissIncomingCast();
    logActivity('cast', 'Declined IT screen cast', 'Ravi Kumar · IT Admin', 'you');
    showToast('Screen cast declined', 'info', { logged: true, actor: 'you' });
  };

  // An incoming request no longer hijacks the screen on arrival: it lands as a
  // banner on entry, and only a deliberate Review raises the consent step.
  const mode: 'entry' | 'consent' | 'connecting' | 'live' =
    cast === 'live' ? 'live' : cast === 'connecting' ? 'connecting' : consentTarget ? 'consent' : 'entry';
  const focused = mode !== 'entry';

  // "Weather change": the focused session canvas fades in/out under the content
  // instead of hard-cutting background colors between states.
  const focusFade = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      focusFade.setValue(focused ? 1 : 0);
      return;
    }
    Animated.timing(focusFade, {
      toValue: focused ? 1 : 0,
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, reduced]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: focusFade }]}>
        <LinearGradient colors={[colors.bg, colors.canvas]} style={{ flex: 1 }} />
      </Animated.View>

      <StateSwap stateKey={mode} style={{ flex: 1 }} duration={340}>
        {mode === 'live' ? (
          <LiveSession
            target={castTarget}
            castSecs={castSecs}
            ownPersonal={form.own === 'personal'}
            onEnd={stopCast}
          />
        ) : mode === 'connecting' ? (
          <ConnectingRitual target={castTarget} onCancel={stopCast} />
        ) : mode === 'consent' ? (
          <ConsentTakeover
            fromRequest={fromRequest}
            ownPersonal={form.own === 'personal'}
            onDecline={declineCast}
            onAllow={acceptCast}
          />
        ) : (
          <EntryView
            incoming={incomingCastSession}
            selected={selected}
            onSelect={setSelectedId}
            onReview={reviewRequest}
            onDismissIncoming={dismissIncomingCast}
            onBack={() => navigation.goBack()}
            onCast={() => requestCast(selected)}
            onHistory={() => setHistoryOpen(true)}
          />
        )}
      </StateSwap>

      <BottomSheet
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxHeightPct={80}
        accessibilityLabel="Session history"
      >
        <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
          <AppText variant="display" size="title" accessibilityRole="header" style={{ marginBottom: layout.captionGap }}>
            Session history
          </AppText>
          <AppText variant="body" size="caption" color={colors.muted} style={{ marginBottom: layout.blockGap }}>
            Every screen cast from this device, newest first.
          </AppText>

          {castHistory.length === 0 ? (
            <AppText variant="body" size="caption" color={colors.muted2}>
              No previous sessions.
            </AppText>
          ) : (
            <Card padded={false} style={styles.historyCard}>
              {castHistory.map((h, i) => (
                <ListRow
                  key={h.id}
                  icon={
                    <IconTile bg={h.initiatedBy === 'admin' ? colors.violetTint : colors.infoTint}>
                      {h.initiatedBy === 'admin' ? (
                        <UserCog size={control.icon.lg} color={colors.violet} strokeWidth={2} />
                      ) : (
                        <Monitor size={control.icon.lg} color={colors.info} strokeWidth={2} />
                      )}
                    </IconTile>
                  }
                  label={h.targetName}
                  sub={`${h.startedAt} · ${h.duration} · ${h.quality}`}
                  bordered={i < castHistory.length - 1}
                />
              ))}
            </Card>
          )}

          <Card style={styles.noteBox}>
            <Lock size={control.icon.md} color={colors.muted} strokeWidth={2} />
            <AppText variant="body" size="caption" color={colors.text3} style={{ flex: 1 }}>
              Screen casting is managed by {ORG_NAME} IT. Only approved displays appear here, and every session is
              logged for security.
            </AppText>
          </Card>

          <AppText
            variant="body"
            size="micro"
            color={colors.muted2}
            style={{ textAlign: 'center', marginTop: layout.blockGap }}
          >
            Every session is logged and visible to you.
          </AppText>
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

/* ================================================================== *
 *  ENTRY — the cast action is the page. No illustration: pick a target,
 *  the primary button casts. An incoming request arrives as a banner.
 * ================================================================== */

function EntryView({
  incoming,
  selected,
  onSelect,
  onReview,
  onDismissIncoming,
  onBack,
  onCast,
  onHistory,
}: {
  incoming: boolean;
  selected: CastTarget;
  onSelect: (id: string) => void;
  onReview: () => void;
  onDismissIncoming: () => void;
  onBack: () => void;
  onCast: () => void;
  onHistory: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.entryRoot}>
      <ScreenHeader title="Screen cast" onBack={onBack} />

      {incoming && (
        <Entrance from={-14}>
          <RequestBanner onReview={onReview} onDismiss={onDismissIncoming} />
        </Entrance>
      )}

      <Entrance delay={70}>
        <View style={styles.sectionHead}>
          <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.microLabel}>
            CAST TO
          </AppText>
          <AppText variant="bodySemibold" size="micro" color={colors.muted2} style={styles.microLabel}>
            {CAST_TARGETS.length} IT-APPROVED
          </AppText>
        </View>
        <View style={{ gap: layout.cardGap }}>
          {CAST_TARGETS.map((t) => (
            <TargetRow key={t.id} target={t} on={t.id === selected.id} onPress={() => onSelect(t.id)} />
          ))}
        </View>
      </Entrance>

      {/* Past sessions belong with the targets, not stranded under the primary
          button — and it reads as a row now, not an underlined caption. */}
      <Entrance delay={110}>
        <PressableScale
          onPress={onHistory}
          scaleTo={0.985}
          accessibilityRole="button"
          accessibilityLabel="Open session history"
        >
          {/* The row owns its own edges (`layout.rowPad*`), so the Card is just
              the surface — same shape as the rows inside the history sheet. */}
          <Card padded={false} style={styles.historyLink}>
            <ListRow
              icon={
                <IconTile bg={colors.surfaceSunken}>
                  <History size={control.icon.lg} color={colors.muted} strokeWidth={2.2} />
                </IconTile>
              }
              label="Session history"
              showChevron={false}
              right={<ChevronRight size={control.icon.sm} color={colors.faint} strokeWidth={2.2} />}
            />
          </Card>
        </PressableScale>
      </Entrance>

      <View style={{ flex: 1, minHeight: layout.cardGap }} />

      {/* The ENCRYPTED / LOGGED / IT-APPROVED DISPLAYS chips are gone. They took
          no prop, read no state and pointed at no source — three badges that
          decorated rather than informed. The consequence line below says what
          this specific tap will do, which is the thing they were pretending to
          be. */}
      <Entrance delay={140}>
        {/* The consequence of the current pick, so the primary button is never
            a surprise — and so the assist path announces its consent step. */}
        <StateSwap stateKey={selected.isAssist ? 'assist' : 'display'} style={styles.consequenceSlot}>
          <AppText variant="body" size="caption" color={colors.muted} style={styles.consequenceLine}>
            {selected.isAssist
              ? 'You’ll confirm before Ravi can see anything.'
              : `Everyone at ${selected.name.replace(/^.*— /, '')} will see your screen.`}
          </AppText>
        </StateSwap>

        <Button
          label={selected.isAssist ? 'Cast my screen to IT' : 'Cast my screen'}
          onPress={onCast}
          icon={
            selected.isAssist ? (
              <Headphones size={17} color={colors.white} strokeWidth={2.4} />
            ) : (
              <Cast size={17} color={colors.white} strokeWidth={2.4} />
            )
          }
        />
      </Entrance>

    </View>
  );
}

/** The incoming request, landed on the entry page instead of hijacking it.
 *  Reviewing raises the consent step — the banner itself never starts a cast. */
function RequestBanner({ onReview, onDismiss }: { onReview: () => void; onDismiss: () => void }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  // Deliberately NOT pressable. The banner carries two explicit actions of its
  // own (Review, Dismiss), so making the whole surface a third button nested
  // both inside it — invalid on web, and on iOS the outer button swallows the
  // inner two, leaving Dismiss unreachable by VoiceOver. The Review chip is
  // right there; the banner doesn't need to be a button too.
  return (
    <View
      accessibilityRole="summary"
      style={[styles.banner, { backgroundColor: colors.primaryTint, borderColor: hexA(colors.primary, 0.4) }]}
    >
      <Avatar initials="RK" color={colors.violet} size={control.tile} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.bannerTitleRow}>
          {reduced ? (
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
          ) : (
            <PulseDot color={colors.primary} size={6} />
          )}
          <AppText variant="bodyBold" size="micro" color={colors.primary} style={{ letterSpacing: 1 }}>
            REQUEST WAITING
          </AppText>
        </View>
        <AppText variant="bodySemibold" size="footnote" numberOfLines={2} style={{ marginTop: layout.captionGap }}>
          IT · Ravi Kumar wants to start a session
        </AppText>
      </View>
      <View style={styles.bannerActions}>
        <Chip label="Review" active onPress={onReview} />
        <PressableScale
          onPress={onDismiss}
          scaleTo={0.88}
          hitSlop={touch.slopFor(DISMISS_BOX)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss screen cast request from Ravi Kumar, IT Admin"
          style={styles.bannerDismiss}
        >
          <X size={control.icon.sm} color={colors.muted} strokeWidth={2.4} />
        </PressableScale>
      </View>
    </View>
  );
}

function TargetRow({ target, on, onPress }: { target: CastTarget; on: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const accent = target.isAssist ? colors.success : colors.primary;
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={`Cast to ${target.name}, ${target.status}`}
      accessibilityState={{ selected: on }}
    >
      <Card style={[styles.targetRow, { borderColor: on ? colors.primary : colors.border }]}>
        <IconTile bg={target.isAssist ? colors.successTint : colors.primaryTint}>
          {target.isAssist ? (
            <Headphones size={control.icon.lg} color={accent} strokeWidth={2} />
          ) : (
            <Monitor size={control.icon.lg} color={colors.primary} strokeWidth={2} />
          )}
        </IconTile>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="bodySemibold" size="footnote" numberOfLines={1}>
            {target.name}
          </AppText>
          <View style={styles.targetSubRow}>
            {/* The status word is rendered right beside it, so the dot only
                carries the label for a screen reader. */}
            <StatusDot color={colors.success} label={target.status} labelHidden size={6} />
            <AppText variant="bodySemibold" size="micro" color={colors.success}>
              {target.status}
            </AppText>
            <AppText variant="body" size="caption" color={colors.muted} numberOfLines={1} style={{ flex: 1 }}>
              · {target.sub}
            </AppText>
          </View>
        </View>
        <Radio on={on} />
      </Card>
    </PressableScale>
  );
}

/** Selection mark — springs so picking a target feels like a switch throwing. */
function Radio({ on }: { on: boolean }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      v.setValue(on ? 1 : 0);
      return;
    }
    const a = Animated.spring(v, { toValue: on ? 1 : 0, useNativeDriver: true, damping: 12, stiffness: 260, mass: 0.6 });
    a.start();
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, reduced]);
  return (
    <View style={[styles.radio, { borderColor: on ? colors.primary : colors.borderStrong }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.radioFill,
          { backgroundColor: colors.primary, opacity: v, transform: [{ scale: v }] },
        ]}
      >
        <Check size={11} color={colors.white} strokeWidth={3.2} />
      </Animated.View>
    </View>
  );
}

/* ================================================================== *
 *  CONSENT — full-screen takeover, raised only on a deliberate Review.
 * ================================================================== */

function ConsentTakeover({
  fromRequest,
  ownPersonal,
  onDecline,
  onAllow,
}: {
  /** true = IT asked and you're answering; false = you asked for the assist. */
  fromRequest: boolean;
  ownPersonal: boolean;
  onDecline: () => void;
  onAllow: () => void;
}) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const s = skin(isDark);
  const [showDetails, setShowDetails] = useState(false);
  return (
    // This is a takeover, not a Modal — StateSwap simply replaces the entry view,
    // so without `accessibilityViewIsModal` VoiceOver keeps walking the screen
    // underneath while the highest-stakes decision in the app is on top of it.
    <View style={styles.sessionRoot} accessibilityViewIsModal>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Entrance>
          <View style={styles.avatarStage}>
            <GlowOrb
              size={220}
              colors={[colors.primary, colors.primaryStrong]}
              opacity={isDark ? 0.3 : 0.16}
              style={{ top: -35, left: -35 }}
            />
            {!reduced && <PulseRings size={116} color={colors.primary} duration={2000} count={2} />}
            <View style={[styles.avatar, { backgroundColor: colors.violet }]}>
              <AppText variant="displaySemibold" color={colors.white} style={{ fontSize: 30 }}>
                RK
              </AppText>
            </View>
          </View>
        </Entrance>

        <Entrance delay={80}>
          <AppText
            variant="bodyBold"
            size="micro"
            color={colors.muted2}
            style={[styles.microLabel, { textAlign: 'center', marginTop: layout.sectionGap }]}
          >
            {fromRequest ? 'SCREEN CAST REQUEST' : 'CONFIRM SCREEN CAST'}
          </AppText>
          <AppText variant="display" size="display" accessibilityRole="header" style={styles.takeoverH1}>
            {fromRequest ? 'Ravi Kumar wants to view your screen' : 'Let Ravi Kumar view your screen?'}
          </AppText>
          <AppText
            variant="body"
            size="caption"
            color={colors.muted}
            style={{ textAlign: 'center', marginTop: layout.captionGap }}
          >
            IT Admin · {ORG_NAME}
          </AppText>
        </Entrance>

        <Entrance delay={160}>
          <AppText variant="bodyMedium" size="footnote" color={colors.text2} style={styles.consequence}>
            They will see everything on this screen until you end it.
          </AppText>

          <PressableScale
            onPress={() => setShowDetails((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="What can they see?"
            accessibilityState={{ expanded: showDetails }}
            // Bare text: the caption's 16pt line box is the whole target, so the
            // slop has to carry all 28 remaining points to clear 44.
            hitSlop={touch.slopFor(DISCLOSURE_LINE)}
            style={{ alignSelf: 'center', marginTop: layout.blockGap }}
          >
            <AppText variant="bodySemibold" size="caption" color={colors.primary}>
              {showDetails ? 'Hide details' : 'What can they see?'}
            </AppText>
          </PressableScale>
        </Entrance>

        {showDetails && (
          <Entrance from={8}>
            <Card padded={false} style={[styles.detailCard, { backgroundColor: s.fill, borderColor: s.edge }]}>
              <ConsentRow tone="see" text="Everything on your screen, live" />
              <ConsentRow tone="never" text="See your screen once you tap End" bordered />
              <ConsentRow tone="never" text="Tap, type or control your device" bordered />
              {ownPersonal && <ConsentRow tone="never" text="See your personal apps or data" bordered />}
            </Card>
          </Entrance>
        )}
      </View>

      <Entrance delay={240}>
        <View style={styles.callControls}>
          <View style={styles.callControl}>
            <PressableScale
              onPress={onDecline}
              scaleTo={0.92}
              accessibilityRole="button"
              accessibilityLabel={fromRequest ? 'Decline screen cast' : 'Cancel screen cast'}
              style={[styles.roundBtn, { backgroundColor: s.fill, borderWidth: 1, borderColor: s.edge }]}
            >
              <X size={26} color={colors.text} strokeWidth={2.2} />
            </PressableScale>
            <AppText variant="bodyMedium" size="caption" color={colors.text2}>
              {fromRequest ? 'Decline' : 'Not now'}
            </AppText>
          </View>
          <View style={styles.callControl}>
            <PressableScale
              onPress={onAllow}
              scaleTo={0.92}
              accessibilityRole="button"
              accessibilityLabel="Allow screen cast"
              style={[styles.roundBtn, { backgroundColor: colors.success }]}
            >
              <Check size={26} color={colors.white} strokeWidth={2.4} />
            </PressableScale>
            <AppText variant="bodyMedium" size="caption" color={colors.text2}>
              Allow
            </AppText>
          </View>
        </View>
        <AppText variant="body" size="micro" color={colors.muted} style={{ textAlign: 'center' }}>
          {fromRequest ? 'Your choice is logged to Activity.' : 'Nothing is shared until you tap Allow.'}
        </AppText>
      </Entrance>
    </View>
  );
}

function ConsentRow({ tone, text, bordered }: { tone: 'see' | 'never'; text: string; bordered?: boolean }) {
  const { colors, isDark } = useTheme();
  const s = skin(isDark);
  const isSee = tone === 'see';
  return (
    <View style={[styles.detailRow, bordered && { borderTopWidth: 1, borderTopColor: s.hair }]}>
      <View
        style={[
          styles.detailRowIcon,
          { backgroundColor: isSee ? hexA(colors.amber, 0.2) : hexA(colors.success, 0.2) },
        ]}
      >
        {isSee ? (
          <Eye size={12} color={colors.amber} strokeWidth={2.4} />
        ) : (
          <Check size={12} color={colors.successStrong} strokeWidth={2.6} />
        )}
      </View>
      <AppText variant="bodyMedium" size="caption" color={isSee ? colors.text : colors.text2} style={{ flex: 1 }}>
        {isSee ? text : `They can never: ${text.charAt(0).toLowerCase()}${text.slice(1)}`}
      </AppText>
    </View>
  );
}

/* ================================================================== *
 *  CONNECTING — the handshake, ratcheting shut in step with the store.
 * ================================================================== */

const HANDSHAKE = ['Authorising with IT', 'Exchanging keys', 'Locking the channel'];

function ConnectingRitual({ target, onCancel }: { target: CastTarget | null; onCancel: () => void }) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const s = skin(isDark);
  const who = target ? (target.isAssist ? 'RAVI KUMAR' : target.name.toUpperCase()) : '';

  // One clock for the whole handshake: the ring charges 0→100% across the same
  // window the store takes to flip to 'live', so the ritual lands, not lingers.
  const [step, setStep] = useState(reduced ? HANDSHAKE.length : 0);
  const charge = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const checkDraw = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const landed = step >= HANDSHAKE.length;

  useEffect(() => {
    if (reduced) {
      charge.setValue(1);
      checkDraw.setValue(1);
      setStep(HANDSHAKE.length);
      return;
    }
    const anims: Animated.CompositeAnimation[] = [];
    const charging = Animated.timing(charge, {
      toValue: 1,
      duration: LAND_AT,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });
    anims.push(charging);
    charging.start();

    const ts = HANDSHAKE.map((_, i) => setTimeout(() => setStep(i + 1), 560 + i * 600));
    ts.push(
      setTimeout(() => {
        // the handshake lands: disc kicks, check draws itself shut
        const kick = Animated.sequence([
          Animated.timing(pop, { toValue: 1.09, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(pop, { toValue: 1, useNativeDriver: true, damping: 8, stiffness: 220, mass: 0.6 }),
        ]);
        const draw = Animated.timing(checkDraw, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        });
        anims.push(kick, draw);
        kick.start();
        draw.start();
      }, LAND_AT),
    );
    return () => {
      ts.forEach(clearTimeout);
      anims.forEach((a) => a.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <View style={[styles.sessionRoot, { alignItems: 'center', justifyContent: 'center' }]}>
      <Entrance>
        <View
          style={styles.radarStage}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <BreathRing size={STAGE} color={colors.primary} delay={0} base={isDark ? 0.5 : 0.35} active={!landed} />
          <BreathRing size={188} color={colors.primary} delay={400} base={isDark ? 0.38 : 0.28} active={!landed} />
          <RadarSweep size={STAGE} color={colors.primary} active={!landed} />

          {/* charge ring — 0→100% in step with the store's connect window */}
          <View style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
            <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                fill="none"
                stroke={s.edge}
                strokeWidth={3}
              />
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                fill="none"
                stroke={landed ? colors.success : colors.primary}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={`${RING_C}`}
                strokeDashoffset={charge.interpolate({ inputRange: [0, 1], outputRange: [RING_C, 0] })}
              />
            </Svg>
          </View>

          <Animated.View
            style={[
              styles.glyphDisc,
              { backgroundColor: colors.surface, borderColor: s.edge, transform: [{ scale: pop }] },
            ]}
          >
            <Animated.View style={{ position: 'absolute', opacity: checkDraw.interpolate({ inputRange: [0, 0.3], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
              <Smartphone size={30} color={colors.text} strokeWidth={1.8} />
            </Animated.View>
            <Svg width={CHECK_BOX} height={CHECK_BOX} viewBox={`0 0 ${CHECK_BOX} ${CHECK_BOX}`}>
              <AnimatedPath
                d="M12 23 L19 30 L32 14"
                fill="none"
                stroke={colors.success}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${CHECK_LEN}`}
                strokeDashoffset={checkDraw.interpolate({ inputRange: [0, 1], outputRange: [CHECK_LEN, 0] })}
              />
            </Svg>
          </Animated.View>
        </View>
      </Entrance>

      <Entrance delay={100}>
        <View accessibilityLiveRegion="polite" style={{ alignItems: 'center' }}>
          <StateSwap stateKey={landed ? 'ready' : 'working'}>
            <AppText
              variant="displaySemibold"
              size="callout"
              style={{ textAlign: 'center', marginTop: layout.sectionGap }}
            >
              {/* One object, one name: this ternary used to call the same thing
                  a "secure cast" while it worked and a "secure channel" the
                  instant it landed. */}
              {landed ? 'Screen cast ready' : 'Establishing screen cast…'}
            </AppText>
          </StateSwap>
        </View>
        <AppText style={[styles.connectingReceipt, { color: colors.muted }]}>
          {SESSION_ID} · ENCRYPTED · {who}
        </AppText>
      </Entrance>

      {/* the handshake itself — three beats that ratchet shut, never re-open */}
      <Entrance delay={160}>
        <Card padded={false} style={[styles.stepCard, { backgroundColor: s.fill, borderColor: s.edge }]}>
          {HANDSHAKE.map((label, i) => (
            <StepRow
              key={label}
              label={label}
              state={step > i ? 'done' : step === i ? 'active' : 'pending'}
              bordered={i > 0}
            />
          ))}
        </Card>
      </Entrance>

      <Entrance delay={220}>
        <PressableScale
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel screen cast"
          // Renders at the dense `sm` height; slop carries it to 44.
          hitSlop={touch.slopFor(control.height.sm)}
          style={[styles.cancelBtn, { borderColor: s.edge, backgroundColor: s.fill }]}
        >
          <AppText variant="bodySemibold" size="footnote" color={colors.text2}>
            Cancel
          </AppText>
        </PressableScale>
      </Entrance>
    </View>
  );
}

function StepRow({ label, state, bordered }: { label: string; state: 'done' | 'active' | 'pending'; bordered?: boolean }) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const s = skin(isDark);
  const v = useRef(new Animated.Value(state === 'done' ? 1 : 0)).current;
  useEffect(() => {
    if (state !== 'done') return;
    if (reduced) {
      v.setValue(1);
      return;
    }
    const a = Animated.spring(v, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 240, mass: 0.6 });
    a.start();
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, reduced]);

  return (
    <View style={[styles.stepRow, bordered && { borderTopWidth: 1, borderTopColor: s.hair }]}>
      <View style={styles.stepNode}>
        {state === 'done' ? (
          <Animated.View
            style={[styles.stepDisc, { backgroundColor: colors.success, transform: [{ scale: v }], opacity: v }]}
          >
            <Check size={11} color={colors.white} strokeWidth={3.2} />
          </Animated.View>
        ) : state === 'active' ? (
          <View
            style={[
              styles.stepDisc,
              { backgroundColor: hexA(colors.primary, 0.16), borderWidth: 1, borderColor: hexA(colors.primary, 0.5) },
            ]}
          >
            {reduced ? (
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
            ) : (
              <PulseDot color={colors.primary} size={6} />
            )}
          </View>
        ) : (
          <View style={[styles.stepDisc, { borderWidth: 1, borderColor: s.edge }]} />
        )}
      </View>
      <AppText
        variant={state === 'pending' ? 'body' : 'bodyMedium'}
        size="caption"
        color={state === 'pending' ? colors.muted2 : state === 'active' ? colors.text : colors.text3}
        style={{ flex: 1 }}
      >
        {label}
      </AppText>
    </View>
  );
}

/** Concentric ring whose opacity breathes on a staggered loop (opacity-only). */
function BreathRing({
  size,
  color,
  delay,
  base,
  active,
}: {
  size: number;
  color: string;
  delay: number;
  base: number;
  active: boolean;
}) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced || !active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, active]);
  const opacity = reduced || !active ? base : v.interpolate({ inputRange: [0, 1], outputRange: [base * 0.5, base] });
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: color,
        opacity,
      }}
    />
  );
}

/** Rotating radar wedge — two stacked SVG arcs fake a conic gradient sweep.
 *  It means "still looking": once the handshake lands it stops and fades. */
function RadarSweep({ size, color, active }: { size: number; color: string; active: boolean }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduced || !active) return;
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, active]);
  useEffect(() => {
    if (active) return;
    if (reduced) {
      fade.setValue(0);
      return;
    }
    const a = Animated.timing(fade, { toValue: 0, duration: 260, easing: Easing.out(Easing.ease), useNativeDriver: true });
    a.start();
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced]);
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const c = size / 2;
  const r = c - 6;
  const wedge = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    const x = c + r * Math.sin(rad);
    const y = c - r * Math.cos(rad);
    return `M${c} ${c} L${c} ${c - r} A${r} ${r} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Z`;
  };
  if (reduced) return null;
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', width: size, height: size, opacity: fade, transform: [{ rotate }] }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Path d={wedge(58)} fill={color} opacity={0.1} />
        <Path d={wedge(22)} fill={color} opacity={0.18} />
        <Line x1={c} y1={c} x2={c} y2={c - r} stroke={color} strokeWidth={2} opacity={0.7} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

/* ================================================================== *
 *  LIVE — the session, theme-aware, Zoom rule of three.
 * ================================================================== */

function LiveSession({
  target,
  castSecs,
  ownPersonal,
  onEnd,
}: {
  target: CastTarget | null;
  castSecs: number;
  ownPersonal: boolean;
  onEnd: () => void;
}) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const s = skin(isDark);
  const [paused, setPaused] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const isAssist = !!target?.isAssist;
  const accent = paused ? colors.amber : colors.success;

  // The store's clock keeps running while paused, so the timer is derived, not
  // displayed raw: it counts the time they could actually SEE the screen, and
  // freezes the moment you pause. Honest without touching the store.
  // The bookkeeping stays OUT of the setPaused updater: React may replay an
  // updater when rebasing a render, and a replayed `pausedTotal +=` would
  // double-count and jump the timer backwards. This component re-renders on
  // every store tick, so `castSecs` is already current in the handler.
  const pausedTotal = useRef(0);
  const pausedAt = useRef(0);
  const togglePause = () => {
    if (paused) {
      pausedTotal.current += castSecs - pausedAt.current;
      setPaused(false);
    } else {
      pausedAt.current = castSecs;
      setPaused(true);
    }
  };
  const shownSecs = Math.max(0, (paused ? pausedAt.current : castSecs) - pausedTotal.current);
  const elapsed = mmss(shownSecs);

  const startedStamp = useMemo(() => {
    const d = new Date();
    return `${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}`;
  }, []);

  return (
    <View style={styles.sessionRoot}>
      {/* 1 · Status row — liveness is throughput, so the bars die when paused */}
      <View style={styles.liveTop}>
        {/* LIVE <-> PAUSED flips with no other announcement, so it is the live
            region — not the timer, which reprints every second and would make
            TalkBack read the clock aloud once a second for the whole session. */}
        <View accessibilityLiveRegion="polite">
          <GlassPill tint={accent}>
            {reduced ? (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} />
            ) : (
              <PulseDot color={accent} size={8} />
            )}
            <AppText variant="bodyBold" size="micro" color={accent} style={{ letterSpacing: 0.8 }}>
              {paused ? 'PAUSED' : 'LIVE'}
            </AppText>
          </GlassPill>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.liveMeta}>
          {!paused && !reduced && <EqualizerBars color={colors.success} />}
          <View style={{ alignItems: 'flex-end' }}>
            <AppText
              accessibilityLabel={paused ? `Cast time ${elapsed}, paused` : `Elapsed time ${elapsed}`}
              style={[styles.elapsed, { color: paused ? colors.muted : colors.text }]}
            >
              {elapsed}
            </AppText>
            {paused && (
              <AppText style={[styles.notCounting, { color: colors.muted2 }]}>NOT COUNTING</AppText>
            )}
          </View>
        </View>
      </View>

      {/* 2 · Who is watching */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.avatarStage}>
          <GlowOrb
            size={210}
            colors={[accent, accent]}
            opacity={paused ? (isDark ? 0.12 : 0.08) : isDark ? 0.22 : 0.14}
            style={{ top: -30, left: -30 }}
          />
          {!paused && !reduced && <PulseRings size={112} color={colors.success} duration={2400} count={2} />}
          <Entrance scaleFrom={0.88} from={0}>
            <View style={[styles.avatar, { backgroundColor: isAssist ? colors.violet : colors.info }]}>
              {isAssist ? (
                <AppText variant="displaySemibold" color={colors.white} style={{ fontSize: 28 }}>
                  RK
                </AppText>
              ) : (
                <Monitor size={36} color={colors.white} strokeWidth={2} />
              )}
            </View>
          </Entrance>
          <EyeBadge color={accent} paused={paused} ringColor={colors.canvas} />
        </View>

        {/* Entering the live session — and pausing it — changes nothing else a
            screen reader would notice, so the headline announces itself. */}
        <View accessibilityLiveRegion="polite" style={{ alignSelf: 'stretch' }}>
          <AppText variant="display" size="title" accessibilityRole="header" style={styles.liveH1}>
            {paused ? 'Screen cast paused' : isAssist ? 'Ravi Kumar is viewing your screen' : `Casting to ${target?.name}`}
          </AppText>
          <AppText
            variant="body"
            size="caption"
            color={colors.muted}
            style={{ textAlign: 'center', marginTop: layout.captionGap }}
          >
            {paused
              ? 'They can’t see your screen right now'
              : isAssist
                ? `IT Admin · ${ORG_NAME}`
                : target?.sub}
          </AppText>
        </View>
        {ownPersonal && (
          <AppText
            variant="bodyMedium"
            size="caption"
            color={colors.text2}
            style={{ textAlign: 'center', marginTop: layout.labelGap }}
          >
            Personal apps stay hidden
          </AppText>
        )}

        {/* Tap-to-expand session receipt */}
        <PressableScale
          onPress={() => setReceiptOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Session receipt"
          // Renders at the dense `sm` height; slop carries it to 44.
          hitSlop={touch.slopFor(control.height.sm)}
          style={[styles.receiptToggle, { borderColor: s.edge, backgroundColor: s.fill }]}
        >
          <ShieldCheck size={13} color={colors.text2} strokeWidth={2.2} />
          <AppText variant="bodySemibold" size="micro" color={colors.text2} style={{ letterSpacing: 1 }}>
            SESSION RECEIPT
          </AppText>
          <ChevronRight size={13} color={colors.muted} strokeWidth={2.2} />
        </PressableScale>
      </View>

      {/* 3 · Controls */}
      <View style={styles.liveControls}>
        <PressableScale
          onPress={togglePause}
          scaleTo={0.93}
          accessibilityRole="button"
          accessibilityLabel={paused ? 'Resume screen cast' : 'Pause screen cast'}
          style={[styles.pauseBtn, { backgroundColor: s.fill, borderColor: s.edge }]}
        >
          {paused ? (
            <Play size={control.icon.lg} color={colors.text} strokeWidth={2} />
          ) : (
            <Pause size={control.icon.lg} color={colors.text} strokeWidth={2} />
          )}
        </PressableScale>
        <Button
          label="End session"
          variant="danger"
          size="lg"
          onPress={() => setConfirmEnd(true)}
          icon={<Square size={control.icon.md} color={colors.white} strokeWidth={2.2} />}
          accessibilityLabel="End session"
          style={{ flex: 1 }}
        />
      </View>

      {/* Session receipt — a drawer, matching gateway details and history rather
          than an inline expander that shoved the controls around. */}
      <BottomSheet visible={receiptOpen} onClose={() => setReceiptOpen(false)} accessibilityLabel="Session receipt">
        <View style={styles.sheetBody}>
          <AppText variant="display" size="title" accessibilityRole="header">
            Session receipt
          </AppText>
          <AppText style={[styles.sheetReceipt, { color: colors.muted2 }]}>
            {SESSION_ID} · HD · STARTED {startedStamp}
          </AppText>
          <Card
            padded={false}
            style={[styles.detailCard, { backgroundColor: colors.surfaceSunken, borderColor: colors.border }]}
          >
            <ReceiptRow
              ok={!paused}
              highlight={paused}
              text={paused ? 'Paused — they can’t see your screen right now' : 'They see this screen, live'}
            />
            <ReceiptRow ok={false} bordered text="They can’t tap or control your device" />
            <ReceiptRow ok={false} bordered text="Nothing is kept after you end the session" />
          </Card>
          <Button
            label="Done"
            variant="secondary"
            size="lg"
            onPress={() => setReceiptOpen(false)}
            accessibilityLabel="Close session receipt"
            style={{ marginTop: layout.blockGap }}
          />
        </View>
      </BottomSheet>

      {/* Ending is one tap from irreversible — someone is mid-session on the other
          end, so state the consequence first. Mirrors the tunnel's disconnect sheet. */}
      <BottomSheet visible={confirmEnd} onClose={() => setConfirmEnd(false)} accessibilityLabel="End this session">
        <View style={styles.sheetBody}>
          <AppText variant="display" size="title" accessibilityRole="header">
            End this session?
          </AppText>
          <AppText style={[styles.sheetReceipt, { color: colors.muted2 }]}>
            {SESSION_ID} · {elapsed} · {(target?.name || '').toUpperCase()}
          </AppText>
          <AppText variant="bodyMedium" size="footnote" color={colors.text3} style={styles.sheetCopy}>
            Casting stops immediately — {target?.name || 'the display'} can no longer see your screen. The session
            stays in your history.
          </AppText>
          <Button
            label="End session"
            variant="danger"
            size="lg"
            onPress={() => {
              setConfirmEnd(false);
              onEnd();
            }}
            accessibilityLabel="End session now"
            style={{ marginTop: layout.blockGap }}
          />
          <Button
            label="Keep casting"
            variant="secondary"
            size="lg"
            onPress={() => setConfirmEnd(false)}
            accessibilityLabel="Keep casting"
            style={{ marginTop: layout.cardGap }}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

/** The watcher's eye — it blinks every few seconds because a PERSON is on the
 *  other end, and closes the moment you pause. Personality that reports state.
 *  Decorative: the headline beside it already says who is watching. */
function EyeBadge({ color, paused, ringColor }: { color: string; paused: boolean; ringColor: string }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduced || paused) {
      blink.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(3400),
        Animated.timing(blink, { toValue: 0.1, duration: 90, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, paused]);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.eyeBadge, { backgroundColor: color, borderColor: ringColor }]}
    >
      {paused ? (
        <EyeOff size={15} color={colors.white} strokeWidth={2.4} />
      ) : (
        <Animated.View style={{ transform: [{ scaleY: blink }] }}>
          <Eye size={15} color={colors.white} strokeWidth={2.4} />
        </Animated.View>
      )}
    </View>
  );
}

function ReceiptRow({ ok, bordered, highlight, text }: { ok: boolean; bordered?: boolean; highlight?: boolean; text: string }) {
  const { colors, isDark } = useTheme();
  const s = skin(isDark);
  return (
    <View style={[styles.detailRow, bordered && { borderTopWidth: 1, borderTopColor: s.hair }]}>
      <View
        style={[
          styles.detailRowIcon,
          {
            backgroundColor: highlight
              ? hexA(colors.amber, 0.22)
              : ok
                ? hexA(colors.success, 0.22)
                : s.fill,
          },
        ]}
      >
        {ok ? (
          <Check size={12} color={colors.successStrong} strokeWidth={2.6} />
        ) : highlight ? (
          <Pause size={11} color={colors.amber} strokeWidth={2.4} />
        ) : (
          <X size={12} color={colors.muted} strokeWidth={2.6} />
        )}
      </View>
      <AppText variant="bodyMedium" size="caption" color={ok || highlight ? colors.text : colors.text2} style={{ flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}

/* ================================================================== */

/** Sub-44 targets whose rendered box is the text itself — paired with
 *  `touch.slopFor` at the call site so the target still clears 44. */
const DISCLOSURE_LINE = 16; // the caption line box behind "What can they see?"
const DISMISS_BOX = 26; // the banner's X

const styles = StyleSheet.create({
  root: { flex: 1 },

  // entry — the root SafeAreaView owns the bottom inset; this is the resting
  // gap on top of it, so `insets.bottom` is deliberately NOT added again.
  entryRoot: {
    flex: 1,
    paddingHorizontal: layout.gutter,
    paddingTop: layout.screenTop,
    paddingBottom: layout.screenBottom,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: layout.sectionGap,
    marginBottom: layout.labelGap,
  },
  microLabel: { letterSpacing: 1.1 },
  consequenceSlot: { minHeight: space[8], justifyContent: 'center' },
  consequenceLine: { textAlign: 'center', marginBottom: layout.labelGap },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: layout.rowGap },
  targetSubRow: { flexDirection: 'row', alignItems: 'center', gap: layout.labelGap, marginTop: layout.captionGap },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  radioFill: { alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  historyLink: { marginTop: layout.cardGap, overflow: 'hidden' },
  sheetCopy: { marginTop: layout.blockGap },

  // incoming request banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.rowGap,
    borderWidth: 1,
    borderRadius: radii.card,
    padding: layout.cardPad,
  },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: layout.labelGap },
  bannerActions: { flexDirection: 'row', alignItems: 'center', gap: layout.captionGap, flexShrink: 0 },
  bannerDismiss: { width: DISMISS_BOX, height: DISMISS_BOX, alignItems: 'center', justifyContent: 'center' },

  // history sheet — BottomSheet already pads for the home indicator plus
  // `layout.screenBottom`, so this must not claim the bottom a second time.
  sheetBody: { paddingHorizontal: layout.sheetPad, paddingTop: layout.labelGap },
  historyCard: { overflow: 'hidden' },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.labelGap,
    marginTop: layout.blockGap,
  },

  // shared session world
  sessionRoot: {
    flex: 1,
    paddingHorizontal: layout.gutter,
    paddingTop: layout.screenTop,
    paddingBottom: layout.screenBottom,
  },
  avatarStage: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  eyeBadge: {
    position: 'absolute',
    right: 22,
    bottom: 22,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  detailCard: { paddingHorizontal: layout.cardPad, marginTop: layout.blockGap, alignSelf: 'stretch' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: layout.labelGap, paddingVertical: layout.rowPadV },
  detailRowIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  // consent takeover
  takeoverH1: { textAlign: 'center', marginTop: layout.labelGap, letterSpacing: -0.2, maxWidth: 300, alignSelf: 'center' },
  consequence: { textAlign: 'center', marginTop: layout.blockGap, maxWidth: 280, alignSelf: 'center' },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    marginBottom: layout.blockGap,
  },
  callControl: { alignItems: 'center', gap: layout.labelGap },
  roundBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },

  // connecting
  radarStage: { width: STAGE, height: STAGE, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  glyphDisc: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // MONO receipt lines keep their raw size by the type ramp's own exception.
  connectingReceipt: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: layout.labelGap,
  },
  stepCard: { paddingHorizontal: layout.cardPad, marginTop: layout.sectionGap, alignSelf: 'stretch' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: layout.labelGap, paddingVertical: layout.rowPadV },
  stepNode: { width: 22, alignItems: 'center' },
  stepDisc: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: {
    alignSelf: 'center',
    marginTop: layout.sectionGap,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: layout.sheetPad,
    height: control.height.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // live
  liveTop: { flexDirection: 'row', alignItems: 'center', paddingTop: layout.captionGap },
  liveMeta: { flexDirection: 'row', alignItems: 'center', gap: layout.labelGap },
  elapsed: { fontFamily: MONO, fontSize: 14, letterSpacing: 0.5 },
  notCounting: { fontFamily: MONO, fontSize: 8, letterSpacing: 0.8, marginTop: layout.captionGap },
  liveH1: { textAlign: 'center', marginTop: layout.sectionGap, letterSpacing: -0.2, maxWidth: 300, alignSelf: 'center' },
  receiptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.labelGap,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: layout.rowPadH,
    height: control.height.sm,
    marginTop: layout.sectionGap,
  },
  liveControls: { flexDirection: 'row', alignItems: 'center', gap: layout.cardGap },
  pauseBtn: {
    width: control.height.lg,
    height: control.height.lg,
    borderRadius: radii.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetReceipt: { fontFamily: MONO, fontSize: 10, letterSpacing: 0.6, marginTop: layout.captionGap },
});
