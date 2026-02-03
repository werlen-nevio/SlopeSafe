<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <router-link to="/" class="footer-logo">
            <img src="/logo.png" alt="SlopeSafe" class="footer-logo-image" />
          </router-link>
          <p class="brand-description">{{ $t('footer.description') }}</p>
        </div>

        <div class="footer-links">
          <h4>{{ $t('footer.links') }}</h4>
          <ul>
            <li><router-link to="/">{{ $t('nav.home') }}</router-link></li>
            <li><router-link to="/map">{{ $t('nav.map') }}</router-link></li>
            <li v-if="isLoggedIn"><router-link to="/favorites">{{ $t('nav.favorites') }}</router-link></li>
            <li v-if="isLoggedIn"><router-link to="/alerts">{{ $t('nav.alerts') }}</router-link></li>
          </ul>
        </div>

        <div class="footer-info">
          <h4>{{ $t('footer.info') }}</h4>
          <p class="data-source">
            {{ $t('footer.dataSource') }}
            <a href="https://www.slf.ch" target="_blank" rel="noopener">SLF</a>
          </p>
          <p class="update-time" v-if="lastUpdate">
            {{ $t('footer.lastUpdate') }}: {{ formattedUpdateTime }}
          </p>
        </div>

        <div class="footer-contact">
          <h4>Stay Safe</h4>
          <p>Real-time avalanche data for Swiss ski resorts. Always check conditions before heading out.</p>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="copyright">&copy; {{ currentYear }} SlopeSafe. {{ $t('footer.rights') }}</p>
          <div class="footer-bottom-links">
            <span class="made-with">Made with care for skiers</span>
          </div>
        </div>
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
  color: #E2E8F0;
  margin-top: auto;
}

.footer-container {
  width: 100%;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: var(--spacing-2xl);
  padding: var(--spacing-3xl) var(--spacing-xl);
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.footer-logo {
  display: inline-block;
}

.footer-logo-image {
  height: 48px;
  width: auto;
  filter: brightness(0) invert(1);
}

.brand-description {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #94A3B8;
  max-width: 320px;
}

.footer-links h4,
.footer-info h4,
.footer-contact h4 {
  color: #FFFFFF;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-lg) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-links a {
  color: #94A3B8;
  text-decoration: none;
  font-size: 0.9375rem;
  transition: all var(--transition-base);
  display: inline-block;
}

.footer-links a:hover {
  color: var(--brand-sky-blue-light);
  transform: translateX(4px);
}

.footer-info p {
  font-size: 0.9375rem;
  color: #94A3B8;
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.6;
}

.footer-info .data-source a {
  color: var(--brand-sky-blue-light);
  font-weight: 500;
  text-decoration: none;
  transition: color var(--transition-base);
}

.footer-info .data-source a:hover {
  color: #FFFFFF;
}

.footer-contact p {
  font-size: 0.9375rem;
  color: #94A3B8;
  line-height: 1.7;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-lg) var(--spacing-xl);
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;
}

.made-with {
  font-size: 0.875rem;
  color: #64748B;
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    padding: var(--spacing-2xl) var(--spacing-lg);
  }

  .footer-brand {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .footer-brand {
    grid-column: span 1;
    text-align: center;
    align-items: center;
  }

  .brand-description {
    max-width: none;
  }

  .footer-links,
  .footer-info,
  .footer-contact {
    text-align: center;
  }

  .footer-links ul {
    align-items: center;
  }

  .footer-links a:hover {
    transform: none;
  }

  .footer-bottom {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }
}
</style>
