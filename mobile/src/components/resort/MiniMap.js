import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { theme } from '../../theme';

const MiniMap = ({ latitude, longitude }) => {
  if (!latitude || !longitude) return null;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
        mapType="standard"
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          pinColor={theme.colors.brandNavy}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    height: 180,
    ...theme.shadows.card,
  },
  map: {
    flex: 1,
  },
});

export default MiniMap;
