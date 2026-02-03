import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useResorts } from '../contexts/ResortsContext';
import { useFavorites } from '../contexts/FavoritesContext';
import DangerBadge from '../components/DangerBadge';

const ResortDetailScreen = ({ route }) => {
  const { slug } = route.params;
  const { currentResort, loading, fetchResortBySlug } = useResorts();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchResortBySlug(slug);
  }, [slug]);

  if (loading || !currentResort) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const favorite = isFavorite(currentResort.id);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{currentResort.name}</Text>
          <Text style={styles.meta}>{currentResort.canton} • {currentResort.region}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(currentResort.id)}>
          <Text style={styles.favoriteIcon}>{favorite ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Danger Level</Text>
        <View style={styles.dangerContainer}>
          <DangerBadge level={currentResort.danger_level} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resort Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Elevation Range:</Text>
          <Text style={styles.value}>{currentResort.elevation_min}m - {currentResort.elevation_max}m</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Canton:</Text>
          <Text style={styles.value}>{currentResort.canton}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  meta: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },
  favoriteIcon: {
    fontSize: 32,
    color: '#fbbf24'
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12
  },
  dangerContainer: {
    alignItems: 'center',
    paddingVertical: 8
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280'
  },
  value: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500'
  }
});

export default ResortDetailScreen;
