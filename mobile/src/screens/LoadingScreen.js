import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { APP_NAME } from '../constants/config';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{APP_NAME}</Text>
      <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 20
  },
  loader: {
    marginTop: 20
  }
});

export default LoadingScreen;
