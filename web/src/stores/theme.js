import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'light', // 'light' or 'dark'
  }),

  getters: {
    isDark: (state) => state.currentTheme === 'dark',
    isLight: (state) => state.currentTheme === 'light',
  },

  actions: {
    setTheme(theme) {
      if (theme !== 'light' && theme !== 'dark') {
        console.error('Invalid theme:', theme);
        return;
      }

      this.currentTheme = theme;

      // Update localStorage
      localStorage.setItem('theme', theme);

      // Update DOM
      document.documentElement.setAttribute('data-theme', theme);
    },

    toggleTheme() {
      const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    },

    initializeTheme() {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme');

      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        this.setTheme(savedTheme);
        return;
      }

      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          // Only update if user hasn't manually set a preference
          if (!localStorage.getItem('theme')) {
            this.setTheme(e.matches ? 'dark' : 'light');
          }
        });
    },

    resetToSystemPreference() {
      localStorage.removeItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }
});
