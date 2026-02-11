import { createI18n } from 'vue-i18n';
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import it from './locales/it.json';

const messages = {
  de,
  en,
  fr,
  it
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
