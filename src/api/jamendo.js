import axios from 'axios'

// Client ID from .env (VITE_JAMENDO_CLIENT_ID=0f83f023)
const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID || '0f83f023'

const BASE_URL = 'https://api.jamendo.com/v3.0'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
})

/**
 * Normalize a raw Jamendo track object into a consistent app-wide shape.
 * All components rely on these fields — never use raw Jamendo fields directly.
 *
 * Normalized shape:
 *   id          : string  — unique Jamendo track ID
 *   name        : string  — track title
 *   artistName  : string  — artist name
 *   artwork     : string  — album cover URL (already full resolution)
 *   audio       : string  — direct MP3 stream URL (Jamendo provides full tracks)
 *   duration    : number  — duration in SECONDS
 *   genre       : string  — genre tags joined by comma
 *   album       : string  — album name
 */
const normalizeTrack = (t) => ({
  id: String(t.id),
  name: t.name || 'Unknown Title',
  artistName: t.artist_name || 'Unknown Artist',
  artwork: t.album_image || t.image || '',
  audio: t.audio || '',          // Direct MP3 stream — Jamendo provides full songs
  duration: Number(t.duration) || 0,
  genre: Array.isArray(t.musicinfo?.tags?.genres)
    ? t.musicinfo.tags.genres.slice(0, 2).join(', ')
    : '',
  album: t.album_name || '',
})

const BASE_PARAMS = {
  client_id: CLIENT_ID,
  format: 'json',
  audioformat: 'mp32',    // mp3 128kbps stream
  include: 'musicinfo',   // include genre tags
}

/**
 * Search for tracks by keyword
 */
export const searchSongs = async (term, limit = 20) => {
  const { data } = await api.get('/tracks/', {
    params: { ...BASE_PARAMS, limit, search: term },
  })
  return (data.results || []).map(normalizeTrack).filter((t) => t.audio)
}

/**
 * Get tracks by genre tag
 */
export const getSongsByGenre = async (genre, limit = 25) => {
  const { data } = await api.get('/tracks/', {
    params: { ...BASE_PARAMS, limit, tags: genre.toLowerCase() },
  })
  return (data.results || []).map(normalizeTrack).filter((t) => t.audio)
}

/**
 * Get tracks from a specific Jamendo album
 */
export const getAlbumTracks = async (albumId, limit = 20) => {
  const { data } = await api.get('/tracks/', {
    params: { ...BASE_PARAMS, limit, album_id: albumId },
  })
  return (data.results || []).map(normalizeTrack).filter((t) => t.audio)
}

/**
 * Get album metadata by Jamendo album ID
 */
export const getAlbumInfo = async (albumId) => {
  const { data } = await api.get('/albums/', {
    params: { client_id: CLIENT_ID, format: 'json', id: albumId },
  })
  const a = (data.results || [])[0]
  if (!a) return null
  return {
    id: String(a.id),
    name: a.name,
    artistName: a.artist_name,
    artwork: a.image || '',
    releaseDate: a.releasedate || null,
    genre: '',
  }
}

/**
 * Fetch featured / trending tracks (sorted by total popularity)
 */
export const getFeaturedTracks = async (limit = 12) => {
  const { data } = await api.get('/tracks/', {
    params: { ...BASE_PARAMS, limit, order: 'popularity_total' },
  })
  return (data.results || []).map(normalizeTrack).filter((t) => t.audio)
}
