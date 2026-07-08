import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Power, Eye, Check, X, Lock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { DotGrid } from '../../components/DotGrid';
import { FloatBadge } from '../../components/Animations';
import { ONBOARDING_STEPS } from '../../data/mockData';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const ob = ONBOARDING_STEPS[step];

  const next = () => {
    if (step < 2) setStep(step + 1);
    else navigation.replace('Enroll');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Shield size={15} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <AppText variant="display" style={{ fontSize: 14, letterSpacing: -0.2 }}>
            miniOrange <AppText variant="display" color={colors.primary} style={{ fontSize: 14 }}>UEM</AppText>
          </AppText>
        </View>
        <Pressable onPress={() => navigation.replace('Enroll')} hitSlop={8}>
          <AppText variant="bodySemibold" color={colors.muted} style={{ fontSize: 13 }}>
            Skip
          </AppText>
        </Pressable>
      </View>

      <View style={styles.body} key={step}>
        <View style={[styles.illustration, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <DotGrid color={colors.dot} />
          {step === 0 && <StepZeroArt />}
          {step === 1 && <StepOneArt />}
          {step === 2 && <StepTwoArt />}
        </View>

        <View style={styles.copy}>
          <AppText variant="display" style={styles.title}>
            {ob.title}
          </AppText>
          <AppText variant="body" color={colors.text3} style={styles.subtitle}>
            {ob.body}
          </AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { width: i === step ? 22 : 6, backgroundColor: i === step ? colors.primary : colors.dotInactive },
              ]}
            />
          ))}
        </View>
        <Button label={ob.cta} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

function StepZeroArt() {
  const { colors } = useTheme();
  return (
    <>
      <View style={[styles.iconOuter, { backgroundColor: colors.primaryTint }]}>
        <View style={[styles.iconInner, { backgroundColor: colors.primary }]}>
          <Shield size={44} color="#FFFFFF" strokeWidth={2} />
        </View>
      </View>
      <FloatBadge style={[styles.badge, { top: 52, left: 36 }]}>
        <BadgeInner icon={<View style={[styles.miniDot, { backgroundColor: colors.success }]} />} label="Policy compliant" />
      </FloatBadge>
      <FloatBadge delay={800} style={[styles.badge, { bottom: 48, right: 34 }]}>
        <BadgeInner icon={<Lock size={13} color={colors.primary} strokeWidth={2.4} />} label="Work data sealed" />
      </FloatBadge>
    </>
  );
}

function StepOneArt() {
  const { colors } = useTheme();
  return (
    <>
      <View style={[styles.iconOuter, { backgroundColor: colors.infoTint }]}>
        <View style={[styles.iconInner, { backgroundColor: colors.info }]}>
          <Power size={44} color="#FFFFFF" strokeWidth={2} />
        </View>
      </View>
      <FloatBadge style={[styles.badge, { top: 56, right: 38 }]}>
        <BadgeInner icon={<View style={[styles.miniDot, { backgroundColor: colors.success }]} />} label="Secure tunnel on" />
      </FloatBadge>
      <FloatBadge delay={700} style={[styles.badge, { bottom: 50, left: 36 }]}>
        <BadgeInner icon={<Lock size={13} color={colors.info} strokeWidth={2.4} />} label="WireGuard® inside" />
      </FloatBadge>
    </>
  );
}

function StepTwoArt() {
  const { colors } = useTheme();
  return (
    <>
      <View style={[styles.iconOuter, { backgroundColor: colors.successTint }]}>
        <View style={[styles.iconInner, { backgroundColor: colors.success }]}>
          <Eye size={44} color="#FFFFFF" strokeWidth={2} />
        </View>
      </View>
      <FloatBadge style={[styles.badge, { top: 54, left: 34 }]}>
        <BadgeInner icon={<Check size={13} color={colors.success} strokeWidth={2.4} />} label="IT sees: work apps" />
      </FloatBadge>
      <FloatBadge delay={900} style={[styles.badge, { bottom: 50, right: 34 }]}>
        <BadgeInner icon={<X size={13} color={colors.danger} strokeWidth={2.4} />} label="Never: personal data" />
      </FloatBadge>
    </>
  );
}

function BadgeInner({ icon, label }: { icon: React.ReactNode; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.badgeInner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {icon}
      <AppText variant="bodySemibold" color={colors.text2} style={{ fontSize: 11.5 }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, justifyContent: 'center' },
  illustration: {
    height: 300,
    marginHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconOuter: { width: 132, height: 132, borderRadius: 66, alignItems: 'center', justifyContent: 'center' },
  iconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0052CC',
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  badge: { position: 'absolute' },
  badgeInner: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    shadowColor: 'rgba(16,24,40,0.08)',
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    elevation: 3,
  },
  miniDot: { width: 7, height: 7, borderRadius: 3.5 },
  copy: { paddingHorizontal: 28, paddingTop: 28, alignItems: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 10, lineHeight: 30 },
  subtitle: { fontSize: 14.5, textAlign: 'center', lineHeight: 22 },
  footer: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: Platform.OS === 'ios' ? 14 : 22, gap: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 99 },
});
