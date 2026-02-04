<script setup>
import { onMounted } from 'vue';
import AppHeader from './components/common/AppHeader.vue'
import AppFooter from './components/common/AppFooter.vue'
import { useAuthStore } from './stores/auth';
import { useFavoritesStore } from './stores/favorites';

const authStore = useAuthStore();
const favoritesStore = useFavoritesStore();

onMounted(async () => {
  authStore.initializeFromStorage();

  // Load favorites if user is logged in
  if (authStore.isLoggedIn) {
    try {
      await favoritesStore.fetchFavorites();
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }
});
</script>

<template>
  <div id="app" class="app-container">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<style>
@import './assets/themes.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

body {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
