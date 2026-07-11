import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Easing, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { haptics } from '../../utils/haptics';
import { useAppStore, ORG_NAME } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Pending'>;

const REVIEW_BG = ['#6A63F0', '#3F39B8', '#1B1946', '#0F0E24'] as const;
const DONE_BG = ['#17D6B4', '#0F9E8B', '#0A5D57', '#05221E'] as const;

export function ApprovalPendingScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const approved = useAppStore((s) => s.approved);
  const form = useAppStore((s) => s.form);
  const setApproved = useAppStore((s) => s.setApproved);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={approved ? DONE_BG : REVIEW_BG}
        locations={[0, 0.34, 0.72, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Orbs approved={approved} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.stage}>
          {approved ? <CheckBurst /> : <ScanPulse />}
          <View style={{ alignItems: 'center', marginTop: 26 }}>
            <AppText variant="display" color="#FFFFFF" style={styles.h1}>
              {approved ? 'Device enrolled' : 'Your IT team is reviewing'}
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.68)" style={styles.p}>
              {approved
                ? `${ORG_NAME} · your work profile is ready. Personal apps and data stay yours.`
                : `Request ${form.empId || 'ACM-1042'} · ${ORG_NAME} IT. Usually a few minutes — we’ll notify you.`}
            </AppText>
          </View>
        </View>

        <View style={styles.stepper}>
          <Step done label="Requested" sub="Enrollment sent" />
          <Step done label="Submitted" sub={`${form.name || 'Priya Sharma'} · verified`} />
          <Step done={approved} active={!approved} label="Admin review" sub={approved ? 'Approved by Ravi Kumar' : 'In the IT queue…'} />
          <Step done={approved} label="Device enrolled" sub={approved ? 'Work profile created' : 'Starts after approval'} last />
        </View>

        <View style={styles.footer}>
          {approved ? (
            <Pressable
              onPress={() => {
                haptics.tap();
                navigation.replace('Permissions');
              }}
              style={({ pressed }) => [styles.enterBtn, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <AppText variant="bodySemibold" color="#0F1319" style={{ fontSize: 15.5 }}>
                Enter workspace
              </AppText>
            </Pressable>
          ) : (
            <Pressable onPress={() => setApproved(true)} hitSlop={8} style={{ alignSelf: 'center', paddingVertical: 12 }}>
              <AppText variant="bodySemibold" color="rgba(255,255,255,0.8)" style={{ fontSize: 13.5 }}>
                Already approved? Continue
              </AppText>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

/** Concentric pulsing scan rings around the monogram — the "reviewing" illustration. */
function ScanPulse() {
  const rings = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const loops = rings.map((v, i) =>
      Animated.loop(
        Animated.timing(v, { toValue: 1, duration: 2600, delay: i * 850, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);
  return (
    <View style={styles.illo}>
      {rings.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            { opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.6, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.35] }) }] },
          ]}
        />
      ))}
      <View style={styles.core}>
        <Image source={require('../../../assets/logo-mark.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
      </View>
    </View>
  );
}

/** A check that pops in with radiating halos — the "enrolled" celebration. */
function CheckBurst() {
  const pop = useRef(new Animated.Value(0)).current;
  const halos = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, damping: 9, stiffness: 140, mass: 0.7 }).start();
    const loops = halos.map((v, i) =>
      Animated.loop(Animated.timing(v, { toValue: 1, duration: 2400, delay: i * 1100, easing: Easing.out(Easing.ease), useNativeDriver: true })),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);
  return (
    <View style={styles.illo}>
      {halos.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            { opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.4, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) }] },
          ]}
        />
      ))}
      <Animated.View style={[styles.burstCheck, { transform: [{ scale: pop }] }]}>
        <Check size={42} color="#0F9E8B" strokeWidth={3} />
      </Animated.View>
    </View>
  );
}

function Orbs({ approved }: { approved: boolean }) {
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const t1 = drift.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  const t2 = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const glow = approved ? 'rgba(93,240,216,0.28)' : 'rgba(125,118,255,0.30)';
  return (
    <>
      <Animated.View style={[styles.orb, { width: 200, height: 200, top: 70, left: -50, backgroundColor: glow, transform: [{ translateY: t1 }] }]} />
      <Animated.View style={[styles.orb, { width: 150, height: 150, bottom: 150, right: -40, backgroundColor: glow, transform: [{ translateY: t2 }] }]} />
    </>
  );
}

function Step({ done, active, label, sub, last }: { done?: boolean; active?: boolean; label: string; sub: string; last?: boolean }) {
  return (
    <View style={[styles.step, !last && styles.stepBorder]}>
      <View
        style={[
          styles.stepIc,
          done ? { backgroundColor: '#1D9E5F' } : active ? { backgroundColor: '#E7A93C' } : { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
        ]}
      >
        {done ? (
          <Check size={13} color="#FFFFFF" strokeWidth={3} />
        ) : active ? (
          <View style={styles.activeDot} />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="bodySemibold" color={done || active ? '#FFFFFF' : 'rgba(255,255,255,0.45)'} style={{ fontSize: 13.5 }}>
          {label}
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.5)" style={{ fontSize: 11, marginTop: 1 }}>
          {sub}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0E24' },
  safe: { flex: 1, paddingHorizontal: 24 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 24, letterSpacing: -0.4, textAlign: 'center' },
  p: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', maxWidth: 270, marginTop: 8 },
  illo: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  core: { width: 78, height: 78, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  burstCheck: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 10 } },
  orb: { position: 'absolute', borderRadius: 999 },
  stepper: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', borderRadius: 18, paddingHorizontal: 16 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  stepBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  stepIc: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  activeDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#141518' },
  footer: { paddingTop: 20, paddingBottom: 12, minHeight: 72, justifyContent: 'center' },
  enterBtn: { height: 52, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});

