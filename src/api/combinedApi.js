/**
 * Combined Music API
 *
 * Merges results from JioSaavn (Hindi, Bhojpuri, Punjabi, all Indian music)
 * and Jamendo (international, English, Western music).
 *
 * This gives users access to ALL music — Hindi, English, Bhojpuri, Punjabi, etc.
 */

import * as jiosaavn from './jiosaavn'
import * as jamendo from './jamendo'

/**
 * Remove duplicate tracks by name similarity (case-insensitive).
 */
function deduplicateTracks(tracks) {
  const seen = new Set()
  return tracks.filter(t => {
    const key = `${t.name.toLowerCase().trim()}::${t.artistName.toLowerCase().trim()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Merge results from multiple API calls, interleaving them for variety.
 * JioSaavn results come first (higher priority for Indian music), then Jamendo.
 */
function mergeResults(jiosaavnResults, jamendoResults, limit) {
  // Interleave: 2 JioSaavn, 1 Jamendo to prioritize Indian music
  const merged = []
  let ji = 0, ja = 0

  while (merged.length < limit && (ji < jiosaavnResults.length || ja < jamendoResults.length)) {
    // Add 2 JioSaavn tracks
    if (ji < jiosaavnResults.length) merged.push(jiosaavnResults[ji++])
    if (ji < jiosaavnResults.length) merged.push(jiosaavnResults[ji++])
    // Add 1 Jamendo track
    if (ja < jamendoResults.length) merged.push(jamendoResults[ja++])
  }

  return deduplicateTracks(merged).slice(0, limit)
}

/**
 * Search for songs across both JioSaavn and Jamendo.
 * Returns a combined, deduplicated list.
 */
export const searchSongs = async (term, limit = 20) => {
  // Fetch from both APIs in parallel — don't let one failure break everything
  const [jiosaavnResults, jamendoResults] = await Promise.all([
    jiosaavn.searchSongs(term, limit).catch(err => {
      console.warn('[Combined] JioSaavn search failed:', err.message)
      return []
    }),
    jamendo.searchSongs(term, limit).catch(err => {
      console.warn('[Combined] Jamendo search failed:', err.message)
      return []
    }),
  ])

  return mergeResults(jiosaavnResults, jamendoResults, limit)
}

/**
 * Get songs by genre from both APIs.
 */
export const getSongsByGenre = async (genre, limit = 25) => {
  const [jiosaavnResults, jamendoResults] = await Promise.all([
    jiosaavn.getSongsByGenre(genre, limit).catch(() => []),
    jamendo.getSongsByGenre(genre, limit).catch(() => []),
  ])

  return mergeResults(jiosaavnResults, jamendoResults, limit)
}

/**
 * Get album tracks — try JioSaavn first, fallback to Jamendo.
 */
export const getAlbumTracks = async (albumId) => {
  // Album IDs are source-specific, try both
  const results = await jiosaavn.getAlbumTracks(albumId).catch(() => [])
  if (results.length > 0) return results
  return jamendo.getAlbumTracks(albumId).catch(() => [])
}

/**
 * Get album info — try JioSaavn first, fallback to Jamendo.
 */
export const getAlbumInfo = async (albumId) => {
  const info = await jiosaavn.getAlbumInfo(albumId).catch(() => null)
  if (info) return info
  return jamendo.getAlbumInfo(albumId).catch(() => null)
}

/**
 * Fetch featured/trending tracks from both sources.
 */
export const getFeaturedTracks = async (limit = 12) => {
  const [jiosaavnResults, jamendoResults] = await Promise.all([
    jiosaavn.getFeaturedTracks(limit).catch(() => []),
    jamendo.getFeaturedTracks(limit).catch(() => []),
  ])

  return mergeResults(jiosaavnResults, jamendoResults, limit)
}
