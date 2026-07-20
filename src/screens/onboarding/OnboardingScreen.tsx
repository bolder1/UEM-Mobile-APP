import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { Lock, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { Entrance } from '../../components/Motion';
import { ORG_NAME } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { space, layout, touch } from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

// A single, full-bleed dark welcome — one floating hero (work sealed off from
// personal) over a gradient void. No carousel, no sign-in: just the story and
// one way forward. Always dark, independent of the in-app theme.
//
// This screen is brand-owned art: DARK, the gradient, the contour arcs and the
// white device's palette are hand-tuned for a surface that never follows the
// in-app theme, so they stay as literals. Spacing, type and touch targets are
// the design system's, same as everywhere else.
const DARK = '#0B0D13';
const CLOSE = 30;

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
          {/* The wordmark right next to it already says "UEM Companion" — an
              announced logo would just say it twice. */}
          <Image
            source={require('../../../assets/logo-mark.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <AppText variant="display" size="body" color="#FFFFFF" style={{ letterSpacing: -0.2 }}>
            UEM <AppText variant="display" size="body" color={colors.primary}>Companion</AppText>
          </AppText>
        </View>
        {viewing ? (
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={touch.slopFor(CLOSE)}
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
            <View accessible accessibilityRole="image" accessibilityLabel="A device with work apps sealed behind a lock, personal apps kept separate" style={styles.heroWrap}>
              <ContactShadow />
              <SplitDeviceHero />
            </View>
          </View>
        </Entrance>

        {/* The old copy never said what the app DOES to your phone — it opened on
            a slogan and then listed three unrelated features. On a BYOD device the
            only question that matters is "what will my employer see?", so answer
            that: what gets added, who controls it, and where their reach stops.
            The two halves of the title map to the two halves of the illustration. */}
        <View style={styles.copy}>
          <Entrance delay={140} from={12}>
            <AppText variant="bodySemibold" size="micro" color="rgba(255,255,255,0.48)" style={styles.eyebrow}>
              Work profile · your device
            </AppText>
          </Entrance>
          <Entrance delay={210} from={12}>
            <AppText variant="display" size="display" color="#FFFFFF" accessibilityRole="header" style={styles.title}>
              Work stays work.{'\n'}Personal stays yours.
            </AppText>
          </Entrance>
          <Entrance delay={280} from={12}>
            <AppText variant="body" size="body" color="rgba(255,255,255,0.6)" style={styles.subtitle}>
              Enrolling adds a separate work profile to this phone. {ORG_NAME} IT manages what’s inside it — and
              can’t see the apps, photos or messages outside it.
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
    <View style={styles.device}>
      <View style={styles.zone}>
        <View style={styles.zoneLabel}>
          <View style={[styles.zoneDot, { backgroundColor: colors.primary }]} />
          <AppText variant="bodyBold" size="micro" color={colors.primary} style={styles.zoneText}>WORK</AppText>
        </View>
        <View style={styles.tiles}>
          <View style={[styles.tile, { backgroundColor: colors.primary }]} />
          <View style={[styles.tile, { backgroundColor: colors.primary, opacity: 0.28 }]} />
          <View style={[styles.tile, { backgroundColor: colors.primary, opacity: 0.16 }]} />
        </View>
      </View>

      {/* The seal sits ON the divider and the rule stops either side of it, so
          the lock reads as what separates the two halves rather than a sticker
          hovering over them. Laid out inline — no absolute offsets to drift. */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <View style={[styles.lockBadge, { backgroundColor: colors.primary }]}>
          <Lock size={14} color="#FFFFFF" strokeWidth={2.4} />
        </View>
        <View style={styles.line} />
      </View>

      <View style={styles.zone}>
        <View style={styles.zoneLabel}>
          <View style={styles.zoneDotN} />
          <AppText variant="bodyBold" size="micro" color="#8A9098" style={styles.zoneText}>PERSONAL</AppText>
        </View>
        <View style={styles.tiles}>
          <View style={styles.tileN} />
          <View style={styles.tileN} />
          <View style={styles.tileN} />
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    paddingTop: layout.screenTop,
    paddingBottom: space[1],
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: layout.rowGap },
  logo: { width: 28, height: 28 },
  close: { width: CLOSE, height: CLOSE, borderRadius: CLOSE / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.09)' },

  center: { flex: 1, justifyContent: 'center', paddingHorizontal: layout.gutter },
  stage: { height: 300, alignItems: 'center', justifyContent: 'center' },
  heroWrap: { width: 300, height: 288, alignItems: 'center', justifyContent: 'center' },
  contactShadow: { position: 'absolute', bottom: 2 },

  device: {
    width: 196, borderRadius: 28, backgroundColor: '#FFFFFF', padding: layout.cardPad,
    shadowColor: 'rgba(0,0,0,0.45)', shadowOpacity: 1, shadowRadius: 44, shadowOffset: { width: 0, height: 20 }, elevation: 14,
  },
  zone: { gap: layout.labelGap },
  zoneLabel: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  zoneDot: { width: 6, height: 6, borderRadius: 3 },
  zoneDotN: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C9CCD1' },
  zoneText: { letterSpacing: 0.8 },
  tiles: { flexDirection: 'row', gap: space[2] },
  tile: { flex: 1, height: 44, borderRadius: 12 },
  tileN: { flex: 1, height: 44, borderRadius: 12, backgroundColor: '#EDEFF2' },
  divider: { flexDirection: 'row', alignItems: 'center', paddingVertical: space[3], gap: space[3] },
  line: { flex: 1, height: 1.5, borderRadius: 1, backgroundColor: '#E2E4E8' },
  lockBadge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  // Was `paddingHorizontal: 4` inside a 24 container — an effective 28 gutter
  // that existed on this screen alone. The gutter is the container's job.
  copy: { paddingTop: layout.sectionGap, alignItems: 'center' },
  eyebrow: { letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'center', marginBottom: layout.labelGap },
  title: { textAlign: 'center', marginBottom: layout.captionGap, letterSpacing: -0.4 },
  subtitle: { textAlign: 'center' },

  footer: { paddingHorizontal: layout.gutter, paddingTop: layout.blockGap, paddingBottom: layout.screenBottom },
});
