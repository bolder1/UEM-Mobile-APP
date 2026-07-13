import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform, Image, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Power, Eye, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { DotGrid } from '../../components/DotGrid';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const SLIDES = [
  { art: 'shield', title: 'Your work, sealed off from personal.', body: 'Enroll once and keep work and personal cleanly apart on this one device.' },
  { art: 'tunnel', title: 'One tap to reach work.', body: 'The secure tunnel brings work apps and files to you — its status is always glanceable.' },
  { art: 'eye', title: 'You decide what’s shared.', body: 'See exactly what your company can and can’t see. Personal data stays personal — always.' },
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
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('../../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          <AppText variant="display" style={{ fontSize: 14, letterSpacing: -0.2 }}>
            UEM <AppText variant="display" color={colors.primary} style={{ fontSize: 14 }}>Companion</AppText>
          </AppText>
        </View>
        {viewing ? (
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={[styles.close, { backgroundColor: colors.surfaceSunken }]}>
            <X size={15} color={colors.text3} strokeWidth={2.4} />
          </Pressable>
        ) : (
          <Pressable onPress={() => navigation.replace('Enroll')} hitSlop={8}>
            <AppText variant="bodySemibold" color={colors.muted} style={{ fontSize: 13 }}>
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
            <View style={[styles.illustration, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <DotGrid color={colors.dot} />
              {s.art === 'shield' && <StepZeroArt />}
              {s.art === 'tunnel' && <StepOneArt />}
              {s.art === 'eye' && <StepTwoArt />}
            </View>
            <View style={styles.copy}>
              <AppText variant="display" style={styles.title}>
                {s.title}
              </AppText>
              <AppText variant="body" color={colors.text3} style={styles.subtitle}>
                {s.body}
              </AppText>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { width: i === page ? 22 : 6, backgroundColor: i === page ? colors.primary : colors.dotInactive }]} />
          ))}
        </View>
        <Button label={viewing ? 'Back to sign up' : 'Get started'} onPress={start} />
        {!viewing ? (
          <Pressable onPress={() => navigation.replace('Enroll')} hitSlop={8} style={{ alignSelf: 'center', marginTop: 14 }}>
            <AppText variant="body" color={colors.muted} style={{ fontSize: 13 }}>
              Already enrolled? <AppText variant="bodySemibold" color={colors.text}>Sign in</AppText>
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function StepZeroArt() {
  const { colors } = useTheme();
  return (
    <View style={[styles.iconOuter, { backgroundColor: colors.primaryTint }]}>
      <View style={[styles.iconInner, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
        <Shield size={44} color="#FFFFFF" strokeWidth={2} />
      </View>
    </View>
  );
}

function StepOneArt() {
  const { colors } = useTheme();
  return (
    <View style={[styles.iconOuter, { backgroundColor: colors.infoTint }]}>
      <View style={[styles.iconInner, { backgroundColor: colors.info, shadowColor: colors.info }]}>
        <Power size={44} color="#FFFFFF" strokeWidth={2} />
      </View>
    </View>
  );
}

function StepTwoArt() {
  const { colors } = useTheme();
  return (
    <View style={[styles.iconOuter, { backgroundColor: colors.successTint }]}>
      <View style={[styles.iconInner, { backgroundColor: colors.success, shadowColor: colors.success }]}>
        <Eye size={44} color="#FFFFFF" strokeWidth={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 28, height: 28 },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pager: { flex: 1 },
  slide: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  illustration: { height: 300, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  iconOuter: { width: 132, height: 132, borderRadius: 66, alignItems: 'center', justifyContent: 'center' },
  iconInner: {
    width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.35, shadowRadius: 28, shadowOffset: { width: 0, height: 12 }, elevation: 6,
  },
  copy: { paddingHorizontal: 4, paddingTop: 28, alignItems: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 10, lineHeight: 30 },
  subtitle: { fontSize: 14.5, textAlign: 'center', lineHeight: 22 },
  footer: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: Platform.OS === 'ios' ? 14 : 22, gap: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 99 },
});
