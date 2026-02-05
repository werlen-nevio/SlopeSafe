import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { theme } from '../../theme';

const Skeleton = ({ width, height, borderRadius = 6, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bone,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonResortCard = () => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardIdentity}>
        <Skeleton width={36} height={36} borderRadius={8} />
        <View style={{ flex: 1 }}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
        </View>
      </View>
      <Skeleton width={24} height={24} borderRadius={12} />
    </View>
    <View style={styles.cardBody}>
      <Skeleton width="50%" height={14} />
      <Skeleton width="30%" height={14} />
    </View>
  </View>
);

export const SkeletonResortList = ({ count = 5 }) => (
  <View style={styles.listContainer}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonResortCard key={i} />
    ))}
  </View>
);

export const SkeletonResortDetail = () => (
  <View style={styles.detailContainer}>
    {/* Header card */}
    <View style={styles.detailCard}>
      <Skeleton width="60%" height={24} />
      <Skeleton width="30%" height={14} style={{ marginTop: 8 }} />
    </View>

    {/* Danger card */}
    <View style={styles.detailCard}>
      <Skeleton width="50%" height={18} />
      <View style={{ alignItems: 'center', paddingVertical: 16 }}>
        <Skeleton width={180} height={48} borderRadius={12} />
      </View>
      <Skeleton width="100%" height={1} style={{ marginVertical: 8 }} />
      <Skeleton width="100%" height={20} style={{ marginTop: 6 }} />
      <Skeleton width="100%" height={20} style={{ marginTop: 6 }} />
      <Skeleton width="100%" height={20} style={{ marginTop: 6 }} />
    </View>

    {/* Info card */}
    <View style={styles.detailCard}>
      <Skeleton width="40%" height={18} />
      <Skeleton width="100%" height={20} style={{ marginTop: 12 }} />
      <Skeleton width="100%" height={20} style={{ marginTop: 8 }} />
      <Skeleton width="100%" height={20} style={{ marginTop: 8 }} />
    </View>
  </View>
);

export const SkeletonMap = () => (
  <View style={styles.mapContainer}>
    <Skeleton width="100%" height="100%" borderRadius={0} />
  </View>
);

const styles = StyleSheet.create({
  bone: {
    backgroundColor: theme.colors.border,
  },
  card: {
    backgroundColor: theme.colors.brandWhite,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  cardIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContainer: {
    padding: 16,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingTop: 12,
  },
  detailCard: {
    backgroundColor: theme.colors.brandWhite,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
});

export default Skeleton;
