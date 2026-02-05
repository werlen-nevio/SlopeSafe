import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import ResortDetailScreen from '../screens/ResortDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AlertRulesScreen from '../screens/AlertRulesScreen';
import AlertRuleFormScreen from '../screens/AlertRuleFormScreen';
import NotificationHistoryScreen from '../screens/NotificationHistoryScreen';
import LanguagePickerScreen from '../screens/LanguagePickerScreen';

const Tab = createBottomTabNavigator();
const HomeStackNav = createNativeStackNavigator();
const FavoritesStackNav = createNativeStackNavigator();
const MapStackNav = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.brandNavy,
  },
  headerTintColor: theme.colors.brandWhite,
  headerTitleStyle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: theme.typography.sizes.lg,
  },
  headerTitleAlign: 'center',
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  headerBackButtonDisplayMode: 'minimal',
};

const HomeStackScreen = () => (
  <HomeStackNav.Navigator screenOptions={stackScreenOptions}>
    <HomeStackNav.Screen
      name="HomeList"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <HomeStackNav.Screen
      name="ResortDetail"
      component={ResortDetailScreen}
      options={{ title: '' }}
    />
  </HomeStackNav.Navigator>
);

const FavoritesStackScreen = () => {
  const { t } = useTranslation();
  return (
    <FavoritesStackNav.Navigator screenOptions={stackScreenOptions}>
      <FavoritesStackNav.Screen
        name="FavoritesList"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
      <FavoritesStackNav.Screen
        name="ResortDetail"
        component={ResortDetailScreen}
        options={{ title: '' }}
      />
    </FavoritesStackNav.Navigator>
  );
};

const MapStackScreen = () => {
  const { t } = useTranslation();
  return (
    <MapStackNav.Navigator screenOptions={stackScreenOptions}>
      <MapStackNav.Screen
        name="MapView"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <MapStackNav.Screen
        name="ResortDetail"
        component={ResortDetailScreen}
        options={{ title: '' }}
      />
    </MapStackNav.Navigator>
  );
};

const ProfileStackScreen = () => {
  const { t } = useTranslation();
  return (
    <ProfileStackNav.Navigator screenOptions={stackScreenOptions}>
      <ProfileStackNav.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStackNav.Screen
        name="AlertRules"
        component={AlertRulesScreen}
        options={{ title: t('notifications.alertRules') }}
      />
      <ProfileStackNav.Screen
        name="AlertRuleForm"
        component={AlertRuleFormScreen}
        options={{ title: t('notifications.createRule') }}
      />
      <ProfileStackNav.Screen
        name="NotificationHistory"
        component={NotificationHistoryScreen}
        options={{ title: t('notifications.title') }}
      />
      <ProfileStackNav.Screen
        name="LanguagePicker"
        component={LanguagePickerScreen}
        options={{ title: t('profile.language') }}
      />
    </ProfileStackNav.Navigator>
  );
};

const MainNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.brandWhite,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'FavoritesTab':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'MapTab':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{ tabBarLabel: t('nav.home') }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesStackScreen}
        options={{ tabBarLabel: t('nav.favorites') }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapStackScreen}
        options={{ tabBarLabel: t('nav.map') }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{ tabBarLabel: t('nav.profile') }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
