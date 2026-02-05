import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../contexts/FavoritesContext';
import ResortCard from '../components/ResortCard';
import TabHeader from '../components/common/TabHeader';
import { SkeletonResortList } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { theme } from '../theme';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { favorites, loading, fetchFavorites } = useFavorites();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFavorites();
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading && favorites.length === 0) {
    return (
      <View style={styles.container}>
        <TabHeader title={t('favorites.title')} />
        <SkeletonResortList count={4} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabHeader title={t('favorites.title')} />
      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <ResortCard
            resort={item}
            onPress={() => navigation.navigate('ResortDetail', { slug: item.slug })}
          />
        )}
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
            icon="heart-outline"
            title={t('favorites.noFavorites')}
            actionLabel={t('favorites.browseResorts')}
            onAction={() => navigation.navigate('HomeTab')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
});

export default FavoritesScreen;
