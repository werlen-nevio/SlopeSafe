import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import DangerLevelBadge from '../common/DangerLevelBadge';

const ResortBottomSheet = forwardRef(({ resort, onViewDetails, onClose }, ref) => {
  const { t } = useTranslation();
  const snapPoints = useMemo(() => ['25%'], []);

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      onClose?.();
    }
  }, [onClose]);

  if (!resort) return null;

  return (
    <BottomSheet
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{resort.name}</Text>
        <Text style={styles.meta}>{resort.canton}</Text>
        <View style={styles.badgeRow}>
          <DangerLevelBadge level={resort.danger_level} />
        </View>
        <TouchableOpacity style={styles.button} onPress={onViewDetails}>
          <Text style={styles.buttonText}>{t('common.viewDetails')}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.colors.brandWhite,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  indicator: {
    backgroundColor: theme.colors.border,
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  name: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: 'Inter_700Bold',
    color: theme.colors.textPrimary,
  },
  meta: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  badgeRow: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  button: {
    backgroundColor: theme.colors.brandOrange,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.brandWhite,
  },
});

export default ResortBottomSheet;
