import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { mapApi } from '../api/map';
import { theme, getDangerColor } from '../theme';
import TabHeader from '../components/common/TabHeader';
import MapLegend from '../components/map/MapLegend';
import ResortBottomSheet from '../components/map/ResortBottomSheet';
import { SkeletonMap } from '../components/common/Skeleton';

const SWITZERLAND_REGION = {
  latitude: 46.8182,
  longitude: 8.2275,
  latitudeDelta: 2.5,
  longitudeDelta: 3.0,
};

const MapScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [resorts, setResorts] = useState([]);
  const [dangerPolygons, setDangerPolygons] = useState([]);
  const [selectedResort, setSelectedResort] = useState(null);
  const [loading, setLoading] = useState(true);
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [resortsRes, dangerRes] = await Promise.all([
        mapApi.getResorts(),
        mapApi.getDangerLayer(),
      ]);

      if (resortsRes.features) {
        const mapped = resortsRes.features.map((f) => ({
          id: f.id || f.properties?.id,
          name: f.properties?.name,
          canton: f.properties?.canton,
          slug: f.properties?.slug,
          danger_level: f.properties?.danger_level,
          latitude: f.geometry?.coordinates?.[1],
          longitude: f.geometry?.coordinates?.[0],
        }));
        setResorts(mapped);
      }

      if (dangerRes.features) {
        const polygons = [];
        dangerRes.features.forEach((feature) => {
          if (!feature.geometry) return;
          const level = feature.properties?.danger_level;
          if (!level || level < 1 || level > 5) return;
          const coords = extractCoordinates(feature.geometry);
          coords.forEach((coordSet, idx) => {
            if (coordSet.length > 2) {
              polygons.push({
                id: `${feature.id || Math.random()}-${idx}`,
                coordinates: coordSet,
                dangerLevel: level,
              });
            }
          });
        });
        setDangerPolygons(polygons);
      }
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractCoordinates = (geometry) => {
    if (geometry.type === 'Polygon') {
      return [geometry.coordinates[0].map(([lng, lat]) => ({ latitude: lat, longitude: lng }))];
    }
    if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.map((polygon) =>
        polygon[0].map(([lng, lat]) => ({ latitude: lat, longitude: lng }))
      );
    }
    return [];
  };

  const handleMarkerPress = useCallback((resort) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedResort(resort);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedResort) {
      bottomSheetRef.current?.close();
      navigation.navigate('ResortDetail', { slug: selectedResort.slug });
    }
  }, [selectedResort, navigation]);

  const handleCloseSheet = useCallback(() => {
    setSelectedResort(null);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <TabHeader title={t('map.title')} />
        <SkeletonMap />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabHeader title={t('map.title')} />
      <MapView
        style={styles.map}
        initialRegion={SWITZERLAND_REGION}
        mapType="standard"
        showsUserLocation
        showsCompass
      >
        {dangerPolygons.map((polygon) => (
          <Polygon
            key={polygon.id}
            coordinates={polygon.coordinates}
            fillColor={getDangerColor(polygon.dangerLevel) + '66'}
            strokeColor={getDangerColor(polygon.dangerLevel)}
            strokeWidth={1}
          />
        ))}
        {resorts.map((resort) => (
          <Marker
            key={resort.id}
            coordinate={{ latitude: resort.latitude, longitude: resort.longitude }}
            onPress={() => handleMarkerPress(resort)}
          >
            <View style={[styles.marker, { backgroundColor: getDangerColor(resort.danger_level) }]}>
              <View style={styles.markerDot} />
            </View>
          </Marker>
        ))}
      </MapView>

      <MapLegend />

      {selectedResort && (
        <ResortBottomSheet
          ref={bottomSheetRef}
          resort={selectedResort}
          onViewDetails={handleViewDetails}
          onClose={handleCloseSheet}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.brandWhite,
  },
  markerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.brandWhite,
  },
});

export default MapScreen;
