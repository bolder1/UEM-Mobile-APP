import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X, House, LayoutGrid, MessageCircle, Lock, Cast, ShieldCheck, Folder,
  ChevronRight, Sun, Moon, SunMoon,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { ListRow } from './ListRow';
import { StatusDot } from './StatusDot';
import { Avatar } from './Avatar';
import { IconButton } from './IconButton';
import {
  useAppStore, ORG_NAME, DEFAULT_USER_NAME, pendingCertCount, hasAnyUnread,
} from '../state/store';
import { haptics } from '../utils/haptics';
import { navigate } from '../navigation/navigationRef';
import { space, layout, touch, control } from '../theme/spacing';

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
  // Settings (Appearance, Notifications, Privacy, About) and Activity all live
  // as cells on the profile screen, reachable from the footer chip below — the
  // drawer only carries what profile doesn't.
  const DEVICE: Item[] = [
    { label: 'Secure tunnel', icon: Lock, route: 'Vpn' },
    { label: 'Screen cast', icon: Cast, route: 'Cast' },
    { label: 'Certificates', icon: ShieldCheck, route: 'Certs', badge: certsPending },
    { label: 'Files', icon: Folder, route: 'Files' },
  ];

  const nextTheme = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
  const ThemeIcon = themeMode === 'light' ? Sun : themeMode === 'dark' ? Moon : SunMoon;
  const themeLabel = themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light';

  // The app's primary navigation, so it uses the app's row — not a private copy
  // of one. The wrapper exists only to carry the selected pill's fill and clip
  // it; the row's geometry (and its a11y contract) belong to ListRow.
  const renderItem = (item: Item) => {
    const Icon = item.icon;
    const selected = activeRoute === item.route;
    return (
      <View key={item.label} style={[styles.item, selected && { backgroundColor: colors.primaryTint }]}>
        <ListRow
          icon={<Icon size={control.icon.lg} color={selected ? colors.primary : colors.text3} strokeWidth={2} />}
          label={item.label}
          labelColor={selected ? colors.primary : colors.text}
          onPress={() => go(item)}
          showChevron={false}
          accessibilityLabel={item.badge ? `${item.label}, ${item.badge} pending` : item.label}
          accessibilityState={{ selected }}
          right={
            item.badge ? (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <AppText variant="bodyBold" size="micro" color={colors.white}>{item.badge}</AppText>
              </View>
            ) : item.dot ? (
              <StatusDot color={colors.primary} label="Unread" labelHidden />
            ) : null
          }
        />
      </View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: scrim }]}>
        <Pressable style={{ flex: 1 }} onPress={() => setDrawer(false)} accessibilityRole="button" accessibilityLabel="Close menu" />
      </Animated.View>

      <Animated.View
        // This drawer is a hand-rolled overlay, not a Modal, so nothing isolates
        // it for free: without this the entire screen behind the scrim stays in
        // the accessibility tree and a swipe walks straight into a UI the user
        // can't see and didn't mean to reach.
        accessibilityViewIsModal
        style={[
          styles.panel,
          {
            width: W,
            backgroundColor: colors.surface,
            transform: [{ translateX: tx }],
            paddingTop: insets.top + layout.screenTop,
            paddingBottom: insets.bottom + layout.screenBottom,
          },
        ]}
      >
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <ShieldCheck size={control.icon.md} color={colors.white} strokeWidth={2.2} />
          </View>
          <AppText variant="displaySemibold" size="callout" style={styles.brandText}>
            UEM <AppText variant="displaySemibold" size="callout" color={colors.primary}>Companion</AppText>
          </AppText>
          <IconButton
            icon={<X size={control.icon.md} color={colors.text3} strokeWidth={2.2} />}
            onPress={() => setDrawer(false)}
            accessibilityLabel="Close menu"
            variant="neutral"
            size={control.height.sm}
          />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: space[2] }} showsVerticalScrollIndicator={false}>
          <View style={styles.group}>{PRIMARY.map(renderItem)}</View>
          <AppText variant="bodyBold" size="micro" color={colors.muted2} style={styles.groupLabel}>DEVICE</AppText>
          <View style={styles.group}>{DEVICE.map(renderItem)}</View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.hairline }]}>
          <Pressable
            onPress={() => { haptics.tap(); setDrawer(false); navigate('MainTabs', { screen: 'Profile' } as any); }}
            accessibilityRole="button"
            accessibilityLabel="Your profile"
            style={[styles.userChip, { backgroundColor: colors.surfaceSunken }]}
          >
            <Avatar initials={initials} color={colors.primary} size={space[8]} textColor={isDark ? colors.canvas : colors.white} />
            <View style={styles.userText}>
              <AppText variant="bodySemibold" size="footnote" numberOfLines={1}>{userName}</AppText>
              <AppText variant="body" size="micro" color={colors.muted} numberOfLines={1}>{ORG_NAME}</AppText>
            </View>
            <ChevronRight size={control.icon.md} color={colors.faint} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            onPress={() => { haptics.tap(); setThemeMode(nextTheme); }}
            accessibilityRole="button"
            accessibilityLabel={`Theme: ${themeLabel}. Tap to change.`}
            style={[styles.themeBtn, { backgroundColor: colors.surfaceSunken }]}
          >
            <ThemeIcon size={control.icon.lg} color={colors.text3} strokeWidth={2} />
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
  brand: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingHorizontal: layout.gutter, paddingBottom: space[3] },
  brandText: { flex: 1, letterSpacing: -0.2 },
  logo: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  // ListRow brings its own 16 of horizontal padding, so the group only adds the
  // remaining 4 — which lands every row icon on the same 20 gutter as the brand
  // mark above and the group labels between.
  group: { paddingHorizontal: layout.gutter - layout.rowPadH, gap: space[1] },
  groupLabel: { letterSpacing: 0.7, marginTop: layout.blockGap, marginBottom: layout.labelGap, marginHorizontal: layout.gutter },
  item: { borderRadius: 12, overflow: 'hidden' },
  badge: { minWidth: space[5], height: space[5], borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[2] },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingHorizontal: space[3], paddingTop: space[3], borderTopWidth: 1, marginTop: space[1] },
  userChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[3], borderRadius: 14, paddingHorizontal: space[3], paddingVertical: space[2] },
  userText: { flex: 1, minWidth: 0 },
  themeBtn: { width: touch.min, height: touch.min, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
