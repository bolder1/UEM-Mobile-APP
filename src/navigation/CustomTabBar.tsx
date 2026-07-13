import React, { useEffect, useRef } from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { House, MessageCircle, LayoutGrid, CircleUser } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from '../components/Text';
import { useAppStore, hasAnyUnread } from '../state/store';
import { haptics } from '../utils/haptics';
import { isAndroid, ripple } from '../theme/platform';

const ICONS: Record<string, any> = {
  Home: House,
  Apps: LayoutGrid,
  Chat: MessageCircle,
  Profile: CircleUser,
};

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const unread = useAppStore((s) => s.unread);
  const anyUnread = hasAnyUnread(unread);

  return (
    <View
      style={[
        styles.wrap,
        { borderTopColor: colors.border },
        isAndroid && { backgroundColor: colors.surface, elevation: 8, borderTopWidth: 0 },
      ]}
    >
      {!isAndroid && (
        <BlurView
          intensity={40}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.navBg }]}
        />
      )}
      <View style={[styles.row, { paddingBottom: Math.max(insets.bottom, isAndroid ? 10 : 14) }]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const Icon = ICONS[route.name];
          const color = focused ? colors.primary : colors.muted;
          const showDot = route.name === 'Chat' && anyUnread;
          return (
            <TabButton
              key={route.key}
              focused={focused}
              label={route.name}
              onPress={() => {
                if (!focused) haptics.select();
                navigation.navigate(route.name);
              }}
            >
              <View>
                <Icon size={21} color={color} strokeWidth={2} />
                {showDot && (
                  <View style={[styles.dot, { backgroundColor: colors.primary, borderColor: colors.bg }]} />
                )}
              </View>
              <AppText variant="bodySemibold" color={color} style={{ fontSize: 10, marginTop: 3 }}>
                {route.name}
              </AppText>
            </TabButton>
          );
        })}
      </View>
    </View>
  );
}

function TabButton({
  focused,
  onPress,
  children,
  label,
}: {
  focused: boolean;
  onPress: () => void;
  children: React.ReactNode;
  label: string;
}) {
  const bounce = useRef(new Animated.Value(1)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      bounce.setValue(0.82);
      Animated.spring(bounce, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 14 }).start();
    }
  }, [focused]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(press, { toValue: 0.9, useNativeDriver: true, speed: 40, bounciness: 6 }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 9 }).start()}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      android_ripple={ripple('rgba(0,0,0,0.06)', true) ?? undefined}
      style={styles.tab}
    >
      <Animated.View style={{ alignItems: 'center', transform: [{ scale: Animated.multiply(bounce, press) }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', paddingTop: 8, paddingHorizontal: 8 },
  tab: { flex: 1, alignItems: 'center', paddingTop: 4 },
  dot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
});
