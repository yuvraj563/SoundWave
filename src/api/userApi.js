import api from './auth'

// ── Favorites ─────────────────────────────────────────────────────────────────
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (song) => api.post('/favorites', { song }),
  remove: (songId) => api.delete(`/favorites/${songId}`),
  check: (songId) => api.get(`/favorites/check/${songId}`),
}

// ── Playlists ─────────────────────────────────────────────────────────────────
export const playlistsAPI = {
  getAll: () => api.get('/playlists'),
  getOne: (id) => api.get(`/playlists/${id}`),
  create: (name, description = '') => api.post('/playlists', { name, description }),
  update: (id, data) => api.put(`/playlists/${id}`, data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addSong: (id, song) => api.post(`/playlists/${id}/songs`, { song }),
  removeSong: (id, songId) => api.delete(`/playlists/${id}/songs/${songId}`),
}

// ── History ───────────────────────────────────────────────────────────────────
export const historyAPI = {
  recordPlay: (song, secondsListened = 0) => api.post('/history/play', { song, secondsListened }),
  getRecent: (limit = 20) => api.get(`/history/recent?limit=${limit}`),
  getStats: () => api.get('/history/stats'),
  getRecommendations: () => api.get('/history/recommendations'),
}

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
}
