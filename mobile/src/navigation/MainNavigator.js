import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens (will be created next)
import HomeScreen from '../screens/HomeScreen';
import ResortDetailScreen from '../screens/ResortDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{ title: 'Ski Resorts' }}
      />
      <Stack.Screen
        name="ResortDetail"
        component={ResortDetailScreen}
        options={{ title: 'Resort Details' }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Resorts',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

// Simple TabBarIcon component (using text for now)
const TabBarIcon = ({ name, color }) => {
  const icons = {
    home: '🏠',
    star: '⭐',
    map: '🗺️',
    person: '👤'
  };

  return <span style={{ fontSize: 24 }}>{icons[name] || '•'}</span>;
};

export default MainNavigator;
