import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import DangerBadge from './DangerBadge';

const ResortCard = ({ resort, onPress }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const favorite = isAuthenticated && isFavorite(resort.id);

  const handleFavoritePress = (e) => {
    e.stopPropagation();
    if (isAuthenticated) {
      toggleFavorite(resort.id);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{resort.name}</Text>
          <Text style={styles.meta}>{resort.canton}</Text>
        </View>
        {isAuthenticated && (
          <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteButton}>
            <Text style={styles.favoriteIcon}>{favorite ? '★' : '☆'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Elevation:</Text>
        <Text style={styles.value}>{resort.elevation_min}m - {resort.elevation_max}m</Text>
      </View>

      <View style={styles.dangerContainer}>
        <DangerBadge level={resort.danger_level} />
      </View>

      {resort.last_updated && (
        <Text style={styles.updated}>
          Updated: {new Date(resort.last_updated).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  meta: {
    fontSize: 14,
    color: '#6b7280'
  },
  favoriteButton: {
    padding: 4
  },
  favoriteIcon: {
    fontSize: 24,
    color: '#fbbf24'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280'
  },
  value: {
    fontSize: 14,
    color: '#1f2937'
  },
  dangerContainer: {
    alignItems: 'center',
    marginVertical: 8
  },
  updated: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8
  }
});

export default ResortCard;
