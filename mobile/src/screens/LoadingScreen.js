import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SlopeSafe</Text>
      <Text style={styles.subtitle}>Swiss Avalanche Safety</Text>
      <ActivityIndicator size="large" color={theme.colors.brandSkyBlue} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.brandNavy,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: theme.colors.brandWhite,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.brandSkyBlueLight,
    marginBottom: 24,
  },
  loader: {
    marginTop: 8,
  },
});

export default LoadingScreen;
