import apiClient from './client';

const normalizeForecastDay = (day) => ({
  date: day.date,
  condition: day.condition || day.weather_condition,
  temperature_max: day.temperature_max ?? day.temp_max,
  temperature_min: day.temperature_min ?? day.temp_min,
});

const normalizeWeather = (raw) => {
  // Handle both direct and data-wrapped responses
  const data = raw.data?.current ? raw.data : raw;

  return {
    temperature: data.current?.temperature,
    temperature_min: data.current?.temperature_min,
    temperature_max: data.current?.temperature_max,
    condition: data.current?.condition ?? data.current?.weather_condition,
    wind_speed: data.current?.wind_speed_kmh ?? data.current?.wind_speed,
    visibility: data.current?.visibility_km ?? data.current?.visibility,
    snow_depth: data.snow?.depth_cm ?? data.snow?.snow_depth,
    new_snow_24h: data.snow?.new_snow_24h_cm ?? data.snow?.new_snow_24h,
    forecast: (data.forecast || []).map(normalizeForecastDay),
  };
};

export const weatherApi = {
  async getWeather(slug) {
    const response = await apiClient.get(`/resorts/${slug}/weather`);
    const body = response.data;
    return { success: true, weather: normalizeWeather(body) };
  },
};
