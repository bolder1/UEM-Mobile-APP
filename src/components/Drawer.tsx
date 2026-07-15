import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X, House, LayoutGrid, MessageCircle, Lock, Cast, ShieldCheck, Folder, Activity,
  Bell, Palette, EyeOff, Info, ChevronRight, Sun, Moon, SunMoon,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import {
  useAppStore, ORG_NAME, DEFAULT_USER_NAME, pendingCertCount, unreadNotifCount, hasAnyUnread,
} from '../state/store';
import { haptics } from '../utils/haptics';
import { navigate } from '../navigation/navigationRef';

type Item = { label: string; icon: any; route: string; tab?: boolean; badge?: number; dot?: boolean };

/** A left slide-in navigation drawer (replaces the bottom tab bar). Rendered
 *  once at the app root; opens from any main screen's hamburger. */
export function Drawer() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const W = Math.min(332, width * 0.86);

  const open = useAppStore((s) => s.drawerOpen);
  const setDrawer = useAppStore((s) => s.setDrawer);
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const form = useAppStore((s) => s.form);
  const certs = useAppStore((s) => s.certs);
  const appSt = useAppStore((s) => s.appSt);
  const unread = useAppStore((s) => s.unread);
  const notifications = useAppStore((s) => s.notifications);
  const activeRoute = useAppStore((s) => s.activeRoute);

  const [mounted, setMounted] = useState(false);
  const tx = useRef(new Animated.Value(-W)).current;
  const scrim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(tx, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 240, mass: 0.9 }),
        Animated.timing(scrim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(tx, { toValue: -W, duration: 200, useNativeDriver: true }),
        Animated.timing(scrim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  const userName = form.name || DEFAULT_USER_NAME;
  const initials = userName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const certsPending = pendingCertCount(certs);
  const appsToAct = Object.values(appSt).filter((s) => s === 'available' || s === 'update').length;
  const unreadNotifs = unreadNotifCount(notifications);

  const go = (item: Item) => {
    haptics.tap();
    setDrawer(false);
    if (item.tab) navigate('MainTabs', { screen: item.route } as any);
    else navigate(item.route as any);
  };

  const PRIMARY: Item[] = [
    { label: 'Home', icon: House, route: 'Home', tab: true },
    { label: 'Apps', icon: LayoutGrid, route: 'Apps', tab: true, badge: appsToAct },
    { label: 'Chat', icon: MessageCircle, route: 'Chat', tab: true, dot: hasAnyUnread(unread) },
  ];
  const DEVICE: Item[] = [
    { label: 'Secure tunnel', icon: Lock, route: 'Vpn' },
    { label: 'Screen cast', icon: Cast, route: 'Cast' },
    { label: 'Certificates', icon: ShieldCheck, route: 'Certs', badge: certsPending },
    { label: 'Files', icon: Folder, route: 'Files' },
    { label: 'Activity', icon: Activity, route: 'Activity' },
  ];
  const SETTINGS: Item[] = [
    { label: 'Notifications', icon: Bell, route: 'Notifications', badge: unreadNotifs },
    { label: 'Appearance', icon: Palette, route: 'Appearance' },
    { label: 'Privacy', icon: EyeOff, route: 'Privacy' },
    { label: 'About', icon: Info, route: 'About' },
  ];

  const nextTheme = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
  const ThemeIcon = themeMode === 'light' ? Sun : themeMode === 'dark' ? Moon : SunMoon;
  const themeLabel = themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light';

  const renderItem = (item: Item) => {
    const Icon = item.icon;
    const selected = activeRoute === item.route;
    return (
      <Pressable
        key={item.label}
        onPress={() => go(item)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={item.badge ? `${item.label}, ${item.badge} pending` : item.label}
        style={[styles.item, selected && { backgroundColor: colors.primaryTint }]}
      >
        <Icon size={19} color={selected ? colors.primary : colors.text3} strokeWidth={2} />
        <AppText variant={selected ? 'bodySemibold' : 'bodyMedium'} color={selected ? colors.primary : colors.text} style={{ fontSize: 14, flex: 1 }}>
          {item.label}
        </AppText>
        {item.badge ? (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <AppText variant="bodyBold" color="#FFFFFF" style={{ fontSize: 10.5 }}>{item.badge}</AppText>
          </View>
        ) : item.dot ? (
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: scrim }]}>
        <Pressable style={{ flex: 1 }} onPress={() => setDrawer(false)} accessibilityRole="button" accessibilityLabel="Close menu" />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          { width: W, backgroundColor: colors.surface, transform: [{ translateX: tx }], paddingTop: insets.top + 14, paddingBottom: insets.bottom + 12 },
        ]}
      >
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <ShieldCheck size={16} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <AppText variant="displaySemibold" style={{ fontSize: 15, flex: 1, letterSpacing: -0.2 }}>
            UEM <AppText variant="displaySemibold" color={colors.primary} style={{ fontSize: 15 }}>Companion</AppText>
          </AppText>
          <Pressable onPress={() => setDrawer(false)} hitSlop={8} style={[styles.close, { backgroundColor: colors.surfaceSunken }]}>
            <X size={16} color={colors.text3} strokeWidth={2.2} />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
          <View style={styles.group}>{PRIMARY.map(renderItem)}</View>
          <AppText variant="bodyBold" color={colors.muted2} style={styles.groupLabel}>DEVICE</AppText>
          <View style={styles.group}>{DEVICE.map(renderItem)}</View>
          <AppText variant="bodyBold" color={colors.muted2} style={styles.groupLabel}>SETTINGS</AppText>
          <View style={styles.group}>{SETTINGS.map(renderItem)}</View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.hairline }]}>
          <Pressable
            onPress={() => { haptics.tap(); setDrawer(false); navigate('MainTabs', { screen: 'Profile' } as any); }}
            accessibilityRole="button"
            accessibilityLabel="Your profile"
            style={[styles.userChip, { backgroundColor: colors.surfaceSunken }]}
          >
            <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
              <AppText variant="displaySemibold" color="#FFFFFF" style={{ fontSize: 12.5 }}>{initials}</AppText>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="bodySemibold" numberOfLines={1} style={{ fontSize: 13 }}>{userName}</AppText>
              <AppText variant="body" color={colors.muted} style={{ fontSize: 11 }} numberOfLines={1}>{ORG_NAME}</AppText>
            </View>
            <ChevronRight size={16} color={colors.faint} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            onPress={() => { haptics.tap(); setThemeMode(nextTheme); }}
            accessibilityRole="button"
            accessibilityLabel={`Theme: ${themeLabel}. Tap to change.`}
            style={[styles.themeBtn, { backgroundColor: colors.surfaceSunken }]}
          >
            <ThemeIcon size={18} color={colors.text3} strokeWidth={2} />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: 'rgba(9,12,18,0.5)' },
  panel: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    borderTopRightRadius: 24, borderBottomRightRadius: 24,
    shadowColor: 'rgba(0,0,0,0.3)', shadowOpacity: 1, shadowRadius: 30, shadowOffset: { width: 6, height: 0 }, elevation: 24,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingBottom: 14 },
  logo: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  group: { paddingHorizontal: 10, gap: 2 },
  groupLabel: { fontSize: 10.5, letterSpacing: 0.7, marginTop: 16, marginBottom: 6, marginHorizontal: 20 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingTop: 12, borderTopWidth: 1, marginTop: 4 },
  userChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 9 },
  userAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  themeBtn: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
