import React from 'react';
import { View, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { Lock, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { Entrance, Float3D, GlowOrb } from '../../components/Motion';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

// A single, full-bleed dark welcome — one floating hero (work sealed off from
// personal) over a gradient void. No carousel, no sign-in: just the story and
// one way forward. Always dark, independent of the in-app theme.
const DARK = '#0B0D13';

export function OnboardingScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const viewing = navigation.canGoBack();
  const start = () => (viewing ? navigation.goBack() : navigation.replace('Enroll'));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: DARK }]} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      {/* Vertical gradient void — darker at the bottom reads as the floor. */}
      <LinearGradient pointerEvents="none" colors={['#13161E', '#0B0D13', '#060709']} style={StyleSheet.absoluteFill} />
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
        ) : null}
      </View>

      <View style={styles.center}>
        <Entrance delay={40} from={20}>
          <View style={styles.stage}>
            <GlowOrb size={300} colors={[colors.primary, colors.primaryStrong]} opacity={0.4} style={{ top: -6, alignSelf: 'center' }} />
            <View accessible accessibilityRole="image" accessibilityLabel="A device with work apps sealed behind a lock, personal apps kept separate" style={styles.heroWrap}>
              <ContactShadow />
              <Float3D rotate={3} float={7} duration={4400}>
                <SplitDeviceHero />
              </Float3D>
            </View>
          </View>
        </Entrance>

        <View style={styles.copy}>
          <Entrance delay={140} from={12}>
            <AppText variant="bodySemibold" color="rgba(255,255,255,0.48)" style={styles.eyebrow}>
              SEALED BY DESIGN
            </AppText>
          </Entrance>
          <Entrance delay={210} from={12}>
            <AppText variant="display" color="#FFFFFF" style={styles.title}>
              Your work, sealed off from personal.
            </AppText>
          </Entrance>
          <Entrance delay={280} from={12}>
            <AppText variant="body" color="rgba(255,255,255,0.6)" style={styles.subtitle}>
              Enroll once. Then connect, install what IT needs, and see exactly what your company can and can’t see.
            </AppText>
          </Entrance>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label={viewing ? 'Back' : 'Get started'} onPress={start} />
      </View>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ *
 *  The hero — a white device showing work sealed off from personal,
 *  tilted for perspective depth, with a primary-glow lock badge that
 *  hovers over the divider on its own float cycle.
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

/** Dark elliptical contact shadow beneath the hero — levitation. */
function ContactShadow() {
  return (
    <View pointerEvents="none" style={styles.contactShadow}>
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 28, height: 28 },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.09)' },

  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  stage: { height: 300, alignItems: 'center', justifyContent: 'center' },
  heroWrap: { width: 300, height: 288, alignItems: 'center', justifyContent: 'center' },
  contactShadow: { position: 'absolute', bottom: 2 },

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

  copy: { paddingHorizontal: 4, paddingTop: 30, alignItems: 'center' },
  eyebrow: { fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 10, lineHeight: 32, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },

  footer: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: Platform.OS === 'ios' ? 14 : 22 },
});
