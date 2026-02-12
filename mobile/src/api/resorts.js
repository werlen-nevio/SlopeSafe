import apiClient from './client';

export const normalizeResort = (r) => ({
  ...r,
  latitude: r.coordinates?.lat,
  longitude: r.coordinates?.lng,
  elevation_min: r.elevation?.min,
  elevation_max: r.elevation?.max,
  danger_level: r.danger_level ?? r.current_status?.danger_levels?.max ?? null,
  last_updated: r.current_status?.updated_at ?? null,
  current_status: r.current_status
    ? {
        ...r.current_status,
        danger_level_max: r.current_status.danger_levels?.max,
      }
    : null,
});

export const resortsApi = {
  async getAll(params = {}) {
    const response = await apiClient.get('/resorts', { params: { per_page: 200, ...params } });
    const body = response.data;
    return { success: true, resorts: body.data.map(normalizeResort), meta: body.meta };
  },

  async search(query) {
    const response = await apiClient.get('/resorts/search', { params: { q: query } });
    const body = response.data;
    return { success: true, resorts: body.data.map(normalizeResort) };
  },

  async getBySlug(slug) {
    const response = await apiClient.get(`/resorts/${slug}`);
    const body = response.data;
    return { success: true, resort: normalizeResort(body.data) };
  },

  async getStatus(slug) {
    const response = await apiClient.get(`/resorts/${slug}/status`);
    return response.data;
  }
};
