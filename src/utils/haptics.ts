import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// expo-haptics is a no-op stub on web; guard explicitly so we never touch the
// native bridge there and can extend behavior per-platform later if needed.
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  tap: () => {
    if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  select: () => {
    if (isNative) Haptics.selectionAsync().catch(() => {});
  },
  success: () => {
    if (isNative) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning: () => {
    if (isNative) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
