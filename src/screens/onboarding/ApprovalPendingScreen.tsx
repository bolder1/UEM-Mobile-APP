import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Easing, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Check, Search, Info, Lock, Shield, EyeOff } from 'lucide-react-native';
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

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.glow, { backgroundColor: approved ? colors.successTint : colors.primaryTint }]} />

      <View style={styles.stage}>
        {approved ? <CheckBurst /> : <ScanPulse />}
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <AppText variant="display" style={styles.h1}>
            {approved ? 'You’re enrolled' : 'Reviewing your request'}
          </AppText>
          <AppText variant="body" color={colors.muted} style={styles.p}>
            {approved
              ? `Your ${ORG_NAME} work profile is ready. Personal apps and data stay yours.`
              : `${ORG_NAME} IT is approving this device. Usually a few minutes — we’ll notify you the moment it’s ready.`}
          </AppText>
        </View>
      </View>

      {approved ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <RecapRow icon={Lock} tint={colors.primaryTint} tintColor={colors.primary} label="Work profile created" />
          <RecapRow icon={Shield} tint={colors.infoTint} tintColor={colors.info} label="Secure tunnel ready to connect" />
          <RecapRow icon={EyeOff} tint={colors.successTint} tintColor={colors.success} label="IT sees only work — never personal" last />
        </View>
      ) : (
        <>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <StepRow state="done" label="Requested" status="Done" />
            <StepRow state="done" label="Identity verified" status="Done" />
            <StepRow state="active" label="Admin review" status="In review" />
            <StepRow state="next" label="Device enrolled" status="Next" last />
          </View>
          <View style={[styles.info, { backgroundColor: colors.infoTint }]}>
            <Info size={18} color={colors.info} strokeWidth={2} style={{ marginTop: 1 }} />
            <AppText variant="bodyMedium" color={colors.text2} style={{ fontSize: 12, lineHeight: 17, flex: 1 }}>
              IT approves the device — never your personal data. You’ll see exactly what’s shared before anything installs.
            </AppText>
          </View>
        </>
      )}

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
          <Pressable
            onPress={() => haptics.tap()}
            accessibilityRole="button"
            accessibilityLabel="Contact IT"
            style={styles.helpRow}
          >
            <AppText variant="body" color={colors.muted} style={{ fontSize: 12.5 }}>
              Taking longer than expected?
            </AppText>
            <AppText variant="bodySemibold" color={colors.primary} style={{ fontSize: 12.5 }}>
              Contact IT
            </AppText>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

/** Concentric pulsing scan rings around the monogram, with a magnifier badge — the "reviewing" illustration. */
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
      <View style={[styles.badge, { backgroundColor: colors.surface, shadowColor: 'rgba(0,0,0,0.12)' }]}>
        <Search size={20} color={colors.primary} strokeWidth={2.4} />
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

function StepRow({ state, label, status, last }: { state: 'done' | 'active' | 'next'; label: string; status: string; last?: boolean }) {
  const { colors } = useTheme();
  const statusColor = state === 'active' ? colors.primary : state === 'next' ? colors.faint : colors.muted;
  return (
    <View style={[styles.step, !last && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}>
      <View
        style={[
          styles.stepIc,
          state === 'done'
            ? { backgroundColor: colors.success }
            : state === 'active'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.surfaceSunken, borderWidth: 1, borderColor: colors.borderStrong },
        ]}
      >
        {state === 'done' ? <Check size={13} color={colors.white} strokeWidth={3} /> : state === 'active' ? <View style={[styles.activeDot, { backgroundColor: colors.white }]} /> : null}
      </View>
      <AppText variant="bodySemibold" color={state === 'next' ? colors.muted2 : colors.text} style={{ fontSize: 13.5, flex: 1 }}>
        {label}
      </AppText>
      {state === 'active' ? <PulseDot color={colors.primary} size={6} /> : null}
      <AppText variant="bodySemibold" color={statusColor} style={{ fontSize: 12 }}>
        {status}
      </AppText>
    </View>
  );
}

function RecapRow({ icon: Icon, tint, tintColor, label, last }: { icon: any; tint: string; tintColor: string; label: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.step, !last && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}>
      <View style={[styles.recapTile, { backgroundColor: tint }]}>
        <Icon size={17} color={tintColor} strokeWidth={2} />
      </View>
      <AppText variant="bodyMedium" color={colors.text} style={{ fontSize: 13.5, flex: 1 }}>
        {label}
      </AppText>
      <Check size={17} color={colors.success} strokeWidth={2.6} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  glow: { position: 'absolute', top: 40, alignSelf: 'center', width: 300, height: 300, borderRadius: 150, opacity: 0.6 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 25, letterSpacing: -0.4, textAlign: 'center' },
  p: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', maxWidth: 290, marginTop: 8 },
  illo: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 2 },
  core: { width: 82, height: 82, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  badge: {
    position: 'absolute', right: 18, bottom: 18, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  burstCheck: {
    width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)', shadowOpacity: 1, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 6,
  },
  card: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 16 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  stepIc: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  activeDot: { width: 9, height: 9, borderRadius: 4.5 },
  recapTile: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', borderRadius: 14, padding: 14, marginTop: 12 },
  footer: { paddingTop: 18, paddingBottom: 12, minHeight: 76, justifyContent: 'center' },
  helpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
});
