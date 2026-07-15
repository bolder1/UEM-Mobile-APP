import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform, Image, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Power, Eye, X, Lock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

// Onboarding is an always-dark, full-bleed hero moment (independent of the
// in-app theme) — a premium first impression that tells the product story.
const DARK = '#101317';

const SLIDES = [
  { art: 'split', accent: 'primary', title: 'Your work, sealed off from personal.', body: 'Enroll once. Then connect, install what IT needs, and see exactly what your company can and can’t see.' },
  { art: 'tunnel', accent: 'info', title: 'One tap to reach work.', body: 'The secure tunnel brings work apps, files and internal sites to you — its status is always glanceable.' },
  { art: 'eye', accent: 'success', title: 'You decide what’s shared.', body: 'A one-tap ledger shows what your company can and can’t see. Personal data stays personal — always.' },
] as const;

export function OnboardingScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const viewing = navigation.canGoBack();

  const start = () => (viewing ? navigation.goBack() : navigation.replace('Enroll'));

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = Math.round(e.nativeEvent.contentOffset.x / width);
    if (p !== page) setPage(p);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: DARK }]} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('../../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          <AppText variant="display" color="#FFFFFF" style={{ fontSize: 14, letterSpacing: -0.2 }}>
            UEM <AppText variant="display" color={colors.primary} style={{ fontSize: 14 }}>Companion</AppText>
          </AppText>
        </View>
        {viewing ? (
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.close}>
            <X size={15} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        ) : (
          <Pressable onPress={() => navigation.replace('Enroll')} hitSlop={8}>
            <AppText variant="bodySemibold" color="rgba(255,255,255,0.55)" style={{ fontSize: 13 }}>
              Skip
            </AppText>
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.pager}
      >
        {SLIDES.map((s) => (
          <View key={s.title} style={[styles.slide, { width }]}>
            <View style={styles.stage}>
              {s.art === 'split' && <DeviceSplitArt />}
              {s.art === 'tunnel' && <GlowTile Icon={Power} color={colors.info} />}
              {s.art === 'eye' && <GlowTile Icon={Eye} color={colors.success} />}
            </View>
            <View style={styles.copy}>
              <AppText variant="display" color="#FFFFFF" style={styles.title}>
                {s.title}
              </AppText>
              <AppText variant="body" color="rgba(255,255,255,0.6)" style={styles.subtitle}>
                {s.body}
              </AppText>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { width: i === page ? 22 : 6, backgroundColor: i === page ? colors.primary : 'rgba(255,255,255,0.22)' }]} />
          ))}
        </View>
        <Button label={viewing ? 'Back to sign up' : 'Get started'} onPress={start} />
        {!viewing ? (
          <Pressable onPress={() => navigation.replace('Enroll')} hitSlop={8} style={{ alignSelf: 'center', marginTop: 14 }}>
            <AppText variant="body" color="rgba(255,255,255,0.55)" style={{ fontSize: 13 }}>
              Already enrolled? <AppText variant="bodySemibold" color="#FFFFFF">Sign in</AppText>
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

/** The hero: a white "device" showing work sealed off from personal. */
function DeviceSplitArt() {
  const { colors } = useTheme();
  return (
    <View style={styles.heroWrap}>
      <View style={[styles.glow, { backgroundColor: colors.primary, opacity: 0.18 }]} />
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
          <View style={[styles.lock, { backgroundColor: colors.primary }]}>
            <Lock size={15} color="#FFFFFF" strokeWidth={2.2} />
          </View>
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
    </View>
  );
}

function GlowTile({ Icon, color }: { Icon: any; color: string }) {
  return (
    <View style={styles.heroWrap}>
      <View style={[styles.glow, { backgroundColor: color, opacity: 0.2 }]} />
      <View style={[styles.bigTile, { backgroundColor: color, shadowColor: color }]}>
        <Icon size={52} color="#FFFFFF" strokeWidth={2} />
      </View>
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
  stage: { height: 300, alignItems: 'center', justifyContent: 'center' },
  heroWrap: { width: 260, height: 270, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130 },
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
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 },
  line: { flex: 1, height: 1.5, borderRadius: 1, backgroundColor: '#E2E4E8' },
  lock: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  bigTile: {
    width: 116, height: 116, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.4, shadowRadius: 32, shadowOffset: { width: 0, height: 14 }, elevation: 8,
  },
  copy: { paddingHorizontal: 4, paddingTop: 24, alignItems: 'center' },
  title: { fontSize: 25, textAlign: 'center', marginBottom: 10, lineHeight: 31, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  footer: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: Platform.OS === 'ios' ? 14 : 22, gap: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 99 },
});
