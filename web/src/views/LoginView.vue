<template>
  <div class="login-view">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <router-link to="/" class="auth-logo">
            <img src="/logo.png" alt="SlopeSafe" class="auth-logo-image" />
          </router-link>
          <h1>{{ $t('auth.login') }}</h1>
          <p class="auth-subtitle">Welcome back to SlopeSafe</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="email">{{ $t('auth.email') }}</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              :placeholder="$t('auth.emailPlaceholder')"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="password">{{ $t('auth.password') }}</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              :placeholder="$t('auth.passwordPlaceholder')"
              class="form-input"
            />
          </div>

          <div v-if="error" class="error-message">
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn-submit"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? $t('common.loading') : $t('auth.login') }}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            {{ $t('auth.noAccount') }}
            <router-link to="/register">{{ $t('auth.register') }}</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: ''
});

const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

const handleLogin = async () => {
  try {
    await authStore.login(form.value);
    router.push('/');
  } catch (err) {
    console.error('Login failed:', err);
  }
};
</script>

<style scoped>
.login-view {
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background) 100%);
  padding: var(--spacing-xl);
}

.auth-container {
  width: 100%;
  max-width: 440px;
}

.auth-card {
  background: var(--card-background);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--card-shadow-hover);
  border: 1px solid var(--color-border);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.auth-logo {
  display: inline-block;
  margin-bottom: var(--spacing-lg);
}

.auth-logo-image {
  height: 56px;
  width: auto;
}

.auth-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.auth-subtitle {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
}

.form-input {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  background-color: var(--input-background);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: all var(--transition-base);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.form-input:hover {
  border-color: var(--color-primary);
}

.form-input:focus {
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px rgba(91, 164, 212, 0.2);
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-accent-light);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 0.875rem;
}

.error-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background-color: var(--button-background);
  color: var(--button-text);
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  margin-top: var(--spacing-sm);
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--button-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 90, 44, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.auth-footer p {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.auth-footer a {
  color: var(--color-accent);
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-base);
}

.auth-footer a:hover {
  color: var(--color-accent-hover);
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-view {
    padding: var(--spacing-md);
  }

  .auth-card {
    padding: var(--spacing-xl);
  }
}
</style>
