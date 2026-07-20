import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { Briefcase, Check, Lock, Shield, EyeOff, User } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { MONO, type as typeScale } from '../../theme/typography';
import { AppText } from '../../components/Text';
import { AuditLine } from '../../components/AuditLine';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { hexA } from '../../components/Glass';
import { Entrance, MorphSwap, PressableScale, StateSwap } from '../../components/Motion';
import { haptics } from '../../utils/haptics';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { useAppStore, ORG_NAME, DEFAULT_USER_NAME, findAudit } from '../../state/store';
import { EMP_ID_PREFIX } from '../../data/mockData';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { space, layout } from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Pending'>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/* -- geometry constants ------------------------------------------------ */
const PHONE_W = 78;
const PHONE_H = 128;
const CHECK_SIZE = 96;
const RING_R = 42;
const PERF_R = 9; // radius of the ticket's edge perforation notches
const RING_C = 2 * Math.PI * RING_R; // ≈ 264
const CHECK_LEN = 56;
const ROW_H = 58;
const NODE = 24;
// The timeline's nodes flow, but the line joining them is absolutely
// positioned — so these must describe the card's REAL metrics or the line
// drifts off the nodes. They are now derived from the tokens the card actually
// renders with (Card owns its padding; the label carries the ramp's line
// height) instead of the hand-measured 14/22 that only approximated them.
// ROW_H and the formulas below are untouched.
const TL_PAD_TOP = layout.cardPad;
const TL_LABEL_H = typeScale.micro.lineHeight + layout.labelGap;
const LINE_X = layout.cardPad + NODE / 2 - 1; // card padding + node center - half line width
const NODE1_CY = TL_PAD_TOP + TL_LABEL_H + ROW_H / 2;
const NODE3_CY = TL_PAD_TOP + TL_LABEL_H + ROW_H * 2 + ROW_H / 2;


function fmtStamp(d: Date): string {
  const p = (n: number) => ('0' + n).slice(-2);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function ApprovalPendingScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const approved = useAppStore((s) => s.approved);
  const form = useAppStore((s) => s.form);
  const activity = useAppStore((s) => s.activity);
  const openChat = useAppStore((s) => s.openChat);

  // Both halves of this screen are persistent success states that never showed a
  // receipt: the request was logged and said nothing, and "You're enrolled" — a
  // state change made BY IT, on your device — carried no actor, no time and no
  // way to reach the log. The line reads the real entry, so the enrolled state
  // correctly credits IT and not you.
  const requestAudit = findAudit(activity, 'enroll', ['Enrollment requested']);
  const enrolledAudit = findAudit(activity, 'enroll', ['Device enrolled']);

  const startedApproved = useRef(approved).current;

  // ---- reveal choreography state ----
  const [enrolledCopy, setEnrolledCopy] = useState(startedApproved); // headline swap
  const [enrolledUI, setEnrolledUI] = useState(startedApproved); // bottom card + footer swap
  const [revealing, setRevealing] = useState(false);

  // ---- animated values (initialized to final state if we mount enrolled) ----
  const end = startedApproved ? 1 : 0;
  const worldV = useRef(new Animated.Value(end)).current; // the "weather" clock: hero hairline, timeline, node 3
  const bloomV = useRef(new Animated.Value(end)).current; // radial bloom from timeline node 3
  const scanFadeV = useRef(new Animated.Value(startedApproved ? 0 : 1)).current; // phone layer out
  const ringDrawV = useRef(new Animated.Value(end)).current; // success ring snaps shut
  const checkDrawV = useRef(new Animated.Value(end)).current; // check stroke draw
  const checkScaleV = useRef(new Animated.Value(startedApproved ? 1 : 0.6)).current; // spring w/ overshoot

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timersRef.current.push(setTimeout(fn, ms));

  const stamp = useMemo(() => fmtStamp(new Date()), [approved]);
  // Same fallback the store writes on submit — keep them one value, not two.
  const empId = form.empId || `${EMP_ID_PREFIX}-1042`;
  const deviceName = form.name.trim() || DEFAULT_USER_NAME;
  const ownership = form.own === 'company' ? 'Company-owned' : 'Personal device';

  const finishReveal = () => {
    [worldV, bloomV, scanFadeV, ringDrawV, checkDrawV, checkScaleV].forEach((v) => v.stopAnimation());
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    worldV.setValue(1);
    bloomV.setValue(1);
    scanFadeV.setValue(0);
    ringDrawV.setValue(1);
    checkDrawV.setValue(1);
    checkScaleV.setValue(1);
    setEnrolledCopy(true);
    setEnrolledUI(true);
    setRevealing(false);
  };

  const runReveal = () => {
    haptics.success();
    if (reduced) {
      finishReveal();
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
    // 3 — headline crossfade · 4 — receipt springs in
    later(() => setEnrolledCopy(true), 350);
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

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

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
              style={[styles.heroTint, { borderColor: hexA(colors.success, 0.45), opacity: worldV }]}
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
                  {/* No confetti here on purpose. This is the anxious moment in
                      the product — the exclamation mark was already stripped
                      from the copy, and confetti was the exclamation mark. The
                      ring closing and the check springing shut are the reward
                      beat; they report a state change, which confetti cannot. */}
                </Animated.View>
              </View>

              {/* Identity while reviewing; once enrolled the receipt owns every
                  detail, so this turns forward-looking: the work/personal
                  boundary and what happens next. Fixed height (the phone slot
                  already sets the card's) so the swap is a pure cross-fade. */}
              <View style={{ flex: 1, height: PHONE_H, justifyContent: 'center' }}>
                <StateSwap stateKey={enrolledCopy ? 'profile' : 'ident'}>
                  {enrolledCopy ? (
                    <View style={styles.heroCol}>
                      <AppText variant="bodySemibold" size="micro" color={colors.muted} style={styles.micro}>
                        What changes
                      </AppText>
                      <View style={{ gap: space[1] }}>
                        <SplitRow icon={Briefcase} label="Work" value="Managed by IT" valueColor={colors.text3} />
                        <SplitRow icon={User} label="Personal" value="Invisible to IT" valueColor={colors.success} />
                      </View>
                      <View style={{ borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: layout.labelGap }}>
                        <AppText variant="bodyMedium" size="micro" color={colors.muted}>
                          Next · work apps arrive from IT automatically
                        </AppText>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.heroCol}>
                      <AppText variant="bodySemibold" size="micro" color={colors.muted} style={styles.micro}>
                        This device
                      </AppText>
                      <AppText variant="displaySemibold" size="callout" style={{ letterSpacing: -0.2 }} numberOfLines={1}>
                        {deviceName}
                      </AppText>
                      <View style={[styles.monoChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : colors.surfaceSunken, borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.border }]}>
                        <AppText size="micro" style={{ fontFamily: MONO, letterSpacing: 0.4 }} color={colors.text3} numberOfLines={1}>
                          ID {empId} · OS 15 · {form.own === 'company' ? 'COMPANY' : 'BYOD'}
                        </AppText>
                      </View>
                      <View style={{ height: 28, justifyContent: 'center' }}>
                        <View style={[styles.pill, { backgroundColor: hexA(colors.primary, 0.12), borderColor: hexA(colors.primary, 0.4) }]}>
                          <BreathingDot color={colors.primary} size={6} active={!approved && !reduced} />
                          <AppText variant="bodySemibold" size="micro" color={colors.primary}>
                            In review
                          </AppText>
                        </View>
                      </View>
                    </View>
                  )}
                </StateSwap>
              </View>
            </View>
          </View>
        </Entrance>

        {/* ---- headline ---- */}
        <StateSwap stateKey={enrolledCopy ? 'done' : 'review'} style={{ alignItems: 'center', marginTop: layout.sectionGap }}>
          <View accessibilityLiveRegion="polite" style={{ alignItems: 'center' }}>
            <AppText variant="display" size="display" accessibilityRole="header" style={styles.h1}>
              {enrolledCopy ? 'You’re enrolled' : 'Reviewing your request'}
            </AppText>
            <AppText variant="body" size="footnote" color={colors.muted} style={styles.p}>
              {enrolledCopy
                ? `Your ${ORG_NAME} work profile is ready. Personal apps and data stay yours.`
                : 'IT approves the device — never your personal data.'}
            </AppText>
            {enrolledCopy && enrolledAudit ? (
              <AuditLine
                time={enrolledAudit.time}
                actor={enrolledAudit.actor}
                onPress={() => navigation.navigate('Activity')}
              />
            ) : null}
          </View>
        </StateSwap>
      </View>

      {/* ---- bottom: timeline while reviewing → ticket when enrolled. The two
           states differ by ~120px, so the container morphs its height rather
           than snapping — bleed keeps the ticket's edge notches out of the clip. ---- */}
      <MorphSwap stateKey={enrolledUI ? 'receipt' : 'timeline'} bleed={PERF_R + 3}>
        {enrolledUI ? (
          <Certificate
            deviceName={deviceName}
            ownership={ownership}
            empId={empId}
            stamp={stamp}
            success={colors.success}
            pageBg={colors.bg}
          />
        ) : (
          <Entrance delay={120}>
            <Card style={styles.card}>
              <AppText variant="bodySemibold" size="micro" color={colors.muted} style={[styles.micro, styles.tlLabel]}>
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
              <TimelineRow kind="ghost" label="Device enrolled" sub="Work profile created on this device" worldV={worldV} checkScaleV={checkScaleV} />

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
            </Card>
            <Entrance delay={240}>
              {requestAudit ? (
                <View style={styles.auditWrap}>
                  <AuditLine
                    time={requestAudit.time}
                    actor={requestAudit.actor}
                    onPress={() => navigation.navigate('Activity')}
                  />
                </View>
              ) : null}
              <AppText variant="body" size="caption" color={colors.muted} style={styles.exitRamp}>
                You can close the app — we’ll notify you when IT responds.
              </AppText>
            </Entrance>
          </Entrance>
        )}
      </MorphSwap>

      {/* ---- footer ---- */}
      <View style={styles.footer}>
        <StateSwap stateKey={enrolledUI ? 'cta' : 'help'}>
          {enrolledUI ? (
            <Button
              label="Set up permissions"
              onPress={() => {
                haptics.tap();
                navigation.replace('Permissions');
              }}
            />
          ) : (
            // This was `onPress={() => haptics.tap()}` — a dead affordance, and
            // the only one on the screen PRODUCT.md names as the anxious moment.
            // It now opens the IT thread, the same way Profile's helpdesk row does.
            <PressableScale
              onPress={() => {
                haptics.tap();
                openChat('it');
                navigation.navigate('ChatThread', { chatId: 'it' });
              }}
              haptic={false}
              accessibilityRole="button"
              accessibilityLabel="Contact IT helpdesk"
              style={styles.helpRow}
            >
              <AppText variant="body" size="caption" color={colors.muted}>
                Taking longer than expected?
              </AppText>
              <AppText variant="bodySemibold" size="caption" color={colors.primary}>
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
          onPress={() => finishReveal()}
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

  // A real handset reads through material, not outline: a machined frame with a
  // rim light down one edge, glass that is darker at the bottom, and one static
  // specular streak. Turned a few degrees so it sits IN the card rather than on
  // it — the tilt is fixed, so it feels solid rather than drifting.
  const frame = isDark ? '#2B323C' : '#DDE1E6';
  const frameEdge = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.95)';
  const glassTop = isDark ? '#141A22' : '#EDEFF2';
  const glassBottom = isDark ? '#080B0F' : '#DCDFE4';

  // Pure decoration — the hero card's own accessibilityLabel already says what
  // state this device is in, same precedent as the ticket's Barcode.
  return (
    <View style={styles.phoneWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.phoneShadow, { shadowColor: isDark ? '#000' : 'rgba(20,24,30,0.55)' }]} />
      <View style={styles.phoneTilt}>
        <View style={[styles.phone, { backgroundColor: frame, borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)' }]}>
          {/* rim light — the machined highlight along the top-left chamfer */}
          <LinearGradient
            pointerEvents="none"
            colors={[frameEdge, 'transparent']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.85, y: 0.75 }}
            style={styles.phoneRim}
          />
          <View style={styles.phoneScreen}>
            <LinearGradient colors={[glassTop, glassBottom]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={[styles.island, { backgroundColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)' }]} />
            <Animated.View style={{ position: 'absolute', left: 0, right: 0, height: 44, transform: [{ translateY }] }}>
              <LinearGradient
                colors={['transparent', hexA(colors.primary, 0.5), 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ flex: 1 }}
              />
              <View style={{ position: 'absolute', top: 21, left: 0, right: 0, height: 2, backgroundColor: colors.primary, opacity: 0.85 }} />
            </Animated.View>
            {/* specular streak — static; glass catches light, it doesn't shimmer */}
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.03)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </View>
        <View style={[styles.sideBtn, { backgroundColor: isDark ? '#39424E' : '#C6CBD2' }]} />
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
          <View style={[styles.node, { backgroundColor: hexA(colors.primary, 0.16), borderWidth: 1, borderColor: hexA(colors.primary, 0.5) }]}>
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
      <View style={{ flex: 1, gap: layout.captionGap }}>
        <AppText variant="bodySemibold" size="footnote" color={ghostTextColor}>
          {label}
        </AppText>
        <AppText variant="body" size="caption" color={kind === 'ghost' ? colors.faint : colors.muted}>
          {sub}
        </AppText>
      </View>
    </View>
  );
}

/** One side of the work/personal boundary, shown in the hero once enrolled. */
function SplitRow({ icon: Icon, label, value, valueColor }: { icon: any; label: string; value: string; valueColor: string }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
      <View style={[styles.splitTile, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : colors.surfaceSunken, borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.border }]}>
        <Icon size={11} color={colors.text3} strokeWidth={2} />
      </View>
      <AppText variant="bodySemibold" size="caption">
        {label}
      </AppText>
      <View style={{ flex: 1 }} />
      <AppText variant="bodyMedium" size="micro" color={valueColor} numberOfLines={1}>
        {value}
      </AppText>
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
  pageBg,
}: {
  deviceName: string;
  ownership: string;
  empId: string;
  stamp: string;
  success: string;
  pageBg: string;
}) {
  return (
    <Entrance from={22} scaleFrom={0.95}>
      <View style={styles.ticket} accessibilityLabel={`Enrollment ticket for ${deviceName}`}>
        {/* ---- main body: the enrollment record ---- */}
        <View style={styles.ticketBody}>
          <View style={styles.ticketHead}>
            <AppText variant="bodySemibold" size="micro" color="#9AA0A6" style={styles.micro}>
              Enrollment receipt
            </AppText>
            <View style={styles.admitTag}>
              <AppText size="micro" color="#5C6166" style={{ fontFamily: MONO, letterSpacing: 1.6 }}>
                ADMIT · WORK
              </AppText>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: layout.labelGap }}>
            <AppText variant="displaySemibold" size="callout" color="#17181A" style={{ letterSpacing: -0.2, flexShrink: 1 }} numberOfLines={1}>
              {deviceName}
            </AppText>
            <View style={[styles.certTag, { borderColor: 'rgba(0,0,0,0.12)' }]}>
              <AppText variant="bodySemibold" size="micro" color="#5C6166" style={{ letterSpacing: 0.5 }}>
                {ownership}
              </AppText>
            </View>
          </View>
          <AppText variant="bodyMedium" size="caption" color="#6B7178" style={{ marginTop: layout.captionGap }}>
            {ORG_NAME}
          </AppText>
          <AppText size="micro" color="#8A9098" style={{ fontFamily: MONO, letterSpacing: 0.5, marginTop: layout.labelGap }}>
            ENROLLED {stamp} · ID {empId}
          </AppText>

          <View style={{ marginTop: layout.blockGap, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.07)' }}>
            <CertRow icon={Lock} label="Work profile created" success={success} />
            {/* Was "Secure tunnel ready to connect" — a green check against a
                tunnel that is off, with its client key still uninstalled and
                its permission not yet granted. Every row here draws a check, so
                every row has to be true right now. This one is. */}
            <CertRow icon={Shield} label="Secure tunnel — you turn it on, not IT" success={success} />
            <CertRow icon={EyeOff} label="IT sees only work — never personal" success={success} last />
          </View>
        </View>

        {/* ---- perforation: notches punched into both edges + dashed tear line ---- */}
        <View style={styles.perfRow}>
          <View style={[styles.perfHole, { left: -PERF_R, backgroundColor: pageBg }]} />
          <View style={styles.perfLine}>
            <Svg width="100%" height="2">
              <Line x1="0" y1="1" x2="100%" y2="1" stroke="#C9CDD2" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
            </Svg>
          </View>
          <View style={[styles.perfHole, { right: -PERF_R, backgroundColor: pageBg }]} />
        </View>

        {/* ---- tear-off stub: serial + scannable mark ---- */}
        <View style={styles.ticketStub}>
          <View style={{ flexShrink: 1 }}>
            <AppText variant="bodySemibold" size="micro" color="#9AA0A6" style={styles.micro}>
              Enrolled
            </AppText>
            <AppText size="caption" color="#3A3F45" style={{ fontFamily: MONO, letterSpacing: 0.6, marginTop: layout.captionGap }} numberOfLines={1}>
              {empId}
            </AppText>
          </View>
          <Barcode seed={`${empId}${stamp}`} />
        </View>
      </View>
    </Entrance>
  );
}

/* A deterministic faux barcode — bar widths/gaps derived from the serial so
 * every ticket looks unique but stable across renders. Decorative only.
 *
 * BAR_PITCH is the gap between two 1–3px bars — the internal pitch of a
 * generated pattern, not a gap between two pieces of UI, so the 4px grid has
 * nothing to say about it. The smallest grid step (4) is wider than the bars
 * themselves and would render this as a picket fence four times too wide for
 * the stub. It stays a named illustration constant. */
const BAR_PITCH = 1.6;

function Barcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    const out: { w: number; on: boolean }[] = [];
    for (let i = 0; i < 34; i++) {
      const code = seed.charCodeAt(i % seed.length) * (i + 3) + i;
      out.push({ w: (code % 3) + 1, on: code % 4 !== 0 });
    }
    return out;
  }, [seed]);
  return (
    <View style={styles.barcode} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {bars.map((b, i) => (
        <View key={i} style={{ width: b.w, marginLeft: BAR_PITCH, alignSelf: 'stretch', backgroundColor: b.on ? '#17181A' : 'transparent' }} />
      ))}
    </View>
  );
}

function CertRow({ icon: Icon, label, success, last }: { icon: any; label: string; success: string; last?: boolean }) {
  return (
    <View style={[styles.certRow, !last && { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.07)' }]}>
      <View style={styles.certTile}>
        <Icon size={15} color="#5C6166" strokeWidth={2} />
      </View>
      <AppText variant="bodyMedium" size="footnote" color="#3A3F45" style={{ flex: 1 }}>
        {label}
      </AppText>
      <Check size={16} color={success} strokeWidth={2.6} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: layout.gutter },
  stage: { flex: 1, justifyContent: 'center' },

  hero: { borderWidth: 1, borderRadius: 24, padding: layout.cardPad },
  heroTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 1, borderRadius: 24 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: layout.blockGap },
  // Label -> its block; the split rows inside sit tighter than this, so the
  // grouping reads in the right order.
  heroCol: { gap: layout.labelGap },
  phoneSlot: { width: 100, height: PHONE_H, alignItems: 'center', justifyContent: 'center' },
  phoneWrap: { alignItems: 'center', justifyContent: 'center' },
  // Fixed tilt (no float loop) — depth without drift.
  phoneTilt: { transform: [{ perspective: 700 }, { rotateY: '-11deg' }, { rotateX: '4deg' }] },
  phoneShadow: {
    position: 'absolute', width: PHONE_W - 8, height: PHONE_H - 10, borderRadius: 18, top: 10,
    shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: -4, height: 10 }, elevation: 10,
    backgroundColor: '#000',
  },
  phone: { width: PHONE_W, height: PHONE_H, borderRadius: 19, borderWidth: 1, padding: space[1] },
  phoneRim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 19, opacity: 0.5 },
  phoneScreen: { flex: 1, borderRadius: 15, overflow: 'hidden', alignItems: 'center' },
  island: { width: 20, height: 5, borderRadius: 3, marginTop: space[1] },
  sideBtn: { position: 'absolute', right: -1.5, top: 40, width: 2.5, height: 20, borderRadius: 2 },
  checkLayer: { position: 'absolute', width: CHECK_SIZE, height: CHECK_SIZE, alignItems: 'center', justifyContent: 'center' },
  monoChip: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 7, paddingHorizontal: space[2], paddingVertical: space[1] },
  splitTile: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: space[2], borderWidth: 1, borderRadius: 99, paddingHorizontal: space[3], paddingVertical: space[1], alignSelf: 'flex-start' },

  // Size comes from the ramp at each call site (`size="micro"`); this carries
  // only the treatment.
  micro: { letterSpacing: 1.1, textTransform: 'uppercase' },
  h1: { letterSpacing: -0.4, textAlign: 'center' },
  p: { textAlign: 'center', maxWidth: 300, marginTop: layout.captionGap },

  // Card owns the surface, border and padding — TL_PAD_TOP is derived from the
  // same token, which is what keeps the absolute timeline line on the nodes.
  card: { borderRadius: 20 },
  tlLabel: { marginBottom: layout.labelGap },
  tlLine: { position: 'absolute', left: LINE_X, width: 2, borderRadius: 1 },
  tlRow: { height: ROW_H, flexDirection: 'row', alignItems: 'center', gap: layout.rowGap },
  node: { width: NODE, height: NODE, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center' },
  bloom: { position: 'absolute', width: 120, height: 120, borderRadius: 60, zIndex: 5 },
  auditWrap: { alignItems: 'center', marginTop: layout.blockGap },
  exitRamp: { textAlign: 'center', marginTop: layout.captionGap },

  ticket: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
    borderRadius: 20,
    overflow: 'visible',
  },
  ticketBody: { padding: layout.cardPad },
  ticketHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  admitTag: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.14)', borderRadius: 5, paddingHorizontal: space[2], paddingVertical: space[1] },

  // perforation between body and stub — dashed line flanked by punched notches
  perfRow: { height: 20, justifyContent: 'center' },
  perfHole: { position: 'absolute', top: '50%', marginTop: -PERF_R, width: PERF_R * 2, height: PERF_R * 2, borderRadius: PERF_R },
  perfLine: { marginHorizontal: layout.cardPad, height: 2, justifyContent: 'center' },

  // tear-off stub — faintly tinted, rounded to match the ticket's bottom edge
  ticketStub: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.rowGap,
    paddingHorizontal: layout.cardPad,
    paddingTop: space[3],
    paddingBottom: layout.cardPad,
    backgroundColor: 'rgba(0,0,0,0.022)',
    borderBottomLeftRadius: 19,
    borderBottomRightRadius: 19,
  },
  barcode: { flexDirection: 'row', alignItems: 'stretch', height: 34 },
  certTag: { borderWidth: 1, borderRadius: 6, paddingHorizontal: space[2], paddingVertical: space[1] },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: layout.rowGap, paddingVertical: space[3] },
  certTile: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },

  footer: { paddingTop: layout.blockGap, paddingBottom: layout.screenBottom, minHeight: 76, justifyContent: 'center' },
  helpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], paddingVertical: space[3] },
  skipLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
});
