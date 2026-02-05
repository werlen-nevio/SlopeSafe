import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

const InAppNotification = ({ notification, onPress, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (notification) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();

      const timer = setTimeout(() => {
        dismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  };

  if (!notification) return null;

  const content = notification.request?.content;
  const title = content?.title || 'SlopeSafe';
  const body = content?.body || '';

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top + 8, transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={20} color={theme.colors.brandWhite} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.body} numberOfLines={2}>{body}</Text>
        </View>
        <TouchableOpacity onPress={dismiss} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={theme.colors.brandWhite} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: theme.colors.brandNavy,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.brandOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.brandWhite,
  },
  body: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
});

export default InAppNotification;
