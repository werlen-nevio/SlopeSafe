<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-left">
          <router-link to="/" class="footer-logo">
            <img src="/logo_shield.png" alt="SlopeSafe" class="footer-logo-image" />
          </router-link>
        </div>

        <div class="footer-center">
          <p class="footer-tagline">{{ $t('footer.description') }}</p>
        </div>

        <div class="footer-right">
          <p class="footer-credit">
            {{ $t('footer.dataSource') }}
            <a href="https://www.slf.ch" target="_blank" rel="noopener">SLF</a>
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">&copy; {{ currentYear }} SlopeSafe</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const currentYear = new Date().getFullYear();
const lastUpdate = computed(() => null);

const formattedUpdateTime = computed(() => {
  if (!lastUpdate.value) return '';
  return new Date(lastUpdate.value).toLocaleString();
});
</script>

<style scoped>
.app-footer {
  background-color: var(--brand-navy);
  color: #94A3B8;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) 0;
  gap: var(--spacing-lg);
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex: 1;
}

.footer-center {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.footer-right {
  justify-content: flex-end;
}

.footer-logo {
  display: flex;
  align-items: center;
}

.footer-logo-image {
  height: 36px;
  width: auto;
}

.footer-divider {
  width: 1px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.15);
  align-self: center;
}

.footer-tagline {
  font-size: 0.875rem;
  color: #CBD5E1;
  margin: 0;
  height: 20px;
  line-height: 20px;
}

.footer-nav {
  display: flex;
  gap: var(--spacing-lg);
}

.footer-nav a {
  color: #94A3B8;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color var(--transition-base);
}

.footer-nav a:hover {
  color: #FFFFFF;
}

.footer-credit {
  font-size: 0.875rem;
  color: #CBD5E1;
  margin: 0;
  height: 20px;
  line-height: 20px;
}

.footer-credit a {
  color: var(--brand-sky-blue-light);
  text-decoration: none;
  transition: color var(--transition-base);
}

.footer-credit a:hover {
  color: #FFFFFF;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: var(--spacing-md) 0;
  text-align: center;
}

.copyright {
  font-size: 0.8125rem;
  color: #94A3B8;
  margin: 0;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg) 0;
  }

  .footer-left,
  .footer-center,
  .footer-right {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .footer-divider {
    display: none;
  }

  .footer-nav {
    gap: var(--spacing-md);
  }
}
</style>
