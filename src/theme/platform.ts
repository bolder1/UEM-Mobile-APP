// Platform-aware design tokens: iOS leans on soft shadows + larger continuous corners,
// Android leans on Material elevation + slightly tighter corners + ripple feedback.
import { Platform } from 'react-native';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

export const radii = {
  card: isAndroid ? 14 : 18,
  sheet: isAndroid ? 20 : 28,
  button: isAndroid ? 12 : 14,
  pill: 99,
  tile: isAndroid ? 12 : 14,
};

export function cardElevation(isDark: boolean) {
  if (isAndroid) {
    return { elevation: isDark ? 0 : 2, shadowOpacity: 0 };
  }
  return {
    elevation: 0,
    shadowOpacity: isDark ? 0 : 1,
    shadowColor: 'rgba(16,24,40,0.10)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  };
}

export function raisedElevation(shadowColor: string, active: boolean) {
  if (isAndroid) {
    return { elevation: active ? 4 : 0, shadowOpacity: 0 };
  }
  return {
    elevation: 0,
    shadowOpacity: active ? 0.28 : 0,
    shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
  };
}

// Subtle tap ripple for Android; iOS ignores this prop entirely.
export function ripple(color: string, borderless = false) {
  return isAndroid ? { color, borderless, foreground: true } : null;
}
