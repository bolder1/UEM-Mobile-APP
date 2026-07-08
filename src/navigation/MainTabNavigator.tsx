import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { CustomTabBar } from './CustomTabBar';
import { HomeScreen } from '../screens/app/HomeScreen';
import { ChatListScreen } from '../screens/app/ChatListScreen';
import { FilesScreen } from '../screens/app/FilesScreen';
import { AppsScreen } from '../screens/app/AppsScreen';
import { MoreScreen } from '../screens/app/MoreScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Files" component={FilesScreen} />
      <Tab.Screen name="Apps" component={AppsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
