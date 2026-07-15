import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

// A container-level navigation ref so surfaces mounted outside the navigator
// (the global Toast) can navigate — e.g. tap an audit line through to Activity.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}
