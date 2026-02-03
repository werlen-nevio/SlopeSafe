<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-content">
        <router-link to="/" class="logo">
          <img src="/logo.png" alt="SlopeSafe" class="logo-image" />
        </router-link>

        <nav class="nav-menu" :class="{ 'nav-open': mobileMenuOpen }">
          <router-link to="/" class="nav-link" @click="closeMobileMenu">
            {{ $t('nav.home') }}
          </router-link>
          <router-link to="/map" class="nav-link" @click="closeMobileMenu">
            {{ $t('nav.map') }}
          </router-link>
          <router-link v-if="isLoggedIn" to="/favorites" class="nav-link" @click="closeMobileMenu">
            {{ $t('nav.favorites') }}
          </router-link>
          <router-link v-if="isLoggedIn" to="/alerts" class="nav-link" @click="closeMobileMenu">
            {{ $t('nav.alerts') }}
          </router-link>
        </nav>

        <div class="header-actions">
          <ThemeToggle />

          <select
            v-model="currentLocale"
            @change="changeLanguage"
            class="language-selector"
          >
            <option value="de">DE</option>
            <option value="fr">FR</option>
            <option value="it">IT</option>
            <option value="en">EN</option>
          </select>

          <div v-if="isLoggedIn" class="user-menu">
            <button @click="handleLogout" class="btn-logout">
              {{ $t('auth.logout') }}
            </button>
          </div>
          <div v-else class="auth-links">
            <router-link to="/login" class="btn-link">
              {{ $t('auth.login') }}
            </router-link>
            <router-link to="/register" class="btn-primary">
              {{ $t('auth.register') }}
            </router-link>
          </div>

          <button
            class="mobile-menu-btn"
            @click="toggleMobileMenu"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
          >
            <span class="hamburger" :class="{ 'is-active': mobileMenuOpen }">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import ThemeToggle from './ThemeToggle.vue';

const { locale, t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const currentLocale = ref(locale.value);
const isLoggedIn = computed(() => authStore.isLoggedIn);
const mobileMenuOpen = ref(false);

const changeLanguage = () => {
  locale.value = currentLocale.value;
  localStorage.setItem('locale', currentLocale.value);
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>

<style scoped>
.app-header {
  background-color: var(--header-background);
  border-bottom: 1px solid var(--header-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  box-shadow: 0 1px 3px var(--color-shadow);
}

.header-container {
  width: 100%;
  padding: 0 var(--spacing-xl);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xl);
  height: 72px;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-image {
  height: 48px;
  width: auto;
}

.nav-menu {
  display: flex;
  gap: var(--spacing-sm);
  flex: 1;
  justify-content: center;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-secondary);
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  position: relative;
}

.nav-link:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.nav-link.router-link-active {
  color: var(--color-accent);
  background-color: var(--color-accent-light);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.language-selector {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  background-color: var(--input-background);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.language-selector:hover {
  border-color: var(--color-primary);
}

.language-selector:focus {
  outline: none;
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px rgba(91, 164, 212, 0.2);
}

.auth-links {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-link {
  padding: var(--spacing-sm) var(--spacing-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.btn-link:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.btn-primary {
  padding: var(--spacing-sm) var(--spacing-lg);
  text-decoration: none;
  color: var(--button-text);
  background-color: var(--button-background);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.btn-primary:hover {
  background-color: var(--button-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 90, 44, 0.3);
}

.btn-logout {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: transparent;
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-logout:hover {
  background-color: var(--color-danger);
  color: #ffffff;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 24px;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--color-text-primary);
  transition: all var(--transition-base);
  border-radius: 2px;
}

.hamburger.is-active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.is-active span:nth-child(2) {
  opacity: 0;
}

.hamburger.is-active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

@media (max-width: 1024px) {
  .header-container {
    padding: 0 var(--spacing-md);
  }

  .nav-menu {
    gap: var(--spacing-xs);
  }

  .nav-link {
    padding: var(--spacing-sm);
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    height: 64px;
  }

  .logo-image {
    height: 40px;
  }

  .mobile-menu-btn {
    display: block;
    order: 3;
  }

  .nav-menu {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background-color: var(--header-background);
    flex-direction: column;
    padding: var(--spacing-lg);
    gap: var(--spacing-sm);
    border-bottom: 1px solid var(--header-border);
    box-shadow: 0 4px 12px var(--color-shadow);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-slow);
  }

  .nav-menu.nav-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    padding: var(--spacing-md);
    text-align: center;
    font-size: 1rem;
  }

  .header-actions {
    gap: var(--spacing-sm);
  }

  .auth-links {
    display: none;
  }

  .user-menu {
    display: none;
  }
}
</style>
