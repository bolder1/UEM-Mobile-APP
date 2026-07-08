import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { EnrollmentFormScreen } from '../screens/onboarding/EnrollmentFormScreen';
import { ApprovalPendingScreen } from '../screens/onboarding/ApprovalPendingScreen';
import { PermissionsScreen } from '../screens/onboarding/PermissionsScreen';
import { UnenrolledScreen } from '../screens/onboarding/UnenrolledScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { ChatThreadScreen } from '../screens/app/ChatThreadScreen';
import { VpnScreen } from '../screens/overlays/VpnScreen';
import { CastScreen } from '../screens/overlays/CastScreen';
import { CertsScreen } from '../screens/overlays/CertsScreen';
import { NotificationsScreen } from '../screens/overlays/NotificationsScreen';
import { AboutScreen } from '../screens/overlays/AboutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Enroll" component={EnrollmentFormScreen} />
      <Stack.Screen name="Pending" component={ApprovalPendingScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Vpn" component={VpnScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Cast" component={CastScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Certs" component={CertsScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Left" component={UnenrolledScreen} />
    </Stack.Navigator>
  );
}
