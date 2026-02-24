<template>
  <Transition name="cookie-banner">
    <div v-if="visible" class="cookie-banner">
      <div class="cookie-banner-header">
        <svg class="cookie-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
          <path d="M8.5 8.5v.01" />
          <path d="M16 15.5v.01" />
          <path d="M12 12v.01" />
          <path d="M11 17v.01" />
          <path d="M7 14v.01" />
        </svg>
        <h3>{{ $t('cookie.title') }}</h3>
      </div>

      <p class="cookie-banner-text">
        {{ $t('cookie.message') }}
      </p>

      <div class="cookie-banner-links">
        <router-link to="/privacy" class="cookie-link">{{ $t('cookie.privacyLink') }}</router-link>
        <span class="cookie-link-sep">|</span>
        <router-link to="/imprint" class="cookie-link">{{ $t('cookie.imprintLink') }}</router-link>
      </div>

      <div class="cookie-banner-actions">
        <button class="cookie-btn cookie-btn-decline" @click="decline">
          {{ $t('cookie.decline') }}
        </button>
        <button class="cookie-btn cookie-btn-accept" @click="accept">
          {{ $t('cookie.accept') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'slopesafe_cookie_consent';
const visible = ref(false);

onMounted(() => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    visible.value = true;
  }
});

const accept = () => {
  localStorage.setItem(STORAGE_KEY, 'accepted');
  visible.value = false;
};

const decline = () => {
  localStorage.setItem(STORAGE_KEY, 'declined');
  visible.value = false;
};
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: var(--z-overlay, 500);
  width: 360px;
  background: #ffffff;
  border-radius: var(--radius-xl, 1rem);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border, #e5e7eb);
}

.cookie-banner-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.cookie-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: var(--color-orange, #E85A2C);
}

.cookie-banner-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary, #1a1a1a);
  margin: 0;
}

.cookie-banner-text {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-text-secondary, #6b7280);
  margin: 0 0 var(--spacing-md) 0;
}

.cookie-banner-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.cookie-link {
  font-size: 0.8125rem;
  color: var(--color-accent, #5BA4D4);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-base);
}

.cookie-link:hover {
  color: var(--color-navy, #1B3B5F);
  text-decoration: underline;
}

.cookie-link-sep {
  color: var(--color-text-tertiary, #d1d5db);
  font-size: 0.75rem;
}

.cookie-banner-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.cookie-btn {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: var(--radius-md, 0.5rem);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 40px;
  border: none;
}

.cookie-btn-decline {
  background: var(--color-background-secondary, #f3f4f6);
  color: var(--color-text-secondary, #6b7280);
}

.cookie-btn-decline:hover {
  background: #e5e7eb;
  color: var(--color-text-primary, #1a1a1a);
}

.cookie-btn-accept {
  background: var(--color-orange, #E85A2C);
  color: #ffffff;
}

.cookie-btn-accept:hover {
  background: #d14e24;
  box-shadow: 0 4px 12px rgba(232, 90, 44, 0.25);
}

/* Transition */
.cookie-banner-enter-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.cookie-banner-leave-active {
  transition: transform 0.25s ease-in, opacity 0.2s ease;
}

.cookie-banner-enter-from {
  transform: translateY(20px) scale(0.96);
  opacity: 0;
}

.cookie-banner-leave-to {
  transform: translateY(10px) scale(0.98);
  opacity: 0;
}

@media (max-width: 480px) {
  .cookie-banner {
    bottom: var(--spacing-sm);
    right: var(--spacing-sm);
    left: var(--spacing-sm);
    width: auto;
    padding: var(--spacing-lg);
  }
}
</style>
