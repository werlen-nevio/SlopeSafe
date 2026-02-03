import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ResortsProvider } from './src/contexts/ResortsContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ResortsProvider>
          <FavoritesProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </FavoritesProvider>
        </ResortsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
