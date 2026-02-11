import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { theme, getDangerColor } from '../../theme';
import { historicalApi } from '../../api/historical';
import DangerLevelBadge from '../common/DangerLevelBadge';
import TrendIndicator from '../common/TrendIndicator';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, getDangerLevelName } from '../../utils/formatters';

const TIME_OPTIONS = [
  { key: 7, label: '7d' },
  { key: 14, label: '14d' },
  { key: 30, label: '30d' },
];

const CHART_HEIGHT = 150;
const CHART_PADDING = { top: 12, right: 12, bottom: 28, left: 28 };

const DangerChart = ({ data }) => {
  const screenWidth = Dimensions.get('window').width - 64;
  const chartWidth = screenWidth - CHART_PADDING.left - CHART_PADDING.right;
  const chartHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  if (!data || data.length === 0) return null;

  // Ensure chronological order: oldest on left, newest on right
  const sorted = [...data].sort((a, b) => {
    const dateA = a.date || a.valid_from || '';
    const dateB = b.date || b.valid_from || '';
    return dateA.localeCompare(dateB);
  });

  const points = sorted.map((item, i) => {
    const level = item.danger_level_max || item.danger_level || 0;
    const x = CHART_PADDING.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = CHART_PADDING.top + chartHeight - (level / 5) * chartHeight;
    return { x, y, level };
  });

  // Build smooth line path using cubic bezier curves
  const linePath = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + point.x) / 2;
    return `${path} C ${cpx} ${prev.y}, ${cpx} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  // Build area path (line + close to bottom)
  const bottomY = CHART_PADDING.top + chartHeight;
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;

  // Y-axis levels
  const yLevels = [1, 2, 3, 4, 5];

  // X-axis labels (show first, middle, last)
  const xLabels = [];
  if (sorted.length > 0) {
    const indices = sorted.length <= 3
      ? sorted.map((_, i) => i)
      : [0, Math.floor(sorted.length / 2), sorted.length - 1];
    indices.forEach((idx) => {
      const item = sorted[idx];
      const dateStr = item.date || item.valid_from;
      if (dateStr) {
        xLabels.push({ x: points[idx].x, label: formatDate(dateStr, 'dd.MM') });
      }
    });
  }

  return (
    <Svg width={screenWidth} height={CHART_HEIGHT}>
      <Defs>
        <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.colors.brandSkyBlue} stopOpacity="0.3" />
          <Stop offset="1" stopColor={theme.colors.brandSkyBlue} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>

      {/* Horizontal grid lines */}
      {yLevels.map((level) => {
        const y = CHART_PADDING.top + chartHeight - (level / 5) * chartHeight;
        return (
          <React.Fragment key={level}>
            <Line
              x1={CHART_PADDING.left}
              y1={y}
              x2={CHART_PADDING.left + chartWidth}
              y2={y}
              stroke={theme.colors.borderLight}
              strokeWidth={1}
              strokeDasharray="4,3"
            />
            <SvgText
              x={CHART_PADDING.left - 6}
              y={y + 4}
              fontSize={10}
              fill={theme.colors.textTertiary}
              textAnchor="end"
            >
              {level}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* Area fill */}
      <Path d={areaPath} fill="url(#areaGradient)" />

      {/* Line */}
      <Path
        d={linePath}
        fill="none"
        stroke={theme.colors.brandNavy}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points colored by danger level */}
      {points.map((point, i) => (
        <Circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={5}
          fill={getDangerColor(point.level)}
          stroke={theme.colors.brandWhite}
          strokeWidth={2}
        />
      ))}

      {/* X-axis labels */}
      {xLabels.map((item, i) => (
        <SvgText
          key={i}
          x={item.x}
          y={CHART_HEIGHT - 4}
          fontSize={10}
          fill={theme.colors.textTertiary}
          textAnchor="middle"
        >
          {item.label}
        </SvgText>
      ))}
    </Svg>
  );
};

const HistoricalTimeline = ({ slug }) => {
  const { t } = useTranslation();
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug, days]);

  useEffect(() => {
    loadTrend();
  }, [slug]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await historicalApi.getHistory(slug, days);
      if (response.success) {
        setData(response.history || response.data || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrend = async () => {
    try {
      const response = await historicalApi.getTrend(slug);
      if (response.success) {
        setTrend(response.trend);
      }
    } catch (err) {
      console.error('Failed to load trend:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t('historical.title')}</Text>
        {trend && <TrendIndicator trend={trend} />}
      </View>

      <View style={styles.timeSelector}>
        {TIME_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.timeOption, days === option.key && styles.timeOptionActive]}
            onPress={() => setDays(option.key)}
          >
            <Text style={[styles.timeOptionText, days === option.key && styles.timeOptionTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner message={false} size="small" />
        </View>
      ) : data && data.length > 0 ? (
        <>
          <DangerChart data={data} />

          <Text style={styles.recentTitle}>{t('historical.recentChanges')}</Text>
          {data.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.changeItem}>
              <Text style={styles.changeDate}>
                {formatDate(item.date || item.valid_from)}
              </Text>
              <DangerLevelBadge level={item.danger_level_max || item.danger_level} compact />
              <Text style={styles.changeLevel}>
                {getDangerLevelName(item.danger_level_max || item.danger_level, t)}
              </Text>
            </View>
          ))}
        </>
      ) : (
        <Text style={styles.noData}>{t('home.noResorts')}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.brandWhite,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
  },
  timeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeOptionActive: {
    backgroundColor: theme.colors.brandNavy,
    borderColor: theme.colors.brandNavy,
  },
  timeOptionText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textSecondary,
  },
  timeOptionTextActive: {
    color: theme.colors.brandWhite,
  },
  loadingContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
  },
  recentTitle: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    marginTop: 12,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    gap: 10,
  },
  changeDate: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
    width: 80,
  },
  changeLevel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  noData: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default HistoricalTimeline;
