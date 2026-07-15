import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Check, Lock, Shield, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { MONO } from '../../theme/typography';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { Entrance, GlowOrb, PressableScale, StateSwap } from '../../components/Motion';
import { haptics } from '../../utils/haptics';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { useAppStore, ORG_NAME, DEFAULT_USER_NAME } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Pending'>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/* -- geometry constants ------------------------------------------------ */
const PHONE_W = 78;
const PHONE_H = 128;
const CHECK_SIZE = 96;
const RING_R = 42;
const RING_C = 2 * Math.PI * RING_R; // ≈ 264
const CHECK_LEN = 56;
const ROW_H = 58;
const NODE = 24;
const TL_PAD_TOP = 14;
const TL_LABEL_H = 22;
const LINE_X = 16 + NODE / 2 - 1; // card padding + node center - half line width
const NODE1_CY = TL_PAD_TOP + TL_LABEL_H + ROW_H / 2;
const NODE3_CY = TL_PAD_TOP + TL_LABEL_H + ROW_H * 2 + ROW_H / 2;

/** color + alpha → rgba string (theme tokens are hex). */
function alpha(c: string, a: number): string {
  if (c.startsWith('#') && c.length === 7) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return c;
}

function fmtStamp(d: Date): string {
  const p = (n: number) => ('0' + n).slice(-2);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function ApprovalPendingScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const approved = useAppStore((s) => s.approved);
  const form = useAppStore((s) => s.form);

  const startedApproved = useRef(approved).current;

  // ---- reveal choreography state ----
  const [enrolledCopy, setEnrolledCopy] = useState(startedApproved); // headline swap
  const [enrolledUI, setEnrolledUI] = useState(startedApproved); // bottom card + footer swap
  const [particlesOn, setParticlesOn] = useState(false);
  const [revealing, setRevealing] = useState(false);

  // ---- animated values (initialized to final state if we mount enrolled) ----
  const end = startedApproved ? 1 : 0;
  const worldV = useRef(new Animated.Value(end)).current; // the "weather" clock: glow, hairline, pill, node 3
  const bloomV = useRef(new Animated.Value(end)).current; // radial bloom from timeline node 3
  const scanFadeV = useRef(new Animated.Value(startedApproved ? 0 : 1)).current; // phone layer out
  const ringDrawV = useRef(new Animated.Value(end)).current; // success ring snaps shut
  const checkDrawV = useRef(new Animated.Value(end)).current; // check stroke draw
  const checkScaleV = useRef(new Animated.Value(startedApproved ? 1 : 0.6)).current; // spring w/ overshoot

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timersRef.current.push(setTimeout(fn, ms));

  const stamp = useMemo(() => fmtStamp(new Date()), [approved]);
  const empId = form.empId || 'ACM-1042';
  const deviceName = form.name.trim() || DEFAULT_USER_NAME;
  const ownership = form.own === 'company' ? 'Company-owned' : 'Personal device';

  const finishReveal = (skipped: boolean) => {
    [worldV, bloomV, scanFadeV, ringDrawV, checkDrawV, checkScaleV].forEach((v) => v.stopAnimation());
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    worldV.setValue(1);
    bloomV.setValue(1);
    scanFadeV.setValue(0);
    ringDrawV.setValue(1);
    checkDrawV.setValue(1);
    checkScaleV.setValue(1);
    if (skipped) setParticlesOn(false);
    setEnrolledCopy(true);
    setEnrolledUI(true);
    setRevealing(false);
  };

  const runReveal = () => {
    haptics.success();
    if (reduced) {
      finishReveal(true);
      return;
    }
    setRevealing(true);
    // 1 — radial bloom from timeline node 3 (~420ms)
    Animated.timing(bloomV, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    // weather change — glow wash, hairline tint, status pill, node 3 on ONE clock
    Animated.timing(worldV, { toValue: 1, duration: 600, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }).start();
    // 2 — scan card cross-morphs: phone out, ring snaps shut, check draws with overshoot
    Animated.timing(scanFadeV, { toValue: 0, duration: 220, delay: 60, easing: Easing.in(Easing.ease), useNativeDriver: true }).start();
    Animated.timing(ringDrawV, { toValue: 1, duration: 340, delay: 140, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    Animated.timing(checkDrawV, { toValue: 1, duration: 300, delay: 430, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    Animated.sequence([
      Animated.delay(380),
      Animated.spring(checkScaleV, { toValue: 1, useNativeDriver: true, damping: 9, stiffness: 190, mass: 0.7 }),
    ]).start();
    // 3 — headline crossfade · 4 — one particle beat · 5 — receipt springs in
    later(() => setEnrolledCopy(true), 350);
    later(() => setParticlesOn(true), 520);
    later(() => setEnrolledUI(true), 680);
    later(() => setRevealing(false), 1900);
  };

  const prevApproved = useRef(approved);
  useEffect(() => {
    if (approved && !prevApproved.current) runReveal();
    prevApproved.current = approved;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved]);
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const reviewingOrbOp = worldV.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ambient wash — primary while reviewing, crossfades to success on enroll */}
      <Animated.View pointerEvents="none" style={[styles.orbWrap, { opacity: reviewingOrbOp }]}>
        <GlowOrb size={340} colors={[colors.primary, colors.primaryStrong]} opacity={isDark ? 0.34 : 0.22} style={{ top: 0, left: 0 }} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.orbWrap, { opacity: worldV }]}>
        <GlowOrb size={340} colors={[colors.success, colors.successStrong]} opacity={isDark ? 0.34 : 0.22} style={{ top: 0, left: 0 }} />
      </Animated.View>

      <View style={styles.stage}>
        {/* ---- hero: this device, scanned → verified ---- */}
        <Entrance>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.surface,
                borderColor: isDark ? 'rgba(255,255,255,0.10)' : colors.border,
              },
            ]}
            accessibilityLabel={approved ? 'This device is enrolled' : 'This device is being reviewed by IT'}
          >
            {/* hairline tints to success with the weather change */}
            <Animated.View
              pointerEvents="none"
              style={[styles.heroTint, { borderColor: alpha(colors.success, 0.45), opacity: worldV }]}
            />
            <View style={styles.heroRow}>
              <View style={styles.phoneSlot}>
                {/* scanning phone silhouette */}
                <Animated.View
                  style={{
                    opacity: scanFadeV,
                    transform: [{ scale: scanFadeV.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }],
                  }}
                >
                  <PhoneScan />
                </Animated.View>
                {/* success ring + spring-drawn check */}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.checkLayer,
                    {
                      opacity: ringDrawV.interpolate({ inputRange: [0, 0.2], outputRange: [0, 1], extrapolate: 'clamp' }),
                      transform: [{ scale: checkScaleV }],
                    },
                  ]}
                >
                  <View style={{ transform: [{ rotate: '-90deg' }], position: 'absolute' }}>
                    <Svg width={CHECK_SIZE} height={CHECK_SIZE} viewBox={`0 0 ${CHECK_SIZE} ${CHECK_SIZE}`}>
                      <AnimatedCircle
                        cx={CHECK_SIZE / 2}
                        cy={CHECK_SIZE / 2}
                        r={RING_R}
                        fill="none"
                        stroke={colors.success}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeDasharray={`${RING_C}`}
                        strokeDashoffset={ringDrawV.interpolate({ inputRange: [0, 1], outputRange: [RING_C, 0] })}
                      />
                    </Svg>
                  </View>
                  <Svg width={CHECK_SIZE} height={CHECK_SIZE} viewBox={`0 0 ${CHECK_SIZE} ${CHECK_SIZE}`}>
                    <AnimatedPath
                      d="M30 51 L43 64 L67 36"
                      fill="none"
                      stroke={colors.success}
                      strokeWidth={5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={`${CHECK_LEN}`}
                      strokeDashoffset={checkDrawV.interpolate({ inputRange: [0, 1], outputRange: [CHECK_LEN, 0] })}
                    />
                  </Svg>
                  {particlesOn ? (
                    <ParticleBurst
                      palette={[colors.primary, isDark ? '#FFFFFF' : colors.primaryStrong, colors.success]}
                    />
                  ) : null}
                </Animated.View>
              </View>

              <View style={{ flex: 1, gap: 7 }}>
                <AppText variant="bodySemibold" color={colors.muted} style={styles.micro}>
                  This device
                </AppText>
                <AppText variant="displaySemibold" style={{ fontSize: 16, letterSpacing: -0.2 }} numberOfLines={1}>
                  {deviceName}
                </AppText>
                <View style={[styles.monoChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : colors.surfaceSunken, borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.border }]}>
                  <AppText style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 0.4 }} color={colors.text3} numberOfLines={1}>
                    ID {empId} · OS 15 · {form.own === 'company' ? 'COMPANY' : 'BYOD'}
                  </AppText>
                </View>
                {/* status pill — the third tinting surface, same clock */}
                <View style={{ height: 28, justifyContent: 'center' }}>
                  <Animated.View style={[styles.pill, { backgroundColor: alpha(colors.primary, 0.12), borderColor: alpha(colors.primary, 0.4), opacity: reviewingOrbOp, position: 'absolute' }]}>
                    <BreathingDot color={colors.primary} size={6} active={!approved && !reduced} />
                    <AppText variant="bodySemibold" color={colors.primary} style={{ fontSize: 11 }}>
                      In review
                    </AppText>
                  </Animated.View>
                  <Animated.View style={[styles.pill, { backgroundColor: alpha(colors.success, 0.14), borderColor: alpha(colors.success, 0.45), opacity: worldV, position: 'absolute' }]}>
                    <Check size={11} color={colors.success} strokeWidth={3} />
                    <AppText variant="bodySemibold" color={colors.success} style={{ fontSize: 11 }}>
                      Enrolled
                    </AppText>
                  </Animated.View>
                </View>
              </View>
            </View>
          </View>
        </Entrance>

        {/* ---- headline ---- */}
        <StateSwap stateKey={enrolledCopy ? 'done' : 'review'} style={{ alignItems: 'center', marginTop: 26 }}>
          <View accessibilityLiveRegion="polite" style={{ alignItems: 'center' }}>
            <AppText variant="display" accessibilityRole="header" style={styles.h1}>
              {enrolledCopy ? 'You’re enrolled' : 'Reviewing your request'}
            </AppText>
            <AppText variant="body" color={colors.muted} style={styles.p}>
              {enrolledCopy
                ? `Your ${ORG_NAME} work profile is ready. Personal apps and data stay yours.`
                : 'IT approves the device — never your personal data.'}
            </AppText>
          </View>
        </StateSwap>
      </View>

      {/* ---- bottom: timeline while reviewing → certificate receipt when enrolled ---- */}
      <StateSwap stateKey={enrolledUI ? 'receipt' : 'timeline'}>
        {enrolledUI ? (
          <Certificate
            deviceName={deviceName}
            ownership={ownership}
            empId={empId}
            stamp={stamp}
            success={colors.success}
          />
        ) : (
          <Entrance delay={120}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText variant="bodySemibold" color={colors.muted} style={[styles.micro, { marginBottom: 4 }]}>
                Review status
              </AppText>

              {/* connecting line — hairline base + primary segment that draws on mount */}
              <View pointerEvents="none" style={[styles.tlLine, { top: NODE1_CY, height: NODE3_CY - NODE1_CY, backgroundColor: colors.hairline }]} />
              <DrawnLine top={NODE1_CY} height={ROW_H} color={colors.primary} />
              {/* node2 → node3 segment turns success with the weather change */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.tlLine,
                  {
                    top: NODE1_CY + ROW_H,
                    height: ROW_H,
                    backgroundColor: colors.success,
                    opacity: worldV,
                    transform: [
                      { translateY: worldV.interpolate({ inputRange: [0, 1], outputRange: [-ROW_H / 2, 0] }) },
                      { scaleY: worldV.interpolate({ inputRange: [0, 1], outputRange: [0.0001, 1] }) },
                    ],
                  },
                ]}
              />

              <TimelineRow
                kind="done"
                label="Request sent"
                sub={`Sent to ${ORG_NAME} IT`}
              />
              <TimelineRow kind="active" label="In review" sub="usually a few minutes" />
              <TimelineRow kind="ghost" label="Device enrolled" sub="Work profile follows instantly" worldV={worldV} checkScaleV={checkScaleV} />

              {/* success bloom — expands from node 3 */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.bloom,
                  {
                    left: LINE_X + 1 - 60,
                    top: NODE3_CY - 60,
                    backgroundColor: colors.success,
                    opacity: bloomV.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 0.4, 0] }),
                    transform: [{ scale: bloomV.interpolate({ inputRange: [0, 1], outputRange: [0.2, 3.6] }) }],
                  },
                ]}
              />
            </View>
            <Entrance delay={240}>
              <AppText variant="body" color={colors.muted} style={styles.exitRamp}>
                We’ll notify you the moment IT responds.
              </AppText>
            </Entrance>
          </Entrance>
        )}
      </StateSwap>

      {/* ---- footer ---- */}
      <View style={styles.footer}>
        <StateSwap stateKey={enrolledUI ? 'cta' : 'help'}>
          {enrolledUI ? (
            <Button
              label="Enter workspace"
              onPress={() => {
                haptics.tap();
                navigation.replace('Permissions');
              }}
            />
          ) : (
            <PressableScale
              onPress={() => haptics.tap()}
              haptic={false}
              accessibilityRole="button"
              accessibilityLabel="Contact IT"
              style={styles.helpRow}
            >
              <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5 }}>
                Taking longer than expected?
              </AppText>
              <AppText variant="bodySemibold" color={colors.primary} style={{ fontSize: 12.5 }}>
                Contact IT
              </AppText>
            </PressableScale>
          )}
        </StateSwap>
      </View>

      {/* tap anywhere to skip the reveal */}
      {revealing ? (
        <Pressable
          style={styles.skipLayer}
          onPress={() => finishReveal(true)}
          accessibilityRole="button"
          accessibilityLabel="Skip animation"
        />
      ) : null}
    </SafeAreaView>
  );
}

/* ---------------------------------------------------------------------- *
 *  Reviewing hero — phone silhouette with a looping vertical scan beam.
 * ---------------------------------------------------------------------- */
function PhoneScan() {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const approved = useAppStore((s) => s.approved);
  const beam = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced || approved) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(beam, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(beam, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, approved]);
  const screenH = PHONE_H - 14;
  const translateY = beam.interpolate({ inputRange: [0, 1], outputRange: [-48, screenH + 6] });
  return (
    <View
      style={[
        styles.phone,
        {
          borderColor: isDark ? 'rgba(255,255,255,0.16)' : colors.borderStrong,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceSunken,
        },
      ]}
    >
      <View style={[styles.phoneScreen, { backgroundColor: isDark ? '#0B0F14' : '#E7E9ED' }]}>
        <View style={[styles.notch, { backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)' }]} />
        <Animated.View style={{ position: 'absolute', left: 0, right: 0, height: 44, transform: [{ translateY }] }}>
          <LinearGradient
            colors={['transparent', alpha(colors.primary, 0.5), 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ flex: 1 }}
          />
          <View style={{ position: 'absolute', top: 21, left: 0, right: 0, height: 2, backgroundColor: colors.primary, opacity: 0.85 }} />
        </Animated.View>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------------- *
 *  Timeline pieces
 * ---------------------------------------------------------------------- */
function DrawnLine({ top, height, color }: { top: number; height: number; color: string }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    const a = Animated.timing(v, { toValue: 1, duration: 550, delay: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    a.start();
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.tlLine,
        {
          top,
          height,
          backgroundColor: color,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-height / 2, 0] }) },
            { scaleY: v.interpolate({ inputRange: [0, 1], outputRange: [0.0001, 1] }) },
          ],
        },
      ]}
    />
  );
}

function TimelineRow({
  kind,
  label,
  sub,
  worldV,
  checkScaleV,
}: {
  kind: 'done' | 'active' | 'ghost';
  label: string;
  sub: string;
  worldV?: Animated.Value;
  checkScaleV?: Animated.Value;
}) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const pop = useRef(new Animated.Value(kind === 'done' && !reduced ? 0.3 : 1)).current;
  useEffect(() => {
    if (kind !== 'done' || reduced) return;
    const a = Animated.spring(pop, { toValue: 1, delay: 140, useNativeDriver: true, damping: 10, stiffness: 220, mass: 0.7 });
    a.start();
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ghostTextColor = kind === 'ghost' ? colors.muted2 : colors.text;
  return (
    <View style={styles.tlRow}>
      <View style={{ width: NODE, alignItems: 'center' }}>
        {kind === 'done' ? (
          <Animated.View style={[styles.node, { backgroundColor: colors.primary, transform: [{ scale: pop }] }]}>
            <Check size={13} color={colors.white} strokeWidth={3.2} />
          </Animated.View>
        ) : kind === 'active' ? (
          <View style={[styles.node, { backgroundColor: alpha(colors.primary, 0.16), borderWidth: 1, borderColor: alpha(colors.primary, 0.5) }]}>
            <BreathingDot color={colors.primary} size={9} active={!reduced} />
          </View>
        ) : (
          <View style={{ width: NODE, height: NODE }}>
            <View style={[styles.node, { position: 'absolute', backgroundColor: colors.surfaceSunken, borderWidth: 1, borderColor: colors.borderStrong }]} />
            {worldV && checkScaleV ? (
              <Animated.View style={[styles.node, { position: 'absolute', backgroundColor: colors.success, opacity: worldV, transform: [{ scale: checkScaleV }] }]}>
                <Check size={13} color={colors.white} strokeWidth={3.2} />
              </Animated.View>
            ) : null}
          </View>
        )}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodySemibold" color={ghostTextColor} style={{ fontSize: 13.5 }}>
          {label}
        </AppText>
        <AppText variant="body" color={kind === 'ghost' ? colors.faint : colors.muted} style={{ fontSize: 11.5 }}>
          {sub}
        </AppText>
      </View>
    </View>
  );
}

/** Scale + opacity breathing dot — 1.6s loop, stills under reduced motion. */
function BreathingDot({ color, size, active }: { color: string; size: number; active: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) {
      v.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }],
      }}
    />
  );
}

/* ---------------------------------------------------------------------- *
 *  Enrollment certificate — receipt physicality: white card even in dark.
 * ---------------------------------------------------------------------- */
function Certificate({
  deviceName,
  ownership,
  empId,
  stamp,
  success,
}: {
  deviceName: string;
  ownership: string;
  empId: string;
  stamp: string;
  success: string;
}) {
  return (
    <Entrance from={22} scaleFrom={0.95}>
      <View style={styles.cert} accessibilityLabel={`Enrollment certificate for ${deviceName}`}>
        <AppText variant="bodySemibold" color="#9AA0A6" style={styles.micro}>
          Enrollment receipt
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <AppText variant="displaySemibold" color="#17181A" style={{ fontSize: 16.5, letterSpacing: -0.2, flexShrink: 1 }} numberOfLines={1}>
            {deviceName}
          </AppText>
          <View style={[styles.certTag, { borderColor: 'rgba(0,0,0,0.12)' }]}>
            <AppText variant="bodySemibold" color="#5C6166" style={{ fontSize: 9.5, letterSpacing: 0.5 }}>
              {ownership}
            </AppText>
          </View>
        </View>
        <AppText variant="bodyMedium" color="#6B7178" style={{ fontSize: 12, marginTop: 2 }}>
          {ORG_NAME}
        </AppText>
        <AppText color="#8A9098" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 0.5, marginTop: 8 }}>
          ENROLLED {stamp} · ID {empId}
        </AppText>

        <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.07)' }}>
          <CertRow icon={Lock} label="Work profile created" success={success} />
          <CertRow icon={Shield} label="Secure tunnel ready to connect" success={success} />
          <CertRow icon={EyeOff} label="IT sees only work — never personal" success={success} last />
        </View>

        {/* rotated micro-serial on the card edge */}
        <View pointerEvents="none" style={styles.certSerial}>
          <AppText color="#B9BEC4" style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: 2.4 }} numberOfLines={1}>
            UEM-ENROLLED
          </AppText>
        </View>
      </View>
    </Entrance>
  );
}

function CertRow({ icon: Icon, label, success, last }: { icon: any; label: string; success: string; last?: boolean }) {
  return (
    <View style={[styles.certRow, !last && { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.07)' }]}>
      <View style={styles.certTile}>
        <Icon size={15} color="#5C6166" strokeWidth={2} />
      </View>
      <AppText variant="bodyMedium" color="#3A3F45" style={{ fontSize: 13, flex: 1 }}>
        {label}
      </AppText>
      <Check size={16} color={success} strokeWidth={2.6} />
    </View>
  );
}

/* ---------------------------------------------------------------------- *
 *  One restrained particle beat — 22 flecks launch from the check and fall
 *  with fade. Transform + opacity only, ≤1.2s total, never under reduced
 *  motion (the mount site already gates it).
 * ---------------------------------------------------------------------- */
function ParticleBurst({ palette }: { palette: string[] }) {
  const parts = useRef(
    Array.from({ length: 22 }, (_, i) => ({
      v: new Animated.Value(0),
      dx: (Math.random() * 2 - 1) * 92,
      rise: -(22 + Math.random() * 72),
      fall: 88 + Math.random() * 78,
      size: 3 + Math.random() * 3.5,
      d: 700 + Math.random() * 350,
      delay: Math.random() * 120,
      color: palette[i % palette.length],
    })),
  ).current;
  useEffect(() => {
    const anims = parts.map((p) =>
      Animated.timing(p.v, { toValue: 1, duration: p.d, delay: p.delay, easing: Easing.linear, useNativeDriver: true }),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
      {parts.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: p.color,
            opacity: p.v.interpolate({ inputRange: [0, 0.08, 0.7, 1], outputRange: [0, 1, 0.9, 0] }),
            transform: [
              { translateX: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) },
              { translateY: p.v.interpolate({ inputRange: [0, 0.42, 1], outputRange: [0, p.rise, p.fall] }) },
              { scale: p.v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  orbWrap: { position: 'absolute', top: -110, alignSelf: 'center', width: 340, height: 340 },
  stage: { flex: 1, justifyContent: 'center' },

  hero: { borderWidth: 1, borderRadius: 24, padding: 16 },
  heroTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 1, borderRadius: 24 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  phoneSlot: { width: 100, height: PHONE_H, alignItems: 'center', justifyContent: 'center' },
  phone: { width: PHONE_W, height: PHONE_H, borderRadius: 18, borderWidth: 1.5, padding: 6 },
  phoneScreen: { flex: 1, borderRadius: 12, overflow: 'hidden', alignItems: 'center' },
  notch: { width: 16, height: 3, borderRadius: 2, marginTop: 6 },
  checkLayer: { position: 'absolute', width: CHECK_SIZE, height: CHECK_SIZE, alignItems: 'center', justifyContent: 'center' },
  monoChip: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3.5 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4.5, alignSelf: 'flex-start' },

  micro: { fontSize: 10.5, letterSpacing: 1.1, textTransform: 'uppercase' },
  h1: { fontSize: 25, letterSpacing: -0.4, textAlign: 'center' },
  p: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', maxWidth: 300, marginTop: 8 },

  card: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingTop: TL_PAD_TOP, paddingBottom: 10 },
  tlLine: { position: 'absolute', left: LINE_X, width: 2, borderRadius: 1 },
  tlRow: { height: ROW_H, flexDirection: 'row', alignItems: 'center', gap: 12 },
  node: { width: NODE, height: NODE, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center' },
  bloom: { position: 'absolute', width: 120, height: 120, borderRadius: 60, zIndex: 5 },
  exitRamp: { fontSize: 12, textAlign: 'center', marginTop: 12 },

  cert: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
    borderRadius: 20,
    padding: 18,
    paddingRight: 30,
    overflow: 'hidden',
  },
  certTag: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10.5 },
  certTile: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  certSerial: {
    position: 'absolute',
    right: -34,
    top: '50%',
    width: 110,
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
  },

  footer: { paddingTop: 18, paddingBottom: 12, minHeight: 76, justifyContent: 'center' },
  helpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
  skipLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
});
