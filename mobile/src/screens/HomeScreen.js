import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useResorts } from '../contexts/ResortsContext';
import { useLocation } from '../contexts/LocationContext';
import { useDebounce } from '../hooks/useDebounce';
import { calculateDistance } from '../utils/distance';
import ResortCard from '../components/ResortCard';
import SearchBar from '../components/common/SearchBar';
import SortSelector from '../components/common/SortSelector';
import { SkeletonResortList } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { theme } from '../theme';

const HomeScreen = ({ navigation }) => {
  const { resorts, searchResults, loading, isOffline, fetchResorts, searchResorts, clearSearch } = useResorts();
  const { userLocation, locationPermission, requestLocation } = useLocation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchResorts();
  }, []);

  useEffect(() => {
    if (sortBy !== null) return;
    if (locationPermission === 'granted' && userLocation) {
      setSortBy('distance');
    } else if (locationPermission !== null) {
      setSortBy('name');
    }
  }, [locationPermission, userLocation]);

  // Fallback if permission check takes too long
  useEffect(() => {
    if (sortBy !== null) return;
    const timeout = setTimeout(() => setSortBy((prev) => prev ?? 'name'), 2000);
    return () => clearTimeout(timeout);
  }, [sortBy]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchResorts(debouncedQuery);
    } else {
      clearSearch();
    }
  }, [debouncedQuery]);

  const handleSortChange = async (sort) => {
    setSortBy(sort);
    if (sort === 'distance' && !userLocation) {
      await requestLocation();
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchResorts();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const displayResorts = searchQuery ? searchResults : resorts;

  const sortedResorts = React.useMemo(() => {
    const list = [...displayResorts];
    switch (sortBy) {
      case 'name':
        return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'danger':
        return list.sort((a, b) => (b.danger_level || 0) - (a.danger_level || 0));
      case 'canton':
        return list.sort((a, b) => (a.canton || '').localeCompare(b.canton || ''));
      case 'distance':
        if (userLocation) {
          return list.sort((a, b) => {
            const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.coordinates?.lat, a.coordinates?.lng);
            const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.coordinates?.lat, b.coordinates?.lng);
            return distA - distB;
          });
        }
        return list;
      default:
        return list;
    }
  }, [displayResorts, sortBy, userLocation]);

  const renderItem = ({ item }) => (
    <ResortCard
      resort={item}
      onPress={() => navigation.navigate('ResortDetail', { slug: item.slug })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.heroTitle}>{t('home.title')}</Text>
        <Text style={styles.heroSubtitle}>{t('home.subtitle')}</Text>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color={theme.colors.brandWhite} />
          <Text style={styles.offlineText}>{t('home.offline')}</Text>
        </View>
      )}

      <SortSelector activeSort={sortBy} onSortChange={handleSortChange} />

      {loading && resorts.length === 0 ? (
        <SkeletonResortList />
      ) : (
        <FlatList
          data={sortedResorts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.brandNavy}
              colors={[theme.colors.brandNavy]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title={t('home.noResorts')}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  hero: {
    backgroundColor: theme.colors.brandNavy,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  heroTitle: {
    fontSize: theme.typography.sizes['2xl'],
    fontFamily: 'Inter_700Bold',
    color: theme.colors.brandWhite,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.brandSkyBlueLight,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.warning,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  offlineText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.brandWhite,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
});

export default HomeScreen;
