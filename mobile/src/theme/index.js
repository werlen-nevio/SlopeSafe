export const theme = {
  colors: {
    // Brand Colors
    brandNavy: '#1B3B5F',
    brandNavyDark: '#132840',
    brandNavyLight: '#2A4F7A',
    brandSkyBlue: '#5BA4D4',
    brandSkyBlueLight: '#7DBDE6',
    brandSkyBlueDark: '#4891C2',
    brandOrange: '#E85A2C',
    brandOrangeDark: '#D04820',
    brandOrangeLight: '#F07048',
    brandYellow: '#F7B731',
    brandWhite: '#FFFFFF',

    // Semantic
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    backgroundTertiary: '#F1F5F9',
    textPrimary: '#1B3B5F',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    primary: '#1B3B5F',
    accent: '#E85A2C',
    success: '#10B981',
    warning: '#F7B731',
    danger: '#EF4444',
    info: '#5BA4D4',

    // Danger Levels
    danger1: '#CCFF66',
    danger2: '#FFFF00',
    danger3: '#FF9900',
    danger4: '#FF0000',
    danger5: '#9D0000',
    danger1Text: '#1B3B5F',
    danger2Text: '#1B3B5F',
    danger3Text: '#1B3B5F',
    danger4Text: '#FFFFFF',
    danger5Text: '#FFFFFF',

    // Tab bar
    tabBarActive: '#1B3B5F',
    tabBarInactive: '#94A3B8',

    // Favorite
    favoriteActive: '#F7B731',
    favoriteInactive: '#CBD5E1',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  shadows: {
    card: {
      shadowColor: '#1B3B5F',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    cardElevated: {
      shadowColor: '#1B3B5F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      shadowColor: '#1B3B5F',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};

export const getDangerColor = (level) => {
  const colors = {
    1: theme.colors.danger1,
    2: theme.colors.danger2,
    3: theme.colors.danger3,
    4: theme.colors.danger4,
    5: theme.colors.danger5,
  };
  return colors[level] || '#E0E0E0';
};

export const getDangerTextColor = (level) => {
  const colors = {
    1: theme.colors.danger1Text,
    2: theme.colors.danger2Text,
    3: theme.colors.danger3Text,
    4: theme.colors.danger4Text,
    5: theme.colors.danger5Text,
  };
  return colors[level] || '#666666';
};

export const getWeatherIcon = (condition) => {
  const icons = {
    clear: '☀️',
    clouds: '☁️',
    rain: '🌧️',
    drizzle: '🌦️',
    thunderstorm: '⛈️',
    snow: '🌨️',
    mist: '🌫️',
    fog: '🌫️',
    haze: '🌫️',
  };
  return icons[condition] || '🌤️';
};
