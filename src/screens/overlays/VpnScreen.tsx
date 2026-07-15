import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ChevronUp, Eye, Lock, Power, Server } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { ScreenHeader } from '../../components/ScreenHeader';
import { BottomSheet } from '../../components/BottomSheet';
import { CountUp, Entrance, PressableScale, StateSwap, GlowOrb } from '../../components/Motion';
import { EmbossedDisc, GlassChip, GlassPill } from '../../components/Glass';
import { PulseRings, TypingDots } from '../../components/Animations';
import { MONO } from '../../theme/typography';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { useAppStore, ORG_NAME } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Vpn'>;
type VpnState = 'off' | 'connecting' | 'on';

const AnimatedCircle: any = Animated.createAnimatedComponent(Circle);
const AnimatedPath: any = Animated.createAnimatedComponent(Path);

const DISC = 160; // hero disc
const RING = 188; // success ring
const ORBIT = 224; // connecting orbit ellipse
const STAGE = 244; // hero stage square
const EASE_WORLD = Easing.bezier(0.4, 0, 0.2, 1);

/** hex -> rgba at given alpha (for state-tinted washes and hairlines). */
function alpha(hex: string, a: number): string {
  if (hex.startsWith('#') && (hex.length === 7 || hex.length === 4)) {
    const full = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
    const r = parseInt(full.slice(1, 3), 16);
    const g = parseInt(full.slice(3, 5), 16);
    const b = parseInt(full.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return hex;
}

export function VpnScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const vpn = useAppStore((s) => s.vpn);
  const vpnSecs = useAppStore((s) => s.vpnSecs);
  const vpnDown = useAppStore((s) => s.vpnDown);
  const vpnUp = useAppStore((s) => s.vpnUp);
  const vpnPing = useAppStore((s) => s.vpnPing);
  const toggleVpn = useAppStore((s) => s.toggleVpn);

  const on = vpn === 'on';
  const connecting = vpn === 'connecting';
  const mm = ('0' + Math.floor(vpnSecs / 60)).slice(-2);
  const ss = ('0' + (vpnSecs % 60)).slice(-2);

  const [sheetOpen, setSheetOpen] = useState(false);
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
            colors={[alpha(colors.primary, washTop), alpha(colors.primary, 0)] as const}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.9 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: washOn }]}>
          <LinearGradient
            colors={[alpha(colors.success, washTop), alpha(colors.success, 0)] as const}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.9 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <ScreenHeader title="Secure tunnel" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <TunnelHero vpn={vpn} world={world} />

        {/* status pill — tint + label move with the same state change */}
        <View style={styles.pillWrap} accessibilityLiveRegion="polite">
          <StateSwap stateKey={vpn} style={{ alignItems: 'center' }}>
            <GlassPill tint={on ? colors.success : connecting ? colors.primary : undefined}>
              {connecting ? (
                <TypingDots color={colors.primary} />
              ) : (
                <View style={[styles.pillDot, { backgroundColor: on ? colors.success : colors.faint }]} />
              )}
              <AppText
                variant="bodySemibold"
                color={on ? colors.success : connecting ? colors.primary : colors.muted}
                style={{ fontSize: 12.5 }}
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
              {/* stats strip — CountUp Mbps + mono session timer */}
              <View style={styles.stats}>
                <Entrance delay={0} style={{ flex: 1 }}>
                  <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ArrowDown size={15} color={colors.success} strokeWidth={2.2} />
                    <View style={styles.statValueRow}>
                      <CountUp value={vpnDown}>
                        {(d) => (
                          <AppText variant="displaySemibold" style={{ fontSize: 17 }}>
                            {d}
                          </AppText>
                        )}
                      </CountUp>
                      <AppText variant="bodyMedium" color={colors.muted} style={{ fontSize: 10 }}>
                        Mbps
                      </AppText>
                    </View>
                    <AppText variant="bodySemibold" color={colors.muted2} style={styles.micro}>
                      DOWN
                    </AppText>
                  </View>
                </Entrance>
                <Entrance delay={70} style={{ flex: 1 }}>
                  <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ArrowUp size={15} color={colors.success} strokeWidth={2.2} />
                    <View style={styles.statValueRow}>
                      <CountUp value={vpnUp}>
                        {(d) => (
                          <AppText variant="displaySemibold" style={{ fontSize: 17 }}>
                            {d}
                          </AppText>
                        )}
                      </CountUp>
                      <AppText variant="bodyMedium" color={colors.muted} style={{ fontSize: 10 }}>
                        Mbps
                      </AppText>
                    </View>
                    <AppText variant="bodySemibold" color={colors.muted2} style={styles.micro}>
                      UP
                    </AppText>
                  </View>
                </Entrance>
                <Entrance delay={140} style={{ flex: 1 }}>
                  <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Lock size={15} color={colors.success} strokeWidth={2.2} />
                    <View style={styles.statValueRow}>
                      <AppText style={{ fontFamily: MONO, fontSize: 16, color: colors.text }}>
                        {mm}:{ss}
                      </AppText>
                    </View>
                    <AppText variant="bodySemibold" color={colors.muted2} style={styles.micro}>
                      SESSION
                    </AppText>
                  </View>
                </Entrance>
              </View>

              {/* gateway row */}
              <Entrance delay={210}>
                <View style={[styles.gwRow, { backgroundColor: colors.surface, borderColor: alpha(colors.success, isDark ? 0.32 : 0.28) }]}>
                  <GlassChip size={38} tint={colors.success}>
                    <Server size={17} color={colors.success} strokeWidth={2} />
                  </GlassChip>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
                      Office gateway
                    </AppText>
                    <AppText style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 0.5, color: colors.muted, marginTop: 2 }}>
                      WIREGUARD · {vpnPing} MS · AES-256
                    </AppText>
                  </View>
                  <ChevronRight size={16} color={colors.faint} strokeWidth={2.2} />
                </View>
              </Entrance>

              {/* honest-broker expander */}
              <Entrance delay={280}>
                <View style={[styles.xray, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <PressableScale
                    scaleTo={0.985}
                    onPress={() => setXrayOpen((v) => !v)}
                    accessibilityLabel="What IT can see about this tunnel"
                    accessibilityState={{ expanded: xrayOpen }}
                  >
                    <View style={styles.xrayHead}>
                      <Eye size={14} color={colors.muted} strokeWidth={2} />
                      <AppText variant="bodySemibold" color={colors.muted2} style={[styles.micro, { flex: 1, marginTop: 0 }]}>
                        WHAT IT CAN SEE ABOUT THIS TUNNEL
                      </AppText>
                      {xrayOpen ? (
                        <ChevronUp size={15} color={colors.faint} strokeWidth={2.2} />
                      ) : (
                        <ChevronDown size={15} color={colors.faint} strokeWidth={2.2} />
                      )}
                    </View>
                  </PressableScale>
                  {xrayOpen && (
                    <Entrance from={8} scaleFrom={0.99}>
                      <AppText variant="bodyMedium" color={colors.text3} style={styles.xrayBody}>
                        Connection time and data volume — never the content, never personal traffic.
                      </AppText>
                    </Entrance>
                  )}
                </View>
              </Entrance>
            </View>
          ) : (
            <View key="off-content">
              <AppText variant="bodySemibold" color={colors.muted2} style={[styles.micro, styles.sectionLabel]}>
                GATEWAY
              </AppText>
              <View style={[styles.gwRow, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 8 }]}>
                <GlassChip size={38} tint={colors.primary}>
                  <Server size={17} color={colors.primary} strokeWidth={2} />
                </GlassChip>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodySemibold" style={{ fontSize: 13.5 }}>
                    Office gateway
                  </AppText>
                  <AppText style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 0.5, color: colors.muted, marginTop: 2 }}>
                    WIREGUARD · RECOMMENDED
                  </AppText>
                </View>
                <ChevronRight size={16} color={colors.faint} strokeWidth={2.2} />
              </View>
              <View style={[styles.note, { backgroundColor: colors.surfaceSunken }]}>
                <Lock size={17} color={colors.muted} strokeWidth={2} />
                <AppText variant="bodyMedium" color={colors.text3} style={styles.noteText}>
                  Only work traffic uses the tunnel — your personal apps and browsing go direct and stay private.
                </AppText>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ---- CTA: one element, morphs filled -> spinner -> glass outline ---- */}
      <View style={styles.footer}>
        <PressableScale
          onPress={() => {
            if (connecting) return;
            if (on) setSheetOpen(true);
            else toggleVpn();
          }}
          disabled={connecting}
          accessibilityLabel={on ? 'Disconnect' : connecting ? 'Establishing secure tunnel' : 'Connect'}
          accessibilityState={{ disabled: connecting, busy: connecting }}
        >
          <View style={styles.cta}>
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { borderRadius: 16, backgroundColor: colors.primary, opacity: ctaFill }]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: 16, borderWidth: 1, borderColor: glassEdge, backgroundColor: glassFill, opacity: ctaOutline },
              ]}
            />
            <Animated.View style={[styles.ctaRow, { opacity: lblConnect }]}>
              <Power size={16} color={colors.white} strokeWidth={2.2} />
              <AppText variant="bodySemibold" color={colors.white} style={{ fontSize: 15.5 }}>
                Connect
              </AppText>
            </Animated.View>
            <Animated.View style={[styles.ctaRow, { opacity: lblEstablishing }]}>
              <ArcSpinner size={17} color={colors.white} active={connecting} />
              <AppText variant="bodySemibold" color={colors.white} style={{ fontSize: 15.5 }}>
                Establishing…
              </AppText>
            </Animated.View>
            <Animated.View style={[styles.ctaRow, { opacity: lblDisconnect }]}>
              <AppText variant="bodySemibold" color={colors.text} style={{ fontSize: 15.5 }}>
                Disconnect
              </AppText>
            </Animated.View>
          </View>
        </PressableScale>
      </View>

      {/* ---- disconnect confirmation sheet — consequence stated, danger demoted ---- */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <View style={styles.sheetBody}>
          <AppText variant="display" style={{ fontSize: 19 }}>
            Turn off the tunnel?
          </AppText>
          <AppText style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 0.6, color: colors.muted2, marginTop: 6 }}>
            SESSION {mm}:{ss} · WIREGUARD · {ORG_NAME.toUpperCase()}
          </AppText>
          <AppText variant="bodyMedium" color={colors.text3} style={styles.sheetCopy}>
            While the tunnel is off, work apps and internal sites will not load. IT can see the tunnel is off.
          </AppText>
          <PressableScale
            onPress={() => {
              setSheetOpen(false);
              toggleVpn();
            }}
            accessibilityLabel="Turn off tunnel"
            style={[styles.sheetBtn, { backgroundColor: colors.surfaceSunken }]}
          >
            <AppText variant="bodySemibold" color={colors.dangerText} style={{ fontSize: 14.5 }}>
              Turn off tunnel
            </AppText>
          </PressableScale>
          <PressableScale
            onPress={() => setSheetOpen(false)}
            accessibilityLabel="Keep connected"
            style={[styles.sheetBtn, { backgroundColor: colors.surfaceActive, marginTop: 10 }]}
          >
            <AppText variant="bodySemibold" style={{ fontSize: 14.5 }}>
              Keep connected
            </AppText>
          </PressableScale>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero — one morphing composition that never unmounts.
 *  off: dim disc · connecting: orbiting dots + sonar · on: drawn
 *  success ring + bloom + breathing pulse + secure-horizon arc.
 * ------------------------------------------------------------------ */
function TunnelHero({ vpn, world }: { vpn: VpnState; world: Animated.Value }) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);

  const lockPop = useRef(new Animated.Value(1)).current; // 0 -> spring 1 (overshoots)
  const halo = useRef(new Animated.Value(0)).current; // one-shot bloom
  const ringDraw = useRef(new Animated.Value(vpn === 'on' ? 1 : 0)).current; // strokeDashoffset draw
  const arcDraw = useRef(new Animated.Value(vpn === 'on' ? 1 : 0)).current; // horizon arc draw
  const orbit = useRef(new Animated.Value(0)).current; // connecting orbit rotation
  const breath = useRef(new Animated.Value(0)).current; // 4s breathing loop when on
  const prev = useRef(vpn);

  // success beat + ring/arc draws on connecting -> on
  useEffect(() => {
    const was = prev.current;
    prev.current = vpn;
    if (vpn !== 'on') return;
    if (was === 'connecting') haptics.success();
    if (reduced || was !== 'connecting') {
      ringDraw.setValue(1);
      arcDraw.setValue(1);
      lockPop.setValue(1);
      return;
    }
    lockPop.setValue(0);
    Animated.spring(lockPop, { toValue: 1, damping: 9, stiffness: 260, mass: 0.7, useNativeDriver: true }).start();
    halo.setValue(0);
    Animated.timing(halo, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    ringDraw.setValue(0);
    Animated.timing(ringDraw, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    arcDraw.setValue(0);
    Animated.timing(arcDraw, { toValue: 1, duration: 900, delay: 180, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vpn]);

  // orbit loop — connecting only, no-ops under reduced motion
  useEffect(() => {
    if (vpn !== 'connecting' || reduced) return;
    orbit.setValue(0);
    const loop = Animated.loop(Animated.timing(orbit, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vpn, reduced]);

  // 4s breathing pulse — on only, no-ops under reduced motion
  useEffect(() => {
    if (vpn !== 'on' || reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      breath.setValue(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vpn, reduced]);

  const washConnecting = world.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] });
  const washOn = world.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 0, 1] });
  const glowOpacity = world.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 0.7, 0.9] });
  const discDim = world.interpolate({ inputRange: [0, 1, 2], outputRange: [1, 0.35, 0] });

  const orbitSpin = orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const breathScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });
  const breathOp = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] });
  const lockScale = lockPop.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });
  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const haloOp = halo.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 0.5, 0] });

  const rr = RING / 2 - 3;
  const RC = 2 * Math.PI * rr;
  const arcLen = Math.max(w, 1) * 1.2;
  const lockColor = vpn === 'on' ? colors.success : vpn === 'connecting' ? colors.primary : colors.muted;

  return (
    <View style={styles.hero} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {/* secure horizon — thin gradient arc drawing across the width above the disc */}
      {w > 0 && (
        <Animated.View pointerEvents="none" style={[styles.horizon, { opacity: washOn }]}>
          <Svg width={w} height={64} viewBox={`0 0 ${w} 64`}>
            <Defs>
              <SvgLinearGradient id="vpnHorizon" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.success} stopOpacity="0" />
                <Stop offset="0.5" stopColor={colors.successStrong} stopOpacity="0.9" />
                <Stop offset="1" stopColor={colors.success} stopOpacity="0" />
              </SvgLinearGradient>
            </Defs>
            <AnimatedPath
              d={`M 4 60 Q ${w / 2} 2 ${w - 4} 60`}
              stroke="url(#vpnHorizon)"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${arcLen} ${arcLen}`}
              strokeDashoffset={arcDraw.interpolate({ inputRange: [0, 1], outputRange: [arcLen, 0] })}
            />
          </Svg>
        </Animated.View>
      )}

      <View style={styles.stage}>
        {/* ambient glow behind the disc — none while off */}
        {vpn !== 'off' && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: glowOpacity }]}>
            <GlowOrb
              size={300}
              colors={vpn === 'on' ? [colors.success, colors.successStrong] : [colors.primary, colors.primaryStrong]}
              opacity={isDark ? 0.32 : 0.2}
              style={{ top: (STAGE - 300) / 2, left: (STAGE - 300) / 2 }}
            />
          </Animated.View>
        )}

        {/* sonar rings while establishing */}
        {vpn === 'connecting' && <PulseRings size={DISC + 6} color={colors.primary} count={2} duration={2200} />}

        {/* state-tinted hairline at the disc edge — moves with the same clock as the wash */}
        <Animated.View
          pointerEvents="none"
          style={[styles.hairRing, { borderColor: alpha(colors.primary, 0.45), opacity: washConnecting }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.hairRing, { borderColor: alpha(colors.success, 0.5), opacity: washOn }]}
        />

        {/* one-time green bloom on connect */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              borderColor: alpha(colors.success, 0.55),
              backgroundColor: alpha(colors.success, 0.12),
              opacity: haloOp,
              transform: [{ scale: haloScale }],
            },
          ]}
        />

        {/* success ring — draws shut via strokeDashoffset, then breathes on a 4s loop */}
        <Animated.View pointerEvents="none" style={[styles.ringWrap, { opacity: washOn }]}>
          <Animated.View style={{ flex: 1, opacity: breathOp, transform: [{ scale: breathScale }] }}>
            <Svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`}>
              <AnimatedCircle
                cx={RING / 2}
                cy={RING / 2}
                r={rr}
                stroke={colors.success}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${RC} ${RC}`}
                strokeDashoffset={ringDraw.interpolate({ inputRange: [0, 1], outputRange: [RC, 0] })}
                rotation={-90}
                originX={RING / 2}
                originY={RING / 2}
              />
            </Svg>
          </Animated.View>
        </Animated.View>

        {/* the disc itself — never unmounts, only its weather changes */}
        <EmbossedDisc size={DISC}>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(90,100,110,0.12)', opacity: discDim },
            ]}
          />
          <Animated.View style={{ transform: [{ scale: lockScale }] }}>
            <StateSwap stateKey={vpn}>
              <Lock size={54} color={lockColor} strokeWidth={1.7} />
            </StateSwap>
          </Animated.View>
        </EmbossedDisc>

        {/* two primary dots orbiting on a tilted ellipse while establishing */}
        <Animated.View
          pointerEvents="none"
          style={[styles.orbit, { opacity: washConnecting, transform: [{ rotate: '-16deg' }, { scaleY: 0.42 }] }]}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: orbitSpin }] }]}>
            <View style={[styles.orbitDot, { backgroundColor: colors.primary, top: ORBIT / 2 - 4, left: -3 }]} />
            <View style={[styles.orbitDotSm, { backgroundColor: colors.primaryStrong, top: ORBIT / 2 - 3, right: -2 }]} />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

/** 270° arc spinner orbiting inside the CTA while establishing. */
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
  body: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 16 },

  hero: { alignItems: 'center', paddingTop: 46 },
  horizon: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  stage: { width: STAGE, height: STAGE, alignItems: 'center', justifyContent: 'center' },
  hairRing: {
    position: 'absolute',
    top: (STAGE - (DISC + 12)) / 2,
    left: (STAGE - (DISC + 12)) / 2,
    width: DISC + 12,
    height: DISC + 12,
    borderRadius: (DISC + 12) / 2,
    borderWidth: 1,
  },
  halo: {
    position: 'absolute',
    top: (STAGE - 200) / 2,
    left: (STAGE - 200) / 2,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  ringWrap: { position: 'absolute', top: (STAGE - RING) / 2, left: (STAGE - RING) / 2, width: RING, height: RING },
  orbit: { position: 'absolute', top: (STAGE - ORBIT) / 2, left: (STAGE - ORBIT) / 2, width: ORBIT, height: ORBIT },
  orbitDot: { position: 'absolute', width: 9, height: 9, borderRadius: 5 },
  orbitDotSm: { position: 'absolute', width: 7, height: 7, borderRadius: 4 },

  pillWrap: { alignItems: 'center', marginTop: 14 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  receipt: { fontFamily: MONO, fontSize: 10, letterSpacing: 0.8, textAlign: 'center', marginTop: 14 },
  micro: { fontSize: 10.5, letterSpacing: 1.1, marginTop: 5 },
  sectionLabel: { marginTop: 26, marginLeft: 2 },

  stats: { flexDirection: 'row', gap: 10, marginTop: 22 },
  stat: { borderWidth: 1, borderRadius: 14, alignItems: 'center', paddingVertical: 13, paddingHorizontal: 4 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 6 },

  gwRow: { flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 13, marginTop: 12 },
  note: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', borderRadius: 14, padding: 14, marginTop: 12 },
  noteText: { fontSize: 12, lineHeight: 17, flex: 1 },

  xray: { borderWidth: 1, borderRadius: 16, marginTop: 12, overflow: 'hidden' },
  xrayHead: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 15, paddingVertical: 13 },
  xrayBody: { fontSize: 12.5, lineHeight: 18, paddingHorizontal: 15, paddingBottom: 14, paddingTop: 1 },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  cta: { height: 54, borderRadius: 16, overflow: 'hidden' },
  ctaRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  sheetBody: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 28 },
  sheetCopy: { fontSize: 13.5, lineHeight: 20, marginTop: 12 },
  sheetBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
});
