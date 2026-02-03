import { createI18n } from 'vue-i18n';
import de from './locales/de.json';
import en from './locales/en.json';

const messages = {
  de,
  en,
  fr: en, // Placeholder, use English translations for now
  it: en  // Placeholder, use English translations for now
};

const savedLocale = localStorage.getItem('locale') || import.meta.env.VITE_DEFAULT_LANGUAGE || 'de';

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages,
  globalInjection: true
});

export default i18n;
