import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { ChevronDown, ChevronRight, ChevronUp, Eye, Lock, LockOpen, Power, Server } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { AuditLine } from '../../components/AuditLine';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { InfoNote } from '../../components/InfoNote';
import { StatusDot } from '../../components/StatusDot';
import { ScreenHeader } from '../../components/ScreenHeader';
import { BottomSheet } from '../../components/BottomSheet';
import { Entrance, PressableScale, StateSwap } from '../../components/Motion';
import { EmbossedDisc, GlassChip, GlassPill, hexA } from '../../components/Glass';
import { TypingDots } from '../../components/Animations';
import { MONO } from '../../theme/typography';
import { layout, touch, control } from '../../theme/spacing';
import { radii } from '../../theme/platform';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { useAppStore, ORG_NAME, findAudit } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Vpn'>;
type VpnState = 'off' | 'connecting' | 'on';

const AnimatedCircle: any = Animated.createAnimatedComponent(Circle);

// Scaled ~1.7x from the original at the same ring-to-disc ratio (~0.21 gap), so
// the seal actually occupies the room the screen has instead of floating in it.
const SEAL = 112; // the lock disc at the centre of the seal
const RING = 220; // the ring that closes around it as the tunnel establishes
const RING_R = 98;
const RING_W = 4; // heavier stroke to stay legible at this diameter
const H = 252; // hero stage height
const EASE_WORLD = Easing.bezier(0.4, 0, 0.2, 1);


export function VpnScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const vpn = useAppStore((s) => s.vpn);
  const vpnSecs = useAppStore((s) => s.vpnSecs);
  const vpnPing = useAppStore((s) => s.vpnPing);
  const toggleVpn = useAppStore((s) => s.toggleVpn);
  const activity = useAppStore((s) => s.activity);

  // "Connected" outlives its 4.5s toast by the whole session, so the audit line
  // has to live next to it — that is the difference between a receipt and a
  // claim you can no longer check.
  const connectAudit = findAudit(activity, 'tunnel', ['Secure tunnel connected']);

  const on = vpn === 'on';
  const connecting = vpn === 'connecting';
  const mm = ('0' + Math.floor(vpnSecs / 60)).slice(-2);
  const ss = ('0' + (vpnSecs % 60)).slice(-2);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [gwOpen, setGwOpen] = useState(false);
  const [xrayOpen, setXrayOpen] = useState(false);

  // ---- the one world clock: 0 = off · 1 = connecting · 2 = on -------------
  // Ambient wash, content dim, CTA fill/border/labels all read this value so
  // every state change moves together — a weather change, not a re-render.
  const world = useRef(new Animated.Value(vpn === 'on' ? 2 : vpn === 'connecting' ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(world, {
      toValue: vpn === 'on' ? 2 : vpn === 'connecting' ? 1 : 0,
      duration: reduced ? 0 : 550,
      easing: EASE_WORLD,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vpn, reduced]);

  useEffect(() => {
    if (vpn === 'off') setXrayOpen(false);
  }, [vpn]);

  const washConnecting = world.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] });
  const washOn = world.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 0, 1] });
  const contentDim = world.interpolate({ inputRange: [0, 1, 2], outputRange: [1, 0.35, 1] });
  const ctaFill = world.interpolate({ inputRange: [0, 1, 2], outputRange: [1, 1, 0] });
  const ctaOutline = world.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 0, 1] });
  const lblConnect = world.interpolate({ inputRange: [0, 0.5, 1, 2], outputRange: [1, 0, 0, 0] });
  const lblEstablishing = world.interpolate({ inputRange: [0, 0.5, 1, 1.5, 2], outputRange: [0, 0, 1, 0, 0] });
  const lblDisconnect = world.interpolate({ inputRange: [0, 1, 1.5, 2], outputRange: [0, 0, 0, 1] });

  const washTop = isDark ? 0.2 : 0.11;
  const glassEdge = isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.14)';
  const glassFill = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.045)';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      {/* ---- ambient wash: two state-tinted gradients cross-fading on the world clock ---- */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: washConnecting }]}>
          <LinearGradient
            colors={[hexA(colors.primary, washTop), hexA(colors.primary, 0)] as const}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.9 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: washOn }]}>
          <LinearGradient
            colors={[hexA(colors.success, washTop), hexA(colors.success, 0)] as const}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.9 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>

      <View style={styles.headerPad}>
        <ScreenHeader title="Secure tunnel" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <TunnelSeal vpn={vpn} />

        {/* status pill — tint + label move with the same state change */}
        <View style={styles.pillWrap} accessibilityLiveRegion="polite">
          <StateSwap stateKey={vpn} style={{ alignItems: 'center' }}>
            <GlassPill tint={on ? colors.success : connecting ? colors.primary : undefined}>
              {connecting ? (
                <TypingDots color={colors.primary} />
              ) : (
                <StatusDot
                  color={on ? colors.success : colors.faint}
                  label={on ? 'Connected' : 'Not connected'}
                  labelHidden
                />
              )}
              <AppText
                variant="bodySemibold"
                size="caption"
                color={on ? colors.success : connecting ? colors.primary : colors.muted}
              >
                {on ? 'Connected' : connecting ? 'Establishing secure tunnel…' : 'Not connected'}
              </AppText>
            </GlassPill>
          </StateSwap>
        </View>

        {/* non-hero content — dims to 0.35 while the tunnel is being established */}
        <Animated.View style={{ opacity: contentDim }} pointerEvents={connecting ? 'none' : 'auto'}>
          <AppText style={[styles.receipt, { color: colors.muted2 }]}>
            THIS DEVICE · SECURE TUNNEL · {ORG_NAME.toUpperCase()} GATEWAY
          </AppText>

          {on ? (
            <View key="on-content">
              {/* The session IS the number worth reading: how long you have been
                  sealed. Throughput cards were three lookalike tiles of noise —
                  nobody acts on 43 Mbps up. One clock, in mono, at hero size. */}
              <Entrance delay={0}>
                <View style={styles.sessionWrap}>
                  <AppText style={[styles.sessionTime, { color: colors.text }]} accessibilityLabel={`Session ${mm} minutes ${ss} seconds`}>
                    {mm}:{ss}
                  </AppText>
                  <AppText
                    variant="bodySemibold"
                    size="micro"
                    color={colors.muted2}
                    style={[styles.microLabel, { marginTop: layout.captionGap }]}
                  >
                    SESSION · {vpnPing} MS · AES-256
                  </AppText>
                  {connectAudit ? (
                    <AuditLine
                      time={connectAudit.time}
                      actor={connectAudit.actor}
                      onPress={() => navigation.navigate('Activity')}
                    />
                  ) : null}
                </View>
              </Entrance>

              {/* gateway row */}
              <Entrance delay={90}>
                <GatewayRow
                  tint={colors.success}
                  meta={`WIREGUARD · ${vpnPing} MS · AES-256`}
                  borderColor={hexA(colors.success, isDark ? 0.32 : 0.28)}
                  onPress={() => setGwOpen(true)}
                />
              </Entrance>

              {/* honest-broker expander */}
              <Entrance delay={280}>
                <Card padded={false} style={styles.xray}>
                  <PressableScale
                    scaleTo={0.985}
                    onPress={() => setXrayOpen((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel="What IT can see about this tunnel"
                    accessibilityState={{ expanded: xrayOpen }}
                  >
                    <View style={styles.xrayHead}>
                      <Eye size={control.icon.sm} color={colors.muted} strokeWidth={2} />
                      <AppText
                        variant="bodySemibold"
                        size="micro"
                        color={colors.muted2}
                        style={[styles.microLabel, { flex: 1 }]}
                      >
                        WHAT IT CAN SEE ABOUT THIS TUNNEL
                      </AppText>
                      {xrayOpen ? (
                        <ChevronUp size={control.icon.sm} color={colors.faint} strokeWidth={2.2} />
                      ) : (
                        <ChevronDown size={control.icon.sm} color={colors.faint} strokeWidth={2.2} />
                      )}
                    </View>
                  </PressableScale>
                  {xrayOpen && (
                    <Entrance from={8} scaleFrom={0.99}>
                      <AppText variant="bodyMedium" size="caption" color={colors.text3} style={styles.xrayBody}>
                        Connection time and data volume — never the content, never personal traffic.
                      </AppText>
                    </Entrance>
                  )}
                </Card>
              </Entrance>
            </View>
          ) : (
            <View key="off-content">
              <AppText
                variant="bodySemibold"
                size="micro"
                color={colors.muted2}
                style={[styles.microLabel, styles.sectionLabel]}
              >
                CONNECTION
              </AppText>
              <GatewayRow
                tint={colors.primary}
                meta="WIREGUARD · RECOMMENDED"
                borderColor={colors.border}
                style={{ marginTop: layout.labelGap }}
                onPress={() => setGwOpen(true)}
              />
              <InfoNote text="Only work traffic uses the tunnel — your personal apps and browsing go direct and stay private." />
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ---- CTA: one element, morphs filled -> spinner -> glass outline ----
           Deliberately NOT <Button>: the fill/outline cross-fade and the three
           label layers all ride the screen's world clock, so the CTA changes
           state with the ambient wash instead of re-rendering. `Button` has no
           seam for that, and its `loading` state would drop the "Establishing…"
           label entirely. Geometry and type come from the tokens either way. */}
      <View style={styles.footer}>
        <PressableScale
          onPress={() => {
            if (connecting) return;
            if (on) setSheetOpen(true);
            else toggleVpn();
          }}
          disabled={connecting}
          accessibilityRole="button"
          accessibilityLabel={on ? 'Disconnect' : connecting ? 'Establishing secure tunnel' : 'Connect'}
          accessibilityState={{ disabled: connecting, busy: connecting }}
        >
          <View style={styles.cta}>
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: radii.button, backgroundColor: colors.primary, opacity: ctaFill },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: radii.button,
                  borderWidth: 1,
                  borderColor: glassEdge,
                  backgroundColor: glassFill,
                  opacity: ctaOutline,
                },
              ]}
            />
            <Animated.View style={[styles.ctaRow, { opacity: lblConnect }]}>
              <Power size={control.icon.md} color={colors.white} strokeWidth={2.2} />
              <AppText variant="bodySemibold" size="callout" color={colors.white}>
                Connect
              </AppText>
            </Animated.View>
            <Animated.View style={[styles.ctaRow, { opacity: lblEstablishing }]}>
              <ArcSpinner size={17} color={colors.white} active={connecting} />
              <AppText variant="bodySemibold" size="callout" color={colors.white}>
                Establishing…
              </AppText>
            </Animated.View>
            <Animated.View style={[styles.ctaRow, { opacity: lblDisconnect }]}>
              <AppText variant="bodySemibold" size="callout" color={colors.text}>
                Disconnect
              </AppText>
            </Animated.View>
          </View>
        </PressableScale>
      </View>

      {/* ---- gateway details — what the chevron always implied and never did ---- */}
      <BottomSheet visible={gwOpen} onClose={() => setGwOpen(false)} accessibilityLabel="Secure tunnel details">
        <View style={styles.sheetBody}>
          <View style={styles.gwSheetHead}>
            <GlassChip size={control.tile} tint={on ? colors.success : colors.primary}>
              <Server size={18} color={on ? colors.success : colors.primary} strokeWidth={2} />
            </GlassChip>
            <View style={{ flex: 1 }}>
              <AppText variant="display" size="title" accessibilityRole="header">
                Secure tunnel
              </AppText>
              <AppText variant="bodyMedium" size="caption" color={colors.muted} style={{ marginTop: layout.captionGap }}>
                {on ? 'Carrying your work traffic now' : 'Recommended for this device'}
              </AppText>
            </View>
          </View>

          <Card padded={false} style={styles.gwSpecs}>
            <GwSpec label="PROTOCOL" value="WireGuard®" />
            <GwSpec label="CIPHER" value="AES-256-GCM" />
            <GwSpec label="LATENCY" value={on ? `${vpnPing} ms` : '—'} />
            <GwSpec label="REGION" value="Office · in-country" last />
          </Card>

          <InfoNote
            text={`Chosen and managed by ${ORG_NAME} IT. Where your work traffic is routed cannot change without a policy change.`}
          />

          <Button
            label="Done"
            variant="secondary"
            size="lg"
            onPress={() => setGwOpen(false)}
            accessibilityLabel="Close gateway details"
            style={{ marginTop: layout.blockGap }}
          />
        </View>
      </BottomSheet>

      {/* ---- disconnect confirmation sheet — consequence stated first, then the
           destructive action as the design system's `danger` Button ---- */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} accessibilityLabel="Turn off the secure tunnel">
        <View style={styles.sheetBody}>
          <AppText variant="display" size="title" accessibilityRole="header">
            Turn off the secure tunnel?
          </AppText>
          <AppText style={[styles.sheetReceipt, { color: colors.muted2 }]}>
            SESSION {mm}:{ss} · WIREGUARD · {ORG_NAME.toUpperCase()}
          </AppText>
          <AppText variant="bodyMedium" size="footnote" color={colors.text3} style={styles.sheetCopy}>
            While the tunnel is off, work apps and internal sites will not load. IT can see the tunnel is off.
          </AppText>
          <Button
            label="Turn off secure tunnel"
            variant="danger"
            size="lg"
            onPress={() => {
              setSheetOpen(false);
              toggleVpn();
            }}
            accessibilityLabel="Turn off secure tunnel"
            style={{ marginTop: layout.blockGap }}
          />
          <Button
            label="Keep connected"
            variant="secondary"
            size="lg"
            onPress={() => setSheetOpen(false)}
            accessibilityLabel="Keep connected"
            style={{ marginTop: layout.cardGap }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

/** One spec line in the gateway sheet — label left, mono value right. */
function GwSpec({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.gwSpecRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}>
      <AppText variant="bodySemibold" size="micro" color={colors.muted2} style={styles.microLabel}>
        {label}
      </AppText>
      {/* MONO receipt value. The family is the exception, not the size — it
          rides the ramp like everything else. */}
      <AppText size="micro" color={colors.text2} style={{ fontFamily: MONO }}>
        {value}
      </AppText>
    </View>
  );
}

/** The connection row — one component so the connected and off states cannot
 *  drift apart, and so the chevron is honest: it now opens the detail sheet.
 *  Previously both rows drew a chevron and did nothing when tapped.
 *
 *  It used to be labelled "Office gateway", which read as a fifth name for the
 *  one thing this screen is about. The gateway is where the tunnel terminates,
 *  not a separate feature — the sheet still spells out its protocol, cipher and
 *  region, but the name on the row is the tunnel's. */
function GatewayRow({
  tint,
  meta,
  borderColor,
  style,
  onPress,
}: {
  tint: string;
  meta: string;
  borderColor: string;
  style?: any;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel="Secure tunnel details"
    >
      <Card style={[styles.gwRow, { borderColor }, style]}>
        <GlassChip size={38} tint={tint}>
          <Server size={17} color={tint} strokeWidth={2} />
        </GlassChip>
        <View style={{ flex: 1 }}>
          <AppText variant="bodySemibold" size="footnote">
            Secure tunnel
          </AppText>
          <AppText style={[styles.gwMeta, { color: colors.muted }]}>{meta}</AppText>
        </View>
        <ChevronRight size={control.icon.md} color={colors.faint} strokeWidth={2.2} />
      </Card>
    </PressableScale>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero — one seal, held still.
 *
 *  The old hero drew two boxes joined by a pipe, floating on a 3D
 *  wobble: a diagram of a metaphor the receipt line already states in
 *  words ("THIS DEVICE · SECURE TUNNEL · … GATEWAY"), plus motion that
 *  meant nothing. Saying it twice was the generic part.
 *
 *  This says it once, with one object: a ring that closes across the
 *  store's real connect window, and a lock that springs shut when it
 *  lands. Determinate progress, one reward beat, and then it sits —
 *  a seal should be still.
 *
 *  Purely decorative: the status pill under it carries the state in
 *  words, so the whole stage is hidden from screen readers.
 * ------------------------------------------------------------------ */
function TunnelSeal({ vpn }: { vpn: VpnState }) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();

  const lockPop = useRef(new Animated.Value(1)).current; // 0 -> spring 1 (overshoots) on land
  const halo = useRef(new Animated.Value(0)).current; // one-shot bloom on connect
  const lit = useRef(new Animated.Value(vpn === 'on' ? 1 : 0)).current; // ring closes 0 -> 1
  const prev = useRef(vpn);

  useEffect(() => {
    const was = prev.current;
    prev.current = vpn;
    if (vpn === 'off') {
      Animated.timing(lit, { toValue: 0, duration: reduced ? 0 : 280, easing: Easing.in(Easing.cubic), useNativeDriver: false }).start();
      return;
    }
    if (vpn === 'connecting') {
      lit.setValue(0);
      // Paced to the store's real 2200ms connect window and landing just before
      // it flips: this is determinate progress, not a spinner guessing.
      Animated.timing(lit, { toValue: 1, duration: reduced ? 0 : 2000, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
      return;
    }
    lit.setValue(1);
    // The one reward beat, and only on a real connecting -> on transition, so
    // arriving with the tunnel already up does not fake a celebration.
    if (was === 'connecting' && !reduced) {
      haptics.success();
      lockPop.setValue(0);
      Animated.spring(lockPop, { toValue: 1, damping: 9, stiffness: 260, mass: 0.7, useNativeDriver: true }).start();
      halo.setValue(0);
      Animated.timing(halo, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vpn, reduced]);

  const CIRC = 2 * Math.PI * RING_R;
  const tint = vpn === 'on' ? colors.success : vpn === 'connecting' ? colors.primary : colors.muted;
  const lockScale = lockPop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.3] });
  const haloOp = halo.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 0.45, 0] });
  const LockIcon = vpn === 'off' ? LockOpen : Lock;

  return (
    <View style={styles.hero} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View
        pointerEvents="none"
        style={[
          styles.sealHalo,
          {
            borderColor: hexA(colors.success, 0.55),
            backgroundColor: hexA(colors.success, 0.1),
            opacity: haloOp,
            transform: [{ scale: haloScale }],
          },
        ]}
      />
      <Svg width={RING} height={RING} style={{ position: 'absolute' }}>
        <Circle
          cx={RING / 2}
          cy={RING / 2}
          r={RING_R}
          stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}
          strokeWidth={RING_W}
          fill="none"
        />
        <AnimatedCircle
          cx={RING / 2}
          cy={RING / 2}
          r={RING_R}
          stroke={tint}
          strokeWidth={RING_W}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRC} ${CIRC}`}
          strokeDashoffset={lit.interpolate({ inputRange: [0, 1], outputRange: [CIRC, 0] })}
          transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
        />
      </Svg>
      {/* No drop shadow: EmbossedDisc already lifts itself with a 1px top light
          and an inner bottom shade. The extra cast shadow was the only thing
          making it read as a sticker floating over the page. */}
      <Animated.View style={{ transform: [{ scale: lockScale }] }}>
        <EmbossedDisc size={SEAL}>
          <StateSwap stateKey={vpn}>
            <LockIcon size={42} color={tint} strokeWidth={1.9} />
          </StateSwap>
        </EmbossedDisc>
      </Animated.View>
    </View>
  );
}

/** 270° arc spinner orbiting inside the CTA while establishing.
 *
 *  NOT `Spinner`/`SpinningDashedRing` from components/Animations: both of those
 *  start an unconditional loop on mount with no reduce-motion gate and no
 *  `active` gate, so swapping either in would spin forever behind a faded-out
 *  label and would keep spinning with Reduce Motion on. The gating is the whole
 *  point here, so this copy stays. */
function ArcSpinner({ size, color, active }: { size: number; color: string; active: boolean }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active || reduced) return;
    v.setValue(0);
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced]);
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const r = (size - 3) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * 0.75} ${c}`}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerPad: { paddingHorizontal: layout.gutter },
  // The footer below owns the screen's bottom edge, so this only needs the gap
  // to it — the root SafeAreaView already claims the inset.
  body: { paddingHorizontal: layout.gutter, paddingTop: layout.captionGap, paddingBottom: layout.blockGap },

  hero: { height: H, alignItems: 'center', justifyContent: 'center' },
  sealHalo: { position: 'absolute', width: RING, height: RING, borderRadius: RING / 2, borderWidth: 2 },

  pillWrap: { alignItems: 'center', marginTop: layout.blockGap },
  // MONO receipt lines keep their raw size by the type ramp's own exception.
  receipt: { fontFamily: MONO, fontSize: 10, letterSpacing: 0.8, textAlign: 'center', marginTop: layout.blockGap },
  microLabel: { letterSpacing: 1.1 },
  sectionLabel: { marginTop: layout.sectionGap },

  // The session clock, at hero weight — tabular mono so the digits don't jitter.
  sessionWrap: { alignItems: 'center', marginTop: layout.blockGap, marginBottom: layout.captionGap },
  sessionTime: { fontFamily: MONO, fontSize: 46, letterSpacing: 1, lineHeight: 54 },

  gwRow: { flexDirection: 'row', alignItems: 'center', gap: layout.rowGap, marginTop: layout.cardGap },
  gwMeta: { fontFamily: MONO, fontSize: 10, letterSpacing: 0.5, marginTop: layout.captionGap },
  gwSheetHead: { flexDirection: 'row', alignItems: 'center', gap: layout.rowGap, marginBottom: layout.blockGap },
  gwSpecs: { paddingHorizontal: layout.cardPad },
  gwSpecRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: layout.rowPadV },

  xray: { marginTop: layout.cardGap, overflow: 'hidden' },
  xrayHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.labelGap,
    paddingHorizontal: layout.rowPadH,
    paddingVertical: layout.rowPadV,
    minHeight: touch.min,
  },
  xrayBody: { paddingHorizontal: layout.rowPadH, paddingBottom: layout.rowPadV },

  // The root SafeAreaView claims the bottom inset; this adds the resting gap
  // above it. Claiming `insets.bottom` here too would double it.
  footer: { paddingHorizontal: layout.gutter, paddingTop: layout.cardGap, paddingBottom: layout.screenBottom },
  cta: { height: control.height.lg, borderRadius: radii.button, overflow: 'hidden' },
  ctaRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: layout.labelGap,
  },

  // BottomSheet already pads for the home indicator + `layout.screenBottom`.
  sheetBody: { paddingHorizontal: layout.sheetPad, paddingTop: layout.labelGap },
  sheetReceipt: { fontFamily: MONO, fontSize: 10, letterSpacing: 0.6, marginTop: layout.captionGap },
  sheetCopy: { marginTop: layout.blockGap },
});
