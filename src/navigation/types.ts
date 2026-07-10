import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Chat: undefined;
  Files: undefined;
  Apps: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Enroll: undefined;
  Pending: undefined;
  Permissions: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ChatThread: { chatId: string };
  Vpn: undefined;
  Cast: undefined;
  Certs: undefined;
  Notifications: undefined;
  About: undefined;
  Appearance: undefined;
  Left: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
