import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import HomeView from '@/views/HomeView.vue';
import ResortDetailView from '@/views/ResortDetailView.vue';
import FavoritesView from '@/views/FavoritesView.vue';
import MapView from '@/views/MapView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import AlertRulesView from '@/views/AlertRulesView.vue';
import EmbedView from '@/views/EmbedView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home' }
  },
  {
    path: '/resorts/:slug',
    name: 'resort-detail',
    component: ResortDetailView,
    meta: { title: 'Resort Details' }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: FavoritesView,
    meta: { requiresAuth: true, title: 'Favorites' }
  },
  {
    path: '/map',
    name: 'map',
    component: MapView,
    meta: { title: 'Map' }
  },
  {
    path: '/alerts',
    name: 'alerts',
    component: AlertRulesView,
    meta: { requiresAuth: true, title: 'Alert Rules' }
  },
  {
    path: '/embed',
    name: 'embed',
    component: EmbedView,
    meta: { title: 'Embed Widget' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guest: true, title: 'Login' }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guest: true, title: 'Register' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Update document title
  document.title = `${to.meta.title || 'SlopeSafe'} - ${import.meta.env.VITE_APP_NAME || 'SlopeSafe'}`;

  // Check authentication
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.meta.guest && authStore.isLoggedIn) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
