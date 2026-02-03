import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DANGER_LEVELS } from '../constants/config';

const DangerBadge = ({ level }) => {
  if (!level || !DANGER_LEVELS[level]) {
    return (
      <View style={[styles.badge, styles.unknown]}>
        <Text style={styles.unknownText}>Unknown</Text>
      </View>
    );
  }

  const danger = DANGER_LEVELS[level];
  const backgroundColor = danger.color;
  const isDark = level >= 3;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <View style={[styles.levelCircle, isDark && styles.levelCircleDark]}>
        <Text style={[styles.levelNumber, isDark && styles.textDark]}>{level}</Text>
      </View>
      <Text style={[styles.levelName, isDark && styles.textDark]}>{danger.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8
  },
  unknown: {
    backgroundColor: '#e0e0e0'
  },
  levelCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  levelCircleDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  levelName: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#1a1a1a'
  },
  textDark: {
    color: '#ffffff'
  },
  unknownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666'
  }
});

export default DangerBadge;
