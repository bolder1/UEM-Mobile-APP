import React, { useEffect, useRef, useState } from 'react';
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
  FileText,
  History,
  UserCog,
  Eye,
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
import { BottomSheet } from '../../components/BottomSheet';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Entrance, PressableScale, Float3D, GlowOrb, StateSwap } from '../../components/Motion';
import { GlassPill } from '../../components/Glass';
import { PulseRings, PulseDot } from '../../components/Animations';
import { MONO } from '../../theme/typography';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { useAppStore, ORG_NAME } from '../../state/store';
import { CAST_TARGETS } from '../../data/mockData';
import { CastTarget } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Cast'>;

const IT_ASSIST_TARGET = CAST_TARGETS.find((t) => t.isAssist)!;

// The always-dark session canvas (takeover / connecting / live share the
// same "world" so transitions between them read as weather, not jumps).
const DARK_BG = '#070A0E';
const DARK_BG_2 = '#10151C';
const D_TEXT = 'rgba(255,255,255,0.92)';
const D_TEXT_2 = 'rgba(255,255,255,0.62)';
const D_TEXT_3 = 'rgba(255,255,255,0.45)';
const D_GLASS = 'rgba(255,255,255,0.08)';
const D_HAIRLINE = 'rgba(255,255,255,0.14)';
const D_DANGER = '#FF9B9B'; // danger stays demoted: text, never a filled hero

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
  // never starts directly: tapping the assist target (or an incoming request)
  // raises the full-screen consent takeover, and only Allow starts the cast.
  const [consentTarget, setConsentTarget] = useState<CastTarget | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const requestCast = (t: CastTarget) => {
    if (t.isAssist) {
      setConsentTarget(t);
    } else {
      startCast(t);
    }
  };

  const acceptCast = () => {
    const t = consentTarget ?? IT_ASSIST_TARGET;
    setConsentTarget(null);
    startCast(t);
  };

  const declineCast = () => {
    setConsentTarget(null);
    dismissIncomingCast();
    logActivity('cast', 'Declined IT screen share', 'Ravi Kumar · IT Admin', 'you');
    showToast('Screen share declined', 'info', { logged: true, actor: 'you' });
  };

  const elapsed = `${Math.floor(castSecs / 60)}:${('0' + (castSecs % 60)).slice(-2)}`;

  const takeover = cast === 'idle' && (incomingCastSession || !!consentTarget);
  const mode: 'entry' | 'incoming' | 'connecting' | 'live' =
    cast === 'live' ? 'live' : cast === 'connecting' ? 'connecting' : takeover ? 'incoming' : 'entry';
  const darkWorld = mode !== 'entry';

  // "Weather change": the dark session canvas fades in/out under the content
  // instead of hard-cutting background colors between states.
  const darkFade = useRef(new Animated.Value(darkWorld ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      darkFade.setValue(darkWorld ? 1 : 0);
      return;
    }
    Animated.timing(darkFade, {
      toValue: darkWorld ? 1 : 0,
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkWorld, reduced]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={darkWorld || isDark ? 'light' : 'dark'} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: darkFade }]}>
        <LinearGradient colors={[DARK_BG_2, DARK_BG]} style={{ flex: 1 }} />
      </Animated.View>

      <StateSwap stateKey={mode} style={{ flex: 1 }} duration={340}>
        {mode === 'live' ? (
          <LiveSession
            target={castTarget}
            elapsed={elapsed}
            ownPersonal={form.own === 'personal'}
            onEnd={stopCast}
          />
        ) : mode === 'connecting' ? (
          <ConnectingRitual target={castTarget} onCancel={stopCast} />
        ) : mode === 'incoming' ? (
          <IncomingRequest
            ownPersonal={form.own === 'personal'}
            onDecline={declineCast}
            onAllow={acceptCast}
          />
        ) : (
          <EntryView
            onBack={() => navigation.goBack()}
            onTarget={requestCast}
            onHistory={() => setHistoryOpen(true)}
          />
        )}
      </StateSwap>

      <BottomSheet visible={historyOpen} onClose={() => setHistoryOpen(false)} maxHeightPct={80}>
        <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
          <AppText variant="display" style={{ fontSize: 19, marginBottom: 4 }}>
            Session history
          </AppText>
          <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5, lineHeight: 18, marginBottom: 16 }}>
            Every cast and screen share from this device, newest first.
          </AppText>

          {castHistory.length === 0 ? (
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 12.5 }}>
              No previous sessions.
            </AppText>
          ) : (
            <View style={[styles.historyCard, { backgroundColor: colors.surfaceSunken }]}>
              {castHistory.map((h, i) => (
                <View
                  key={h.id}
                  style={[
                    styles.historyRow,
                    i < castHistory.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.hairline },
                  ]}
                >
                  <View
                    style={[
                      styles.historyIcon,
                      { backgroundColor: h.initiatedBy === 'admin' ? colors.violetTint : colors.infoTint },
                    ]}
                  >
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
            </View>
          )}

          <View style={[styles.noteBox, { backgroundColor: colors.surfaceSunken }]}>
            <Lock size={16} color={colors.muted} strokeWidth={2} style={{ marginTop: 1 }} />
            <AppText variant="body" color={colors.text3} style={{ fontSize: 11.5, lineHeight: 17, flex: 1 }}>
              Casting is managed by {ORG_NAME} IT. Only approved displays appear here, and every session is logged
              for security.
            </AppText>
          </View>

          <AppText variant="body" color={colors.muted2} style={{ fontSize: 11, textAlign: 'center', marginTop: 16 }}>
            Every session is logged and visible to you.
          </AppText>
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

/* ================================================================== *
 *  ENTRY — single-viewport, theme-aware idle screen.
 * ================================================================== */

function EntryView({
  onBack,
  onTarget,
  onHistory,
}: {
  onBack: () => void;
  onTarget: (t: CastTarget) => void;
  onHistory: () => void;
}) {
  const { colors, isDark } = useTheme();
  return (
    <View style={styles.entryRoot}>
      <ScreenHeader title="Remote Cast" onBack={onBack} />

      {/* Device hero — phone in a neutral status ring, ambient glow behind */}
      <Entrance>
        <View style={styles.heroStage}>
          <GlowOrb
            size={232}
            colors={[colors.primary, colors.primaryStrong]}
            opacity={isDark ? 0.32 : 0.18}
            style={{ top: 0, left: 0 }}
          />
          <Svg width={232} height={232} viewBox="0 0 232 232" style={{ position: 'absolute' }}>
            <Circle cx={116} cy={116} r={112} stroke={colors.borderStrong} strokeWidth={1.5} fill="none" />
            <Circle
              cx={116}
              cy={116}
              r={99}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="3 8"
              fill="none"
              opacity={0.9}
            />
          </Svg>
          <Float3D rotate={4} float={5}>
            <View
              style={[
                styles.phoneBody,
                { backgroundColor: colors.surface, borderColor: colors.borderStrong },
              ]}
            >
              <View style={[styles.phoneNotch, { backgroundColor: colors.borderStrong }]} />
              <LinearGradient
                colors={[colors.primaryTint, colors.surfaceSunken]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.phoneScreen}
              >
                <Cast size={20} color={colors.primary} strokeWidth={2} />
              </LinearGradient>
            </View>
          </Float3D>
        </View>
      </Entrance>

      <Entrance delay={70}>
        <AppText variant="body" color={colors.muted} style={styles.freshness}>
          Ready to cast · Policy up to date
        </AppText>
      </Entrance>

      <Entrance delay={140}>
        <View style={styles.chipRow}>
          <TrustChip icon={<Lock size={11} color={colors.text3} strokeWidth={2.2} />} label="ENCRYPTED" />
          <TrustChip icon={<FileText size={11} color={colors.text3} strokeWidth={2.2} />} label="LOGGED" />
          <TrustChip
            icon={<ShieldCheck size={11} color={colors.text3} strokeWidth={2.2} />}
            label="IT-APPROVED DISPLAYS"
          />
        </View>
      </Entrance>

      <Entrance delay={210}>
        <AppText variant="bodyBold" color={colors.muted2} style={styles.microLabel}>
          CAST TO
        </AppText>
        <View style={{ gap: 8 }}>
          {CAST_TARGETS.map((t) => (
            <TargetRow key={t.id} target={t} onPress={() => onTarget(t)} />
          ))}
        </View>
      </Entrance>

      <View style={{ flex: 1 }} />

      <Entrance delay={280}>
        <PressableScale
          onPress={onHistory}
          accessibilityRole="button"
          accessibilityLabel="Open session history"
          style={[styles.historyLink, { borderTopColor: colors.hairline }]}
        >
          <History size={15} color={colors.muted} strokeWidth={2.2} />
          <AppText variant="bodySemibold" color={colors.text3} style={{ fontSize: 13, flex: 1 }}>
            Session history
          </AppText>
          <ChevronRight size={15} color={colors.muted2} strokeWidth={2.2} />
        </PressableScale>
      </Entrance>
    </View>
  );
}

function TrustChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  const { colors } = useTheme();
  return (
    <GlassPill tint={colors.muted} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
      {icon}
      <AppText variant="bodySemibold" color={colors.text3} style={{ fontSize: 10, letterSpacing: 0.8 }}>
        {label}
      </AppText>
    </GlassPill>
  );
}

function TargetRow({ target, onPress }: { target: CastTarget; onPress: () => void }) {
  const { colors } = useTheme();
  const accent = target.isAssist ? colors.success : colors.primary;
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={`Cast to ${target.name}, ${target.status}`}
      style={[styles.targetRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.targetIcon, { backgroundColor: target.isAssist ? colors.successTint : colors.primaryTint }]}>
        {target.isAssist ? (
          <Headphones size={18} color={accent} strokeWidth={2} />
        ) : (
          <Monitor size={18} color={colors.primary} strokeWidth={2} />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 13.5 }}>
          {target.name}
        </AppText>
        <AppText variant="body" color={colors.muted} numberOfLines={1} style={{ fontSize: 11.5, marginTop: 1 }}>
          {target.sub}
        </AppText>
      </View>
      <View style={styles.statusTag}>
        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
        <AppText variant="bodySemibold" color={colors.success} style={{ fontSize: 11 }}>
          {target.status}
        </AppText>
      </View>
    </PressableScale>
  );
}

/* ================================================================== *
 *  INCOMING — full-screen consent takeover (always dark).
 * ================================================================== */

function IncomingRequest({
  ownPersonal,
  onDecline,
  onAllow,
}: {
  ownPersonal: boolean;
  onDecline: () => void;
  onAllow: () => void;
}) {
  const { colors } = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  return (
    <View style={styles.darkRoot}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Entrance>
          <View style={styles.avatarStage}>
            <GlowOrb size={220} colors={[colors.primary, colors.primaryStrong]} opacity={0.3} style={{ top: -35, left: -35 }} />
            <PulseRings size={116} color={colors.primary} duration={2000} count={2} />
            <View style={[styles.avatar, { backgroundColor: colors.violet }]}>
              <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 30 }}>
                RK
              </AppText>
            </View>
          </View>
        </Entrance>

        <Entrance delay={80}>
          <AppText variant="bodyBold" color={D_TEXT_3} style={[styles.microLabel, { textAlign: 'center', marginTop: 26 }]}>
            SCREEN SHARE REQUEST
          </AppText>
          <AppText variant="display" color={D_TEXT} style={styles.takeoverH1}>
            Ravi Kumar wants to view your screen
          </AppText>
          <AppText variant="body" color={D_TEXT_3} style={{ fontSize: 12.5, textAlign: 'center', marginTop: 6 }}>
            IT Admin · {ORG_NAME}
          </AppText>
        </Entrance>

        <Entrance delay={160}>
          <AppText variant="bodyMedium" color={D_TEXT_2} style={styles.consequence}>
            They will see everything on this screen until you end it.
          </AppText>

          <PressableScale
            onPress={() => setShowDetails((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="What can they see?"
            accessibilityState={{ expanded: showDetails }}
            hitSlop={8}
            style={{ alignSelf: 'center', marginTop: 14 }}
          >
            <AppText variant="bodySemibold" color={colors.primary} style={{ fontSize: 12.5 }}>
              {showDetails ? 'Hide details' : 'What can they see?'}
            </AppText>
          </PressableScale>
        </Entrance>

        {showDetails && (
          <Entrance from={8}>
            <View style={styles.detailCard}>
              <DarkConsentRow tone="see" text="Everything on your screen, live" />
              <DarkConsentRow tone="never" text="See your screen once you tap End" bordered />
              <DarkConsentRow tone="never" text="Tap, type or control your device" bordered />
              {ownPersonal && <DarkConsentRow tone="never" text="See your personal apps or data" bordered />}
            </View>
          </Entrance>
        )}
      </View>

      <Entrance delay={240}>
        <View style={styles.callControls}>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <PressableScale
              onPress={onDecline}
              scaleTo={0.92}
              accessibilityRole="button"
              accessibilityLabel="Decline screen share"
              style={[styles.roundBtn, { backgroundColor: D_GLASS, borderWidth: 1, borderColor: D_HAIRLINE }]}
            >
              <X size={26} color={D_TEXT} strokeWidth={2.2} />
            </PressableScale>
            <AppText variant="bodyMedium" color={D_TEXT_2} style={{ fontSize: 12.5 }}>
              Decline
            </AppText>
          </View>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <PressableScale
              onPress={onAllow}
              scaleTo={0.92}
              accessibilityRole="button"
              accessibilityLabel="Allow screen share"
              style={[styles.roundBtn, { backgroundColor: colors.success }]}
            >
              <Check size={26} color="#FFFFFF" strokeWidth={2.4} />
            </PressableScale>
            <AppText variant="bodyMedium" color={D_TEXT_2} style={{ fontSize: 12.5 }}>
              Allow
            </AppText>
          </View>
        </View>
        <AppText variant="body" color={D_TEXT_3} style={{ fontSize: 11, textAlign: 'center', marginBottom: 10 }}>
          Your choice is logged to Activity.
        </AppText>
      </Entrance>
    </View>
  );
}

function DarkConsentRow({ tone, text, bordered }: { tone: 'see' | 'never'; text: string; bordered?: boolean }) {
  const { colors } = useTheme();
  const isSee = tone === 'see';
  return (
    <View style={[styles.detailRow, bordered && { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }]}>
      <View
        style={[
          styles.detailRowIcon,
          { backgroundColor: isSee ? 'rgba(201,127,16,0.2)' : 'rgba(29,158,95,0.2)' },
        ]}
      >
        {isSee ? (
          <Eye size={12} color={colors.amber} strokeWidth={2.4} />
        ) : (
          <Check size={12} color={colors.successStrong} strokeWidth={2.6} />
        )}
      </View>
      <AppText variant="bodyMedium" color={isSee ? D_TEXT : D_TEXT_2} style={{ fontSize: 12.5, flex: 1 }}>
        {isSee ? text : `They can never: ${text.charAt(0).toLowerCase()}${text.slice(1)}`}
      </AppText>
    </View>
  );
}

/* ================================================================== *
 *  CONNECTING — radar ritual (always dark).
 * ================================================================== */

function ConnectingRitual({ target, onCancel }: { target: CastTarget | null; onCancel: () => void }) {
  const { colors } = useTheme();
  const who = target ? (target.isAssist ? 'RAVI KUMAR' : target.name.toUpperCase()) : '';
  return (
    <View style={[styles.darkRoot, { alignItems: 'center', justifyContent: 'center' }]}>
      <Entrance>
        <View style={styles.radarStage}>
          <BreathRing size={240} color={colors.primary} delay={0} base={0.5} />
          <BreathRing size={188} color={colors.primary} delay={400} base={0.38} />
          <BreathRing size={136} color={colors.primary} delay={800} base={0.28} />
          <RadarSweep size={240} color={colors.primary} />
          <View style={[styles.phoneGlyphDisc, { borderColor: D_HAIRLINE }]}>
            <Smartphone size={30} color={D_TEXT} strokeWidth={1.8} />
          </View>
        </View>
      </Entrance>

      <Entrance delay={100}>
        <AppText variant="displaySemibold" color={D_TEXT} style={{ fontSize: 17, textAlign: 'center', marginTop: 34 }}>
          Establishing secure cast…
        </AppText>
        <AppText
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 0.5,
            color: D_TEXT_3,
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          CAST-7F2A · ENCRYPTED · {who}
        </AppText>
      </Entrance>

      <Entrance delay={200}>
        <PressableScale
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel casting"
          style={[styles.cancelBtn, { borderColor: D_HAIRLINE, backgroundColor: D_GLASS }]}
        >
          <AppText variant="bodySemibold" color={D_TEXT_2} style={{ fontSize: 13 }}>
            Cancel
          </AppText>
        </PressableScale>
      </Entrance>
    </View>
  );
}

/** Concentric ring whose opacity breathes on a staggered loop (opacity-only). */
function BreathRing({ size, color, delay, base }: { size: number; color: string; delay: number; base: number }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
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
  }, [reduced]);
  const opacity = reduced ? base : v.interpolate({ inputRange: [0, 1], outputRange: [base * 0.5, base] });
  return (
    <Animated.View
      pointerEvents="none"
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

/** Rotating radar wedge — two stacked SVG arcs fake a conic gradient sweep. */
function RadarSweep({ size, color }: { size: number; color: string }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const c = size / 2;
  const r = c - 6;
  const wedge = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    const x = c + r * Math.sin(rad);
    const y = c - r * Math.cos(rad);
    return `M${c} ${c} L${c} ${c - r} A${r} ${r} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Z`;
  };
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, transform: [{ rotate }] }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Path d={wedge(58)} fill={color} opacity={0.1} />
        <Path d={wedge(22)} fill={color} opacity={0.18} />
        <Line x1={c} y1={c} x2={c} y2={c - r} stroke={color} strokeWidth={2} opacity={0.7} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

/* ================================================================== *
 *  LIVE — dark session, Zoom rule of three.
 * ================================================================== */

function LiveSession({
  target,
  elapsed,
  ownPersonal,
  onEnd,
}: {
  target: CastTarget | null;
  elapsed: string;
  ownPersonal: boolean;
  onEnd: () => void;
}) {
  const { colors } = useTheme();
  const [paused, setPaused] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const isAssist = !!target?.isAssist;
  const accent = paused ? colors.amber : colors.success;

  return (
    <View style={styles.darkRoot}>
      {/* 1 · Status row */}
      <View style={styles.liveTop}>
        <GlassPill on="dark" tint={accent}>
          <PulseDot color={accent} size={8} />
          <AppText variant="bodyBold" color={accent} style={{ fontSize: 11, letterSpacing: 0.8 }}>
            {paused ? 'PAUSED' : 'LIVE'}
          </AppText>
        </GlassPill>
        <View style={{ flex: 1 }} />
        <AppText
          accessibilityLabel={`Elapsed time ${elapsed}`}
          style={{ fontFamily: MONO, fontSize: 14, color: D_TEXT, letterSpacing: 0.5 }}
        >
          {elapsed}
        </AppText>
      </View>

      {/* 2 · Who is watching */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.avatarStage}>
          <GlowOrb size={210} colors={[accent, accent]} opacity={paused ? 0.14 : 0.22} style={{ top: -30, left: -30 }} />
          {!paused && <PulseRings size={112} color={colors.success} duration={2400} count={2} />}
          <View style={[styles.avatar, { backgroundColor: isAssist ? colors.violet : '#2A323C' }]}>
            {isAssist ? (
              <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 28 }}>
                RK
              </AppText>
            ) : (
              <Monitor size={36} color="#FFFFFF" strokeWidth={2} />
            )}
          </View>
          <View style={[styles.eyeBadge, { backgroundColor: accent }]}>
            <Eye size={15} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </View>

        <AppText variant="display" color={D_TEXT} style={styles.liveH1}>
          {paused ? 'Sharing paused' : isAssist ? 'Ravi Kumar is viewing your screen' : `Mirroring to ${target?.name}`}
        </AppText>
        <AppText variant="body" color={D_TEXT_3} style={{ fontSize: 12.5, textAlign: 'center', marginTop: 6 }}>
          {paused
            ? 'They can’t see your screen right now'
            : isAssist
              ? `IT Admin · ${ORG_NAME}`
              : target?.sub}
        </AppText>
        {ownPersonal && (
          <AppText variant="bodyMedium" color={D_TEXT_2} style={{ fontSize: 11.5, textAlign: 'center', marginTop: 10 }}>
            Personal apps stay hidden
          </AppText>
        )}

        {/* Tap-to-expand session receipt */}
        <PressableScale
          onPress={() => setReceiptOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel="Session receipt"
          accessibilityState={{ expanded: receiptOpen }}
          style={[styles.receiptToggle, { borderColor: D_HAIRLINE, backgroundColor: D_GLASS }]}
        >
          <ShieldCheck size={13} color={D_TEXT_2} strokeWidth={2.2} />
          <AppText variant="bodySemibold" color={D_TEXT_2} style={{ fontSize: 10.5, letterSpacing: 1 }}>
            SESSION RECEIPT
          </AppText>
          <ChevronRight
            size={13}
            color={D_TEXT_3}
            strokeWidth={2.2}
            style={{ transform: [{ rotate: receiptOpen ? '90deg' : '0deg' }] }}
          />
        </PressableScale>

        {receiptOpen && (
          <Entrance from={8}>
            <View style={styles.detailCard}>
              <ReceiptRow
                ok={!paused}
                highlight={paused}
                text={paused ? 'Paused — they can’t see your screen right now' : 'They see this screen, live'}
              />
              <ReceiptRow ok={false} bordered text="They can’t tap or control your device" />
              <ReceiptRow ok={false} bordered text="Nothing is kept after you end the session" />
            </View>
          </Entrance>
        )}
      </View>

      {/* 3 · Controls */}
      <View style={styles.liveControls}>
        <PressableScale
          onPress={() => setPaused((p) => !p)}
          scaleTo={0.93}
          accessibilityRole="button"
          accessibilityLabel={paused ? 'Resume sharing' : 'Pause sharing'}
          style={[styles.pauseBtn, { backgroundColor: D_GLASS, borderColor: D_HAIRLINE }]}
        >
          {paused ? (
            <Play size={20} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <Pause size={20} color="#FFFFFF" strokeWidth={2} />
          )}
        </PressableScale>
        <PressableScale
          onPress={onEnd}
          scaleTo={0.97}
          accessibilityRole="button"
          accessibilityLabel="End session"
          style={[styles.endBtn, { backgroundColor: D_GLASS, borderColor: D_HAIRLINE }]}
        >
          <Square size={16} color={D_DANGER} strokeWidth={2.2} />
          <AppText variant="bodySemibold" color={D_DANGER} style={{ fontSize: 15.5 }}>
            End session
          </AppText>
        </PressableScale>
      </View>
    </View>
  );
}

function ReceiptRow({ ok, bordered, highlight, text }: { ok: boolean; bordered?: boolean; highlight?: boolean; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.detailRow, bordered && { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }]}>
      <View
        style={[
          styles.detailRowIcon,
          {
            backgroundColor: highlight
              ? 'rgba(201,127,16,0.22)'
              : ok
                ? 'rgba(29,158,95,0.22)'
                : 'rgba(255,255,255,0.08)',
          },
        ]}
      >
        {ok ? (
          <Check size={12} color={colors.successStrong} strokeWidth={2.6} />
        ) : highlight ? (
          <Pause size={11} color={colors.amber} strokeWidth={2.4} />
        ) : (
          <X size={12} color="#8A929C" strokeWidth={2.6} />
        )}
      </View>
      <AppText variant="bodyMedium" color={ok || highlight ? D_TEXT : D_TEXT_2} style={{ fontSize: 12.5, flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}

/* ================================================================== */

const styles = StyleSheet.create({
  root: { flex: 1 },

  // entry
  entryRoot: { flex: 1, paddingHorizontal: 24, paddingBottom: 8 },
  heroStage: { width: 232, height: 232, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  phoneBody: {
    width: 72,
    height: 126,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 6,
    alignItems: 'center',
  },
  phoneNotch: { width: 22, height: 4, borderRadius: 99, marginBottom: 5 },
  phoneScreen: { flex: 1, alignSelf: 'stretch', borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  freshness: { fontSize: 12, textAlign: 'center', marginTop: 12 },
  chipRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 14 },
  microLabel: { fontSize: 10.5, letterSpacing: 1.1, marginTop: 24, marginBottom: 10 },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 11 },
  targetIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  historyLink: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 14, borderTopWidth: 1 },

  // history sheet
  sheetBody: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 28 },
  historyCard: { borderRadius: 16, overflow: 'hidden' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
  historyIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  noteBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, padding: 14, marginTop: 14 },

  // shared dark session
  darkRoot: { flex: 1, paddingHorizontal: 26, paddingTop: 10, paddingBottom: 10 },
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
    borderColor: DARK_BG,
  },
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginTop: 16,
    alignSelf: 'stretch',
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  detailRowIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  // incoming takeover
  takeoverH1: { fontSize: 23, lineHeight: 30, textAlign: 'center', marginTop: 10, letterSpacing: -0.2, maxWidth: 300, alignSelf: 'center' },
  consequence: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 16, maxWidth: 280, alignSelf: 'center' },
  callControls: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-start', marginBottom: 22 },
  roundBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },

  // connecting
  radarStage: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  phoneGlyphDisc: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#141A21',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    alignSelf: 'center',
    marginTop: 34,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },

  // live
  liveTop: { flexDirection: 'row', alignItems: 'center', paddingTop: 4 },
  liveH1: { fontSize: 21, lineHeight: 28, textAlign: 'center', marginTop: 20, letterSpacing: -0.2, maxWidth: 300, alignSelf: 'center' },
  receiptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 22,
  },
  liveControls: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 6 },
  pauseBtn: { width: 56, height: 56, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  endBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 56,
    borderRadius: 17,
    borderWidth: 1,
  },
});
