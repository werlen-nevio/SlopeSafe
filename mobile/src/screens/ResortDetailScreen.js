import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useResorts } from '../contexts/ResortsContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useWeather } from '../contexts/WeatherContext';
import DangerLevelBadge from '../components/common/DangerLevelBadge';
import { SkeletonResortDetail } from '../components/common/Skeleton';
import WeatherWidget from '../components/resort/WeatherWidget';
import AvalancheProblemCard from '../components/resort/AvalancheProblemCard';
import HistoricalTimeline from '../components/resort/HistoricalTimeline';
import MiniMap from '../components/resort/MiniMap';
import { theme } from '../theme';
import { formatCoordinates, formatRelativeDate } from '../utils/formatters';

const ResortDetailScreen = ({ route, navigation }) => {
  const { slug } = route.params;
  const { currentResort, loading, fetchResortBySlug } = useResorts();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { weatherData, fetchWeather, clearWeather } = useWeather();
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const favorite = isAuthenticated && currentResort && isFavorite(currentResort.id);

  const handleFavoritePress = useCallback(() => {
    if (!isAuthenticated || !currentResort) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(currentResort.id);
  }, [isAuthenticated, currentResort]);

  const handleShare = useCallback(async () => {
    if (!currentResort) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: t('resort.shareMessage', {
          name: currentResort.name,
          level: currentResort.danger_level || '?',
          url: `https://slopesafe.ch/resorts/${slug}`,
        }),
      });
    } catch (err) {}
  }, [currentResort, slug]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: currentResort?.name || '',
      headerStyle: { backgroundColor: theme.colors.brandWhite },
      headerTintColor: theme.colors.brandNavy,
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel={t('resort.share')}
          >
            <Ionicons name="share-outline" size={22} color={theme.colors.brandNavy} />
          </TouchableOpacity>
          {isAuthenticated && (
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={styles.headerBtn}
              accessibilityRole="button"
              accessibilityLabel={favorite ? t('favorites.remove') : t('favorites.add')}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? theme.colors.favoriteActive : theme.colors.brandNavy}
              />
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, currentResort, isAuthenticated, favorite, handleShare, handleFavoritePress]);

  useEffect(() => {
    loadData();
    return () => clearWeather();
  }, [slug]);

  const loadData = async () => {
    try {
      const resortRes = await fetchResortBySlug(slug);
      if (resortRes?.resort?.current_status) {
        setStatus(resortRes.resort.current_status);
      }
      fetchWeather(slug).catch(() => {});
    } catch (err) {
      console.error('Failed to load resort:', err);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [slug]);

  if (loading || !currentResort) {
    return <SkeletonResortDetail />;
  }

  const resort = currentResort;
  const problems = status?.avalanche_problems || resort.avalanche_problems || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brandNavy} />
      }
    >
      {/* Current Danger */}
      {status && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('resort.currentStatus')}</Text>
          <View style={styles.currentLevelRow}>
            <DangerLevelBadge level={resort.danger_level || status.danger_level_max} />
          </View>
        </View>
      )}

      {/* Avalanche Problems */}
      {problems.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('resort.avalancheProblems')}</Text>
          <View style={styles.problemsList}>
            {problems.map((problem, index) => (
              <AvalancheProblemCard key={index} problem={problem} />
            ))}
          </View>
        </View>
      )}

      {/* Weather */}
      <View style={styles.section}>
        <WeatherWidget weather={weatherData} />
      </View>

      {/* Resort Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('resort.info')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('resort.elevationMin')}</Text>
          <Text style={styles.infoValue}>{resort.elevation_min}m</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('resort.elevationMax')}</Text>
          <Text style={styles.infoValue}>{resort.elevation_max}m</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('resort.coordinates')}</Text>
          <Text style={styles.infoValue}>{formatCoordinates(resort.latitude, resort.longitude)}</Text>
        </View>
      </View>

      {/* Mini Map */}
      {resort.latitude && resort.longitude && (
        <View style={styles.section}>
          <MiniMap
            latitude={resort.latitude}
            longitude={resort.longitude}
            dangerLevel={resort.danger_level}
            slug={slug}
          />
        </View>
      )}

      {/* Historical Timeline */}
      <View style={styles.section}>
        <HistoricalTimeline slug={slug} />
      </View>

      {/* Last Updated */}
      {resort.last_updated && (
        <Text style={styles.lastUpdated}>
          {t('resort.lastUpdated')}: {formatRelativeDate(resort.last_updated)}
        </Text>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const DetailRow = ({ label, level }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <DangerLevelBadge level={level} compact />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    padding: 6,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.brandWhite,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.card,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.brandNavy,
  },
  currentLevelRow: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
  },
  problemsList: {
    gap: 8,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textPrimary,
  },
  lastUpdated: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ResortDetailScreen;
