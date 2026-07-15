import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ChevronUp, Eye, Lock, Power, Server, Smartphone } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { ScreenHeader } from '../../components/ScreenHeader';
import { BottomSheet } from '../../components/BottomSheet';
import { CountUp, Entrance, Float3D, GlowOrb, PressableScale, StateSwap } from '../../components/Motion';
import { EmbossedDisc, GlassChip, GlassPill } from '../../components/Glass';
import { TypingDots } from '../../components/Animations';
import { MONO } from '../../theme/typography';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { useAppStore, ORG_NAME } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Vpn'>;
type VpnState = 'off' | 'connecting' | 'on';

const AnimatedPath: any = Animated.createAnimatedComponent(Path);

const NODE = 62; // device / gateway endpoint nodes
const SEAL = 66; // central lock seal
const H = 180; // hero stage height
const CY = 84; // vertical center of the conduit + nodes
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
 *  Hero — a floating 3D connectivity scene: this device wired to the
 *  office gateway through a secure conduit, sealed by a lock at the
 *  midpoint. Endpoints always visible; the connection comes alive:
 *  off = dim inactive pipe · connecting = pipe lights + energy flows
 *  device→gateway · on = lit conduit, sealed lock, breathing pulse.
 *  The whole scene floats with a gentle 3D wobble.
 * ------------------------------------------------------------------ */
function TunnelHero({ vpn, world }: { vpn: VpnState; world: Animated.Value }) {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);

  const lockPop = useRef(new Animated.Value(1)).current; // 0 -> spring 1 (overshoots)
  const halo = useRef(new Animated.Value(0)).current; // one-shot bloom on connect
  const lit = useRef(new Animated.Value(vpn === 'on' ? 1 : 0)).current; // conduit draw device->gateway
  const breath = useRef(new Animated.Value(0)).current; // breathing loop when on
  const prev = useRef(vpn);

  const active = vpn === 'connecting' || vpn === 'on';

  // conduit draw + success beat as the tunnel establishes / drops
  useEffect(() => {
    const was = prev.current;
    prev.current = vpn;
    if (vpn === 'off') {
      Animated.timing(lit, { toValue: 0, duration: reduced ? 0 : 300, easing: Easing.in(Easing.cubic), useNativeDriver: false }).start();
      return;
    }
    if (vpn === 'connecting') {
      lit.setValue(0);
      Animated.timing(lit, { toValue: 1, duration: reduced ? 0 : 750, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
      return;
    }
    // on
    lit.setValue(1);
    if (was === 'connecting' && !reduced) {
      haptics.success();
      lockPop.setValue(0);
      Animated.spring(lockPop, { toValue: 1, damping: 9, stiffness: 260, mass: 0.7, useNativeDriver: true }).start();
      halo.setValue(0);
      Animated.timing(halo, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vpn, reduced]);

  // gentle breathing on the seal — on only, no-ops under reduced motion
  useEffect(() => {
    if (vpn !== 'on' || reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
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

  const breathY = breath.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const lockScale = lockPop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.4] });
  const haloOp = halo.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 0.5, 0] });

  const x1 = 40; // device node center x
  const x2 = w - 40; // gateway node center x
  const pipeLen = Math.max(x2 - x1, 1);
  const lockColor = vpn === 'on' ? colors.success : vpn === 'connecting' ? colors.primary : colors.muted;
  const endIcon = colors.text3;
  const pipeD = `M ${x1} ${CY} L ${x2} ${CY}`;

  return (
    <View style={styles.hero} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {/* ambient glow behind — tinted by state, none while off */}
      {w > 0 && vpn !== 'off' && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: glowOpacity, alignItems: 'center', justifyContent: 'center' }]}>
          <GlowOrb
            size={260}
            colors={vpn === 'on' ? [colors.success, colors.successStrong] : [colors.primary, colors.primaryStrong]}
            opacity={isDark ? 0.3 : 0.18}
            style={{ top: (H - 260) / 2, left: (w - 260) / 2 }}
          />
        </Animated.View>
      )}

      {w > 0 && (
        <Float3D rotate={4} float={5} duration={4200} style={{ width: w, height: H }}>
          {/* base conduit track — the pipe is always there, just inactive when off */}
          <Svg width={w} height={H} style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgLinearGradient id="pipePri" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.primary} stopOpacity="0.45" />
                <Stop offset="1" stopColor={colors.primaryStrong} stopOpacity="1" />
              </SvgLinearGradient>
              <SvgLinearGradient id="pipeOk" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.success} stopOpacity="0.5" />
                <Stop offset="1" stopColor={colors.successStrong} stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <Path d={pipeD} stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} strokeWidth={8} strokeLinecap="round" fill="none" />
          </Svg>

          {/* lit conduit — two colour worlds cross-fading on the world clock,
              both drawn device→gateway via strokeDashoffset as it connects */}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: washConnecting }]}>
            <Svg width={w} height={H}>
              <AnimatedPath
                d={pipeD}
                stroke="url(#pipePri)"
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${pipeLen} ${pipeLen}`}
                strokeDashoffset={lit.interpolate({ inputRange: [0, 1], outputRange: [pipeLen, 0] })}
              />
            </Svg>
          </Animated.View>
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: washOn }]}>
            <Svg width={w} height={H}>
              <AnimatedPath
                d={pipeD}
                stroke="url(#pipeOk)"
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${pipeLen} ${pipeLen}`}
                strokeDashoffset={lit.interpolate({ inputRange: [0, 1], outputRange: [pipeLen, 0] })}
              />
            </Svg>
          </Animated.View>

          {/* energy travelling device → gateway while the tunnel is live */}
          <EnergyDots fromX={x1} toX={x2} y={CY} color={vpn === 'on' ? colors.successStrong : colors.primary} active={active} />

          {/* endpoints — this device (left) and the office gateway (right) */}
          <View style={{ position: 'absolute', left: x1 - NODE / 2, top: CY - NODE / 2 }}>
            <Node3D tilt="-15deg">
              <Smartphone size={24} color={endIcon} strokeWidth={1.8} />
            </Node3D>
          </View>
          <AppText style={[styles.nodeCap, { left: x1 - NODE / 2, width: NODE, color: colors.muted2 }]}>YOU</AppText>

          <View style={{ position: 'absolute', left: x2 - NODE / 2, top: CY - NODE / 2 }}>
            <Node3D tilt="15deg">
              <Server size={23} color={endIcon} strokeWidth={1.8} />
            </Node3D>
          </View>
          <AppText style={[styles.nodeCap, { left: x2 - NODE / 2, width: NODE, color: colors.muted2 }]}>OFFICE</AppText>

          {/* the seal — floats forward on the conduit midpoint, sealed on connect */}
          <Animated.View
            style={{ position: 'absolute', left: w / 2 - SEAL / 2, top: CY - SEAL / 2, transform: [{ scale: lockScale }, { translateY: breathY }] }}
          >
            <Animated.View
              pointerEvents="none"
              style={[styles.lockHalo, { borderColor: alpha(colors.success, 0.55), backgroundColor: alpha(colors.success, 0.12), opacity: haloOp, transform: [{ scale: haloScale }] }]}
            />
            <EmbossedDisc size={SEAL} style={styles.sealShadow}>
              <StateSwap stateKey={vpn}>
                <Lock size={26} color={lockColor} strokeWidth={2} />
              </StateSwap>
            </EmbossedDisc>
          </Animated.View>
        </Float3D>
      )}
    </View>
  );
}

/** A 3D-tilted embossed endpoint node (device / gateway). */
function Node3D({ tilt, children }: { tilt: string; children: React.ReactNode }) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.node,
        {
          backgroundColor: isDark ? '#1B222B' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          shadowColor: isDark ? '#000' : 'rgba(20,24,30,0.5)',
          transform: [{ perspective: 700 }, { rotateY: tilt }],
        },
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.9)', 'transparent'] as const}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'] as const}
        start={{ x: 0.5, y: 0.55 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

/** Small glowing pulses travelling along the conduit while the tunnel is live. */
function EnergyDots({ fromX, toX, y, color, active }: { fromX: number; toX: number; y: number; color: string; active: boolean }) {
  const reduced = useReducedMotion();
  const COUNT = 3;
  const dots = useRef(Array.from({ length: COUNT }, () => new Animated.Value(0))).current;
  useEffect(() => {
    if (!active || reduced) {
      dots.forEach((v) => v.setValue(0));
      return;
    }
    const loops = dots.map((v, i) => {
      v.setValue(0);
      return Animated.loop(
        Animated.sequence([
          Animated.delay((i * 1500) / COUNT),
          Animated.timing(v, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true }),
        ]),
      );
    });
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced, fromX, toX]);
  if (!active) return null;
  return (
    <>
      {dots.map((v, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: y - 4,
            left: 0,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.9,
            shadowRadius: 6,
            opacity: v.interpolate({ inputRange: [0, 0.12, 0.85, 1], outputRange: [0, 1, 1, 0] }),
            transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [fromX - 4, toX - 4] }) }],
          }}
        />
      ))}
    </>
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

  hero: { alignItems: 'center', paddingTop: 30 },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  nodeCap: { position: 'absolute', top: CY + NODE / 2 + 9, fontFamily: MONO, fontSize: 8.5, letterSpacing: 1.2, textAlign: 'center' },
  lockHalo: { position: 'absolute', top: (SEAL - 128) / 2, left: (SEAL - 128) / 2, width: 128, height: 128, borderRadius: 64, borderWidth: 2 },
  sealShadow: { shadowColor: 'rgba(0,0,0,0.5)', shadowOpacity: 1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 12 },

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
