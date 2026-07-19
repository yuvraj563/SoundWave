import axios from 'axios'

/**
 * JioSaavn API Module — calls our Express backend proxy at /api/saavn/*.
 *
 * The backend handles JioSaavn's internal API, DES decryption, and CORS.
 * Covers Hindi, Bhojpuri, Punjabi, Tamil, Telugu, English — everything on JioSaavn.
 *
 * PRODUCTION NOTE:
 * In development, Vite's proxy rewrites `/api/saavn/*` → `http://localhost:5000/api/saavn/*`.
 * In production (Vercel static build), no proxy exists, so we MUST use an absolute URL.
 * Set VITE_API_URL=https://your-render-backend.onrender.com in Vercel's env vars.
 */

// In production: VITE_API_URL = 'https://your-render-backend.onrender.com'
// In dev: VITE_API_URL is empty/undefined → falls back to '' so Vite proxy handles it
const BACKEND_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${BACKEND_BASE}/api/saavn`,
  timeout: 15000,
})

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * Search for songs by keyword.
 * Works for Hindi, English, Bhojpuri, Punjabi, Tamil, Telugu — everything on JioSaavn.
 */
export const searchSongs = async (term, limit = 20) => {
  try {
    const { data } = await api.get('/search', {
      params: { q: term, limit },
    })
    return data?.data || []
  } catch (err) {
    console.error('[JioSaavn] Search failed:', err.message)
    return []
  }
}

/**
 * Get songs by genre / mood / tag.
 */
export const getSongsByGenre = async (genre, limit = 25) => {
  try {
    const { data } = await api.get('/genre', {
      params: { genre, limit },
    })
    return data?.data || []
  } catch (err) {
    console.error('[JioSaavn] Genre failed:', err.message)
    return []
  }
}

/**
 * Get tracks from a JioSaavn album by ID.
 */
export const getAlbumTracks = async (albumId) => {
  try {
    const { data } = await api.get('/album', {
      params: { id: albumId },
    })
    return data?.data?.tracks || []
  } catch (err) {
    console.error('[JioSaavn] Album tracks failed:', err.message)
    return []
  }
}

/**
 * Get album info.
 */
export const getAlbumInfo = async (albumId) => {
  try {
    const { data } = await api.get('/album', {
      params: { id: albumId },
    })
    return data?.data?.album || null
  } catch (err) {
    console.error('[JioSaavn] Album info failed:', err.message)
    return null
  }
}

/**
 * Fetch trending/featured tracks.
 */
export const getFeaturedTracks = async (limit = 12) => {
  try {
    const { data } = await api.get('/featured', {
      params: { limit },
    })
    return data?.data || []
  } catch (err) {
    console.error('[JioSaavn] Featured failed:', err.message)
    return []
  }
}
