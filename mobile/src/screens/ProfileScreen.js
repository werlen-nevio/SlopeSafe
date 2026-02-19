import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';
import MiniGame from '../components/MiniGame';
import { theme } from '../theme';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [showGame, setShowGame] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  const handleVersionTap = () => {
    tapCount.current++;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 7) {
      tapCount.current = 0;
      setShowGame(true);
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.logout'), style: 'destructive', onPress: logout },
      ]
    );
  };

  const menuItems = [
    { icon: 'notifications-outline', label: t('profile.alertRules'), screen: 'AlertRules' },
    { icon: 'time-outline', label: t('profile.notificationHistory'), screen: 'NotificationHistory' },
    { icon: 'language-outline', label: t('profile.language'), screen: 'LanguagePicker' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
            onPress={() => navigation.navigate(item.screen)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={20} color={theme.colors.textSecondary} />
              <Text style={styles.menuText}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={handleVersionTap} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.menuText}>{t('profile.about')}</Text>
          </View>
          <Text style={styles.versionText}>v{APP_VERSION}</Text>
        </TouchableOpacity>
      </View>

      <MiniGame visible={showGame} onClose={() => setShowGame(false)} />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} accessibilityRole="button" accessibilityLabel={t('auth.logout')}>
        <Ionicons name="log-out-outline" size={20} color={theme.colors.brandWhite} />
        <Text style={styles.logoutText}>{t('auth.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    backgroundColor: theme.colors.brandNavy,
    paddingHorizontal: 28,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.brandSkyBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    color: theme.colors.brandWhite,
  },
  name: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: 'Inter_700Bold',
    color: theme.colors.brandWhite,
    marginBottom: 4,
  },
  email: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.brandSkyBlueLight,
  },
  section: {
    backgroundColor: theme.colors.brandWhite,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textPrimary,
  },
  versionText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textTertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    padding: 16,
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.lg,
  },
  logoutText: {
    color: theme.colors.brandWhite,
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default ProfileScreen;
