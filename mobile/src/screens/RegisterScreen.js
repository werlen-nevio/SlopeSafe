import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const { register, loading } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert('Error', t('auth.passwordMismatch'));
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', t('auth.passwordPlaceholder'));
      return;
    }
    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation });
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Please try again');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>SlopeSafe</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('auth.createAccount')}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.name')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.namePlaceholder')}
              placeholderTextColor={theme.colors.textTertiary}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={theme.colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={theme.colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              placeholderTextColor={theme.colors.textTertiary}
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('auth.creatingAccount') : t('auth.register')}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.hasAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: theme.colors.brandNavy,
  },
  formContainer: {
    backgroundColor: theme.colors.brandWhite,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    ...theme.shadows.cardElevated,
  },
  title: {
    fontSize: theme.typography.sizes['2xl'],
    fontFamily: 'Inter_700Bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_400Regular',
    backgroundColor: theme.colors.brandWhite,
    color: theme.colors.textPrimary,
  },
  button: {
    backgroundColor: theme.colors.brandOrange,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.brandWhite,
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
  },
  link: {
    color: theme.colors.brandSkyBlue,
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default RegisterScreen;
