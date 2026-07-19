/**
 * Format milliseconds into mm:ss
 */
export const formatDuration = (ms) => {
  if (!ms) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format seconds into mm:ss (for audio currentTime / duration)
 */
export const formatSeconds = (secs) => {
  if (!secs || isNaN(secs)) return '0:00'
  const minutes = Math.floor(secs / 60)
  const seconds = Math.floor(secs % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Truncate text to a max length with ellipsis
 */
export const truncate = (text, maxLength = 30) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text
}

/**
 * Get higher-resolution artwork.
 * For Jamendo: artwork URLs are already full-res, so we just return them as-is.
 * For iTunes: replaces 100x100 with the desired size.
 */
export const getHighResArtwork = (url, size = 500) => {
  if (!url) return null
  // iTunes-style replacement (kept for backward compat)
  if (url.includes('100x100')) {
    return url.replace('100x100', `${size}x${size}`)
  }
  return url
}

/**
 * Debounce helper
 */
export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Generate a stable unique key for a track (works with both Jamendo & legacy)
 */
export const getTrackKey = (track) =>
  track.id || `${track.trackId || track.collectionId}-${track.trackName || track.name}`
