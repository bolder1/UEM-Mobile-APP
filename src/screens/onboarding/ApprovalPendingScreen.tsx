import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { PulseDot } from '../../components/Animations';
import { haptics } from '../../utils/haptics';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { useAppStore, ORG_NAME } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Pending'>;

export function ApprovalPendingScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const approved = useAppStore((s) => s.approved);
  const form = useAppStore((s) => s.form);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.glow, { backgroundColor: approved ? colors.successTint : colors.primaryTint }]} />

      <View style={styles.stage}>
        {approved ? <CheckBurst /> : <ScanPulse />}
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <AppText variant="display" style={styles.h1}>
            {approved ? 'Device enrolled' : 'Waiting for approval'}
          </AppText>
          <AppText variant="body" color={colors.muted} style={styles.p}>
            {approved
              ? `${ORG_NAME} · your work profile is ready. Personal apps and data stay yours.`
              : `Request ${form.empId || 'ACM-1042'} is with ${ORG_NAME} IT. This usually takes a few minutes — we’ll let you know.`}
          </AppText>
        </View>
      </View>

      <View style={[styles.stepper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Step done label="Requested" sub="Enrollment sent" />
        <Step done label="Identity verified" sub={`${form.name || 'Priya Sharma'} · verified`} />
        <Step
          done={approved}
          active={!approved}
          label="Admin review"
          sub={approved ? 'Approved by IT · Ravi Kumar' : 'In the IT queue…'}
        />
        <Step done={approved} label="Device enrolled" sub={approved ? 'Work profile created' : 'Starts after approval'} last />
      </View>

      <View style={styles.footer}>
        {approved ? (
          <Button
            label="Enter workspace"
            onPress={() => {
              haptics.tap();
              navigation.replace('Permissions');
            }}
          />
        ) : (
          <View style={[styles.waitChip, { backgroundColor: colors.surfaceSunken }]}>
            <PulseDot color={colors.primary} size={7} />
            <AppText variant="bodySemibold" color={colors.text3} style={{ fontSize: 12.5 }}>
              Waiting for IT approval
            </AppText>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/** Concentric pulsing scan rings around the monogram — the "reviewing" illustration. */
function ScanPulse() {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const rings = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    if (reduced) return;
    const loops = rings.map((v, i) =>
      Animated.loop(
        Animated.timing(v, { toValue: 1, duration: 2600, delay: i * 850, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  return (
    <View style={styles.illo}>
      {rings.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            { borderColor: colors.primary, opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.45, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.35] }) }] },
          ]}
        />
      ))}
      <View style={[styles.core, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Image source={require('../../../assets/logo-mark.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
      </View>
    </View>
  );
}

/** A check that pops in with radiating halos — the "enrolled" moment. */
function CheckBurst() {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const pop = useRef(new Animated.Value(0)).current;
  const halos = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    if (reduced) {
      pop.setValue(1);
      return;
    }
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, damping: 9, stiffness: 140, mass: 0.7 }).start();
    const loops = halos.map((v, i) =>
      Animated.loop(Animated.timing(v, { toValue: 1, duration: 2400, delay: i * 1100, easing: Easing.out(Easing.ease), useNativeDriver: true })),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  return (
    <View style={styles.illo}>
      {halos.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            { borderColor: colors.success, opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.4, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) }] },
          ]}
        />
      ))}
      <Animated.View style={[styles.burstCheck, { backgroundColor: colors.success, transform: [{ scale: pop }] }]}>
        <Check size={42} color={colors.white} strokeWidth={3} />
      </Animated.View>
    </View>
  );
}

function Step({ done, active, label, sub, last }: { done?: boolean; active?: boolean; label: string; sub: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.step, !last && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}>
      <View
        style={[
          styles.stepIc,
          done
            ? { backgroundColor: colors.success }
            : active
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.surfaceSunken, borderWidth: 1, borderColor: colors.borderStrong },
        ]}
      >
        {done ? <Check size={13} color={colors.white} strokeWidth={3} /> : active ? <View style={[styles.activeDot, { backgroundColor: colors.white }]} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="bodySemibold" color={done || active ? colors.text : colors.muted2} style={{ fontSize: 13.5 }}>
          {label}
        </AppText>
        <AppText variant="body" color={colors.muted} style={{ fontSize: 11, marginTop: 1 }}>
          {sub}
        </AppText>
      </View>
      {active ? <PulseDot color={colors.primary} size={7} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  glow: { position: 'absolute', top: 40, alignSelf: 'center', width: 300, height: 300, borderRadius: 150, opacity: 0.6 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 24, letterSpacing: -0.4, textAlign: 'center' },
  p: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', maxWidth: 280, marginTop: 8 },
  illo: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 2 },
  core: { width: 82, height: 82, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  burstCheck: {
    width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)', shadowOpacity: 1, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 6,
  },
  stepper: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 16 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  stepIc: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  activeDot: { width: 9, height: 9, borderRadius: 4.5 },
  footer: { paddingTop: 20, paddingBottom: 12, minHeight: 76, justifyContent: 'center' },
  waitChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, alignSelf: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
});
