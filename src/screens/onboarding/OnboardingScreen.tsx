import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  Animated,
  Easing,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { Building2, Check, EyeOff, Lock, Smartphone, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { Entrance, Float3D, GlowOrb, Shimmer } from '../../components/Motion';
import { GlassChip, GlassPill } from '../../components/Glass';
import { FloatBadge } from '../../components/Animations';
import { MONO } from '../../theme/typography';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

// Onboarding is an always-dark, full-bleed hero moment (independent of the
// in-app theme) — one floating object per slide over a gradient void, with
// two-speed parallax as the carousel drags. Premium first impression.
const DARK = '#0B0D13';

const SLIDES = [
  {
    art: 'split',
    accent: 'primary',
    eyebrow: 'SEALED BY DESIGN',
    title: 'Your work, sealed off from personal.',
    body: 'Enroll once. Then connect, install what IT needs, and see exactly what your company can and can’t see.',
    alt: 'A floating device with work apps sealed behind a lock, personal apps kept separate',
  },
  {
    art: 'tunnel',
    accent: 'info',
    eyebrow: 'THE SECURE TUNNEL',
    title: 'One tap to reach work.',
    body: 'The secure tunnel brings work apps, files and internal sites to you — its status is always glanceable.',
    alt: 'A glass tunnel carrying a pulse of light from a phone to a work building',
  },
  {
    art: 'eye',
    accent: 'success',
    eyebrow: 'WHAT IT CAN SEE',
    title: 'You decide what’s shared.',
    body: 'A one-tap ledger shows what your company can and can’t see. Personal data stays personal — always.',
    alt: 'A levitating phone being scanned, with labels reading IT sees work, and Personal — never',
  },
] as const;

type SlideDef = (typeof SLIDES)[number];

export function OnboardingScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const viewing = navigation.canGoBack();

  const start = () => (viewing ? navigation.goBack() : navigation.replace('Enroll'));

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const p = Math.max(0, Math.min(SLIDES.length - 1, Math.round(e.nativeEvent.contentOffset.x / width)));
      setPage((prev) => (prev === p ? prev : p));
    },
  });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: DARK }]} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      {/* Vertical gradient void — darker at the bottom reads as the floor. */}
      <LinearGradient
        pointerEvents="none"
        colors={['#13161E', '#0B0D13', '#060709']}
        style={StyleSheet.absoluteFill}
      />
      <ContourTexture />

      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('../../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          <AppText variant="display" color="#FFFFFF" style={{ fontSize: 14, letterSpacing: -0.2 }}>
            UEM <AppText variant="display" color={colors.primary} style={{ fontSize: 14 }}>Companion</AppText>
          </AppText>
        </View>
        {viewing ? (
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={styles.close}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={15} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => navigation.replace('Enroll')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Skip introduction"
          >
            <AppText variant="bodySemibold" color="rgba(255,255,255,0.55)" style={{ fontSize: 13 }}>
              Skip
            </AppText>
          </Pressable>
        )}
      </View>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        style={styles.pager}
      >
        {SLIDES.map((s, i) => (
          <Slide key={s.title} slide={s} index={i} width={width} scrollX={scrollX} active={page === i} />
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <PageDots scrollX={scrollX} width={width} count={SLIDES.length} page={page} color={colors.primary} />
        <Button label={viewing ? 'Back to sign up' : 'Get started'} onPress={start} />
        {!viewing ? (
          <Pressable
            onPress={() => navigation.replace('Enroll')}
            hitSlop={8}
            style={{ alignSelf: 'center', marginTop: 14 }}
            accessibilityRole="button"
            accessibilityLabel="Already enrolled? Sign in"
          >
            <AppText variant="body" color="rgba(255,255,255,0.55)" style={{ fontSize: 13 }}>
              Already enrolled? <AppText variant="bodySemibold" color="#FFFFFF">Sign in</AppText>
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ *
 *  Slide — two-speed parallax: the hero translates at ~0.5x of the
 *  drag, its glow at ~0.85x, and the hero tilts (rotateY) toward the
 *  drag direction while between pages. Copy staggers in on arrival.
 * ------------------------------------------------------------------ */
function Slide({
  slide,
  index,
  width,
  scrollX,
  active,
}: {
  slide: SlideDef;
  index: number;
  width: number;
  scrollX: Animated.Value;
  active: boolean;
}) {
  const { colors } = useTheme();
  const accent = colors[slide.accent];
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  // Slide content moves at 1x with the scroll; counter-translating by half
  // the page width nets out to the hero moving at ~0.5x of the drag.
  const heroShift = scrollX.interpolate({ inputRange, outputRange: [-width * 0.5, 0, width * 0.5], extrapolate: 'clamp' });
  // Glow counter-translates less — it travels at ~0.85x (nearer the page).
  const glowShift = scrollX.interpolate({ inputRange, outputRange: [-width * 0.15, 0, width * 0.15], extrapolate: 'clamp' });
  const tilt = scrollX.interpolate({ inputRange, outputRange: ['6deg', '0deg', '-6deg'], extrapolate: 'clamp' });

  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.stage}>
        <Animated.View pointerEvents="none" style={[styles.glowLayer, { transform: [{ translateX: glowShift }] }]}>
          <GlowOrb size={300} colors={[accent, colors.primary]} opacity={0.4} style={{ top: 0, left: 0 }} />
        </Animated.View>
        <Animated.View
          accessible
          accessibilityRole="image"
          accessibilityLabel={slide.alt}
          style={[styles.heroWrap, { transform: [{ perspective: 1000 }, { translateX: heroShift }, { rotateY: tilt }] }]}
        >
          <ContactShadow bottom={slide.art === 'tunnel' ? 56 : 2} />
          <Float3D rotate={3} float={7} duration={4400}>
            {slide.art === 'split' ? <SplitDeviceHero /> : slide.art === 'tunnel' ? <TunnelHero /> : <LedgerHero />}
          </Float3D>
        </Animated.View>
      </View>
      <SlideCopy slide={slide} active={active} />
    </View>
  );
}

/** Eyebrow + headline + body — staggers in when the page becomes active. */
function SlideCopy({ slide, active }: { slide: SlideDef; active: boolean }) {
  const nodes = [
    <AppText key="eyebrow" variant="bodySemibold" color="rgba(255,255,255,0.48)" style={styles.eyebrow}>
      {slide.eyebrow}
    </AppText>,
    <AppText key="title" variant="display" color="#FFFFFF" style={styles.title}>
      {slide.title}
    </AppText>,
    <AppText key="body" variant="body" color="rgba(255,255,255,0.6)" style={styles.subtitle}>
      {slide.body}
    </AppText>,
  ];
  if (!active) return <View style={styles.copy}>{nodes}</View>;
  return (
    <View style={styles.copy}>
      {nodes.map((node, i) => (
        <Entrance key={i} delay={80 + i * 75} from={12}>
          {node}
        </Entrance>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero 1 — the split device, elevated: slight rotateX base for
 *  perspective depth, a floating primary-glow lock badge hovering on
 *  its own cycle over the divider gap.
 * ------------------------------------------------------------------ */
function SplitDeviceHero() {
  const { colors } = useTheme();
  return (
    <View style={{ transform: [{ perspective: 800 }, { rotateX: '7deg' }] }}>
      <View style={styles.device}>
        <View style={styles.zone}>
          <View style={styles.zoneLabel}>
            <View style={[styles.zoneDot, { backgroundColor: colors.primary }]} />
            <AppText variant="bodyBold" color={colors.primary} style={styles.zoneText}>WORK</AppText>
          </View>
          <View style={styles.tiles}>
            <View style={[styles.tile, { backgroundColor: colors.primary }]} />
            <View style={[styles.tile, { backgroundColor: colors.primary, opacity: 0.22 }]} />
            <View style={[styles.tile, { backgroundColor: colors.primary, opacity: 0.22 }]} />
          </View>
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <View style={styles.line} />
        </View>

        <View style={styles.zone}>
          <View style={styles.zoneLabel}>
            <View style={styles.zoneDotN} />
            <AppText variant="bodyBold" color="#8A9098" style={styles.zoneText}>PERSONAL</AppText>
          </View>
          <View style={styles.tiles}>
            <View style={styles.tileN} />
            <View style={styles.tileN} />
            <View style={styles.tileN} />
          </View>
        </View>
      </View>

      {/* The seal — hovers on its own float cycle above the divider. */}
      <Float3D rotate={2.5} float={5} duration={3000} style={styles.lockFloat}>
        <View style={[styles.lockHalo, { backgroundColor: colors.primary }]} />
        <View style={[styles.lockBadge, { backgroundColor: colors.primary, shadowColor: colors.primaryStrong }]}>
          <Lock size={15} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      </Float3D>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero 2 — the tunnel: a glass tube of stacked translucent layers
 *  connecting a phone node to a work building node, with a light
 *  pulse traveling through it on a loop.
 * ------------------------------------------------------------------ */
const TUBE_W = 150;

function TunnelHero() {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(380),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const pulseX = pulse.interpolate({ inputRange: [0, 1], outputRange: [4, TUBE_W - 24] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 0.12, 0.88, 1], outputRange: [0, 1, 1, 0] });

  return (
    <View style={styles.tunnelRow}>
      <View style={styles.nodeCol}>
        <GlassChip size={54} radius={18} on="dark">
          <Smartphone size={23} color="#FFFFFF" strokeWidth={1.8} />
        </GlassChip>
        <AppText color="rgba(255,255,255,0.42)" style={styles.nodeCaption}>PHONE</AppText>
      </View>

      <View style={styles.tube}>
        <View style={styles.tubeOuter} />
        <View style={styles.tubeMid} />
        <View style={styles.tubeInner} />
        <View style={styles.tubeHighlight} />
        <Animated.View style={[styles.pulseWrap, { opacity: pulseOpacity, transform: [{ translateX: pulseX }] }]}>
          <View style={[styles.pulseHalo, { backgroundColor: colors.primary }]} />
          <LinearGradient
            colors={['#FFFFFF', colors.primary]}
            start={{ x: 0.2, y: 0.2 }}
            end={{ x: 0.9, y: 0.9 }}
            style={styles.pulseDot}
          />
        </Animated.View>
      </View>

      <View style={styles.nodeCol}>
        <GlassChip size={54} radius={18} on="dark">
          <Building2 size={23} color="#FFFFFF" strokeWidth={1.8} />
        </GlassChip>
        <AppText color="rgba(255,255,255,0.42)" style={styles.nodeCaption}>WORK</AppText>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero 3 — the ledger: a levitating phone silhouette with a scan
 *  line sweeping across it, and two glass chips parallax-floating at
 *  different phases: what IT sees, and what it never sees.
 * ------------------------------------------------------------------ */
function LedgerHero() {
  const { colors } = useTheme();
  return (
    <View style={styles.ledgerWrap}>
      <View style={styles.phone}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneTileRow}>
          <View style={styles.phoneTile} />
          <View style={styles.phoneTile} />
        </View>
        <View style={styles.phoneTileRow}>
          <View style={styles.phoneTile} />
          <View style={styles.phoneTile} />
        </View>
        <View style={[styles.phoneLine, { width: '82%' }]} />
        <View style={[styles.phoneLine, { width: '60%' }]} />
        <View style={[styles.phoneLine, { width: '70%' }]} />
        <Shimmer width={64} duration={2600} color="rgba(255,255,255,0.13)" angle={14} />
      </View>

      <FloatBadge delay={0} style={styles.pillLeft}>
        <GlassPill on="dark">
          <Check size={12} color={colors.primary} strokeWidth={2.6} />
          <AppText variant="bodySemibold" color="#FFFFFF" style={styles.pillText}>IT sees work</AppText>
        </GlassPill>
      </FloatBadge>
      <FloatBadge delay={900} style={styles.pillRight}>
        <GlassPill on="dark" tint={colors.success}>
          <EyeOff size={12} color={colors.success} strokeWidth={2.2} />
          <AppText variant="bodySemibold" color="#FFFFFF" style={styles.pillText}>Personal — never</AppText>
        </GlassPill>
      </FloatBadge>
    </View>
  );
}

/** Dark elliptical contact shadow beneath each hero — levitation. */
function ContactShadow({ bottom = 2 }: { bottom?: number }) {
  return (
    <View pointerEvents="none" style={[styles.contactShadow, { bottom }]}>
      <Svg width={170} height={30} viewBox="0 0 170 30">
        <Ellipse cx="85" cy="15" rx="82" ry="12" fill="rgba(0,0,0,0.22)" />
        <Ellipse cx="85" cy="15" rx="62" ry="9" fill="rgba(0,0,0,0.3)" />
        <Ellipse cx="85" cy="15" rx="40" ry="6" fill="rgba(0,0,0,0.38)" />
      </Svg>
    </View>
  );
}

/** A few 1px contour arcs at ~4% white — dark-on-dark velvet texture. */
function ContourTexture() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 780" preserveAspectRatio="xMidYMid slice">
        <Path d="M-30 200 Q195 118 420 200" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
        <Path d="M-30 252 Q195 162 420 252" stroke="rgba(255,255,255,0.035)" strokeWidth="1" fill="none" />
        <Circle cx="195" cy="410" r="150" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
        <Circle cx="195" cy="410" r="216" stroke="rgba(255,255,255,0.028)" strokeWidth="1" fill="none" />
        <Path d="M-30 648 Q195 566 420 648" stroke="rgba(255,255,255,0.035)" strokeWidth="1" fill="none" />
      </Svg>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 *  Page indicator — dot morphs into the active pill via crossfade +
 *  scaleX on a fixed-width bar (never animating raw width), driven
 *  continuously by the scroll position.
 * ------------------------------------------------------------------ */
function PageDots({
  scrollX,
  width,
  count,
  page,
  color,
}: {
  scrollX: Animated.Value;
  width: number;
  count: number;
  page: number;
  color: string;
}) {
  return (
    <View
      style={styles.dots}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Slide ${page + 1} of ${count}`}
      accessibilityValue={{ now: page + 1, min: 1, max: count }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const pillOpacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });
        const pillScaleX = scrollX.interpolate({ inputRange, outputRange: [0.27, 1, 0.27], extrapolate: 'clamp' });
        const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.9, 0, 0.9], extrapolate: 'clamp' });
        return (
          <View key={i} style={styles.dotSlot}>
            <Animated.View style={[styles.dotIdle, { opacity: dotOpacity }]} />
            <Animated.View
              style={[styles.dotPill, { backgroundColor: color, opacity: pillOpacity, transform: [{ scaleX: pillScaleX }] }]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 28, height: 28 },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.09)' },
  pager: { flex: 1 },
  slide: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },

  stage: { height: 308, alignItems: 'center', justifyContent: 'center' },
  glowLayer: { position: 'absolute', width: 300, height: 300, top: -4, alignSelf: 'center' },
  heroWrap: { width: 300, height: 288, alignItems: 'center', justifyContent: 'center' },
  contactShadow: { position: 'absolute' },

  /* Hero 1 — split device */
  device: {
    width: 196, borderRadius: 28, backgroundColor: '#FFFFFF', padding: 16,
    shadowColor: 'rgba(0,0,0,0.45)', shadowOpacity: 1, shadowRadius: 44, shadowOffset: { width: 0, height: 20 }, elevation: 14,
  },
  zone: { gap: 9 },
  zoneLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  zoneDot: { width: 6, height: 6, borderRadius: 3 },
  zoneDotN: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C9CCD1' },
  zoneText: { fontSize: 10, letterSpacing: 0.8 },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, height: 44, borderRadius: 12 },
  tileN: { flex: 1, height: 44, borderRadius: 12, backgroundColor: '#EDEFF2' },
  divider: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 46 },
  line: { flex: 1, height: 1.5, borderRadius: 1, backgroundColor: '#E2E4E8' },
  lockFloat: { position: 'absolute', top: 77, left: 0, right: 0, alignItems: 'center' },
  lockHalo: { position: 'absolute', top: -11, width: 58, height: 58, borderRadius: 29, opacity: 0.22 },
  lockBadge: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.55, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 9,
  },

  /* Hero 2 — glass tunnel */
  tunnelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, transform: [{ rotate: '-4deg' }] },
  nodeCol: { alignItems: 'center', gap: 7 },
  nodeCaption: { fontFamily: MONO, fontSize: 9, letterSpacing: 1.1 },
  tube: { width: TUBE_W, height: 44, marginTop: 5, justifyContent: 'center' },
  tubeOuter: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  tubeMid: {
    position: 'absolute', top: 7, bottom: 7, left: 3, right: 3, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  tubeInner: {
    position: 'absolute', top: 14, bottom: 14, left: 6, right: 6, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tubeHighlight: { position: 'absolute', top: 3, left: 16, right: 16, height: 1, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.14)' },
  pulseWrap: { position: 'absolute', left: 0, top: 13, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  pulseHalo: { position: 'absolute', width: 34, height: 34, borderRadius: 17, opacity: 0.3 },
  pulseDot: { width: 12, height: 12, borderRadius: 6 },

  /* Hero 3 — visibility ledger */
  ledgerWrap: { width: 280, alignItems: 'center' },
  phone: {
    width: 116, height: 212, borderRadius: 26, backgroundColor: '#151A22',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', overflow: 'hidden',
    paddingHorizontal: 12, paddingTop: 10, gap: 8,
  },
  phoneNotch: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.14)', marginBottom: 6 },
  phoneTileRow: { flexDirection: 'row', gap: 8 },
  phoneTile: { flex: 1, height: 30, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.07)' },
  phoneLine: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)' },
  pillLeft: { position: 'absolute', left: 4, top: 44 },
  pillRight: { position: 'absolute', right: 0, bottom: 56 },
  pillText: { fontSize: 11 },

  /* Copy */
  copy: { paddingHorizontal: 4, paddingTop: 24, alignItems: 'center' },
  eyebrow: { fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 25, textAlign: 'center', marginBottom: 10, lineHeight: 31, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },

  /* Footer */
  footer: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: Platform.OS === 'ios' ? 14 : 22, gap: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dotSlot: { width: 22, height: 6, alignItems: 'center', justifyContent: 'center' },
  dotIdle: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotPill: { position: 'absolute', width: 22, height: 6, borderRadius: 3 },
});
