import axios from 'axios'

/**
 * JioSaavn API Module — calls our Express backend proxy at /api/saavn/*.
 *
 * The backend handles JioSaavn's internal API, DES decryption, and CORS.
 * Covers Hindi, Bhojpuri, Punjabi, Tamil, Telugu, English — everything on JioSaavn.
 */

const api = axios.create({
  baseURL: '/api/saavn',   // Vite proxy → Express backend on port 5000
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
