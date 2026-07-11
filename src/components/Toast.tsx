import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Info, TriangleAlert } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { useAppStore } from '../state/store';
import { ToastMsg } from '../types';

/** Global, transient feedback for state-changing actions. Mounted once at the
 *  app root; reads the single `toast` slot from the store and auto-dismisses. */
export function Toast() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useAppStore((s) => s.toast);
  const hideToast = useAppStore((s) => s.hideToast);
  const [current, setCurrent] = useState<ToastMsg | null>(null);
  const y = useRef(new Animated.Value(60)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    setCurrent(toast);
    y.setValue(60);
    op.setValue(0);
    Animated.parallel([
      Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 220, mass: 0.7 }),
      Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(y, { toValue: 60, duration: 200, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setCurrent(null);
        hideToast();
      });
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.id]);

  if (!current) return null;
  const tone =
    current.tone === 'danger' ? colors.danger : current.tone === 'info' ? colors.info : colors.successStrong;
  const Icon = current.tone === 'danger' ? TriangleAlert : current.tone === 'info' ? Info : Check;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.host, { bottom: insets.bottom + 82, opacity: op, transform: [{ translateY: y }] }]}
    >
      <View style={[styles.toast, { backgroundColor: colors.text }]}>
        <Icon size={16} color={tone} strokeWidth={2.6} />
        <AppText variant="bodySemibold" color={colors.bg} style={{ fontSize: 13, flexShrink: 1 }}>
          {current.message}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: 20 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 13,
    maxWidth: 420,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
