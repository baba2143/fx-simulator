import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import { SplashScreen } from '../screens/SplashScreen';
import { DataImportScreen } from '../screens/DataImportScreen';
import { ChartScreen } from '../screens/ChartScreen';
import { TradeScreen } from '../screens/TradeScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { PerformanceScreen } from '../screens/PerformanceScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

import { RootStackParamList, MainTabParamList } from '../types';

const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          switch (route.name) {
            case 'Chart':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Trade':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              break;
            case 'History':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Performance':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Goals':
              iconName = focused ? 'flag' : 'flag-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#F8F9FA',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}>
      <MainTab.Screen name="Chart" component={ChartScreen} options={{ title: 'チャート' }} />
      <MainTab.Screen name="Trade" component={TradeScreen} options={{ title: '取引' }} />
      <MainTab.Screen name="History" component={HistoryScreen} options={{ title: '履歴' }} />
      <MainTab.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{ title: '成績' }}
      />
      <MainTab.Screen name="Goals" component={GoalsScreen} options={{ title: '目標' }} />
      <MainTab.Screen name="Settings" component={SettingsScreen} options={{ title: '設定' }} />
    </MainTab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="DataImport" component={DataImportScreen} />
        <RootStack.Screen name="MainTab" component={MainTabNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
