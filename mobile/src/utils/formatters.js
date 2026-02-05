import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';

const locales = { de, en: enUS, fr, it };

export const formatDate = (date, formatStr = 'dd.MM.yyyy', lang = 'de') => {
  if (!date) return '';
  return format(new Date(date), formatStr, { locale: locales[lang] || locales.de });
};

export const formatRelativeDate = (date, lang = 'de') => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: locales[lang] || locales.de,
  });
};

export const formatDayLabel = (date, t) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return t('weather.today');
  if (isTomorrow(d)) return t('weather.tomorrow');
  return format(d, 'EEE', { locale: locales.de });
};

export const formatElevation = (min, max) => {
  if (min && max) return `${min}m - ${max}m`;
  if (min) return `${min}m`;
  if (max) return `${max}m`;
  return '-';
};

export const getDangerLevelName = (level, t) => {
  const names = {
    1: t('danger.low'),
    2: t('danger.moderate'),
    3: t('danger.considerable'),
    4: t('danger.high'),
    5: t('danger.veryHigh'),
  };
  return names[level] || t('danger.unknown');
};

export const getAvalancheTypeName = (type, t) => {
  return t(`avalancheTypes.${type}`, t('avalancheTypes.unknown'));
};

export const formatCoordinates = (lat, lng) => {
  if (!lat || !lng) return '-';
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};
