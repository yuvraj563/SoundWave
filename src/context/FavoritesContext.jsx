import { createContext, useContext, useCallback, useState, useEffect } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { favoritesAPI } from '../api/userApi'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext(null)

/**
 * FavoritesProvider
 * - Logged-in users: favorites synced with MongoDB via backend API
 * - Guest users: localStorage fallback (original behavior preserved)
 */
export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()

  // localStorage fallback for guests
  const [localFavorites, setLocalFavorites] = useLocalStorage('soundwave-favorites', [])

  // MongoDB-backed favorites for authenticated users
  const [remoteFavorites, setRemoteFavorites] = useState([])
  const [syncLoading, setSyncLoading] = useState(false)

  // Active favorites list (remote if authenticated, local otherwise)
  const favorites = isAuthenticated ? remoteFavorites : localFavorites

  // ── Load remote favorites on login ──────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      setSyncLoading(true)
      favoritesAPI.getAll()
        .then(({ data }) => setRemoteFavorites(data.favorites || []))
        .catch((err) => console.error('[FavoritesContext] load error:', err))
        .finally(() => setSyncLoading(false))
    }
  }, [isAuthenticated])

  // ── isFavorite ──────────────────────────────────────────────────────────────
  const isFavorite = useCallback(
    (track) => favorites.some((f) => f.id === track.id),
    [favorites]
  )

  // ── toggleFavorite ──────────────────────────────────────────────────────────
  const toggleFavorite = useCallback(async (track) => {
    const already = favorites.some((f) => f.id === track.id)

    if (isAuthenticated) {
      // Optimistic update
      if (already) {
        setRemoteFavorites((prev) => prev.filter((f) => f.id !== track.id))
        try { await favoritesAPI.remove(track.id) }
        catch { setRemoteFavorites((prev) => [track, ...prev]) } // rollback
      } else {
        setRemoteFavorites((prev) => [track, ...prev])
        try { await favoritesAPI.add(track) }
        catch { setRemoteFavorites((prev) => prev.filter((f) => f.id !== track.id)) } // rollback
      }
    } else {
      // Guest: localStorage
      setLocalFavorites((prev) =>
        already ? prev.filter((f) => f.id !== track.id) : [track, ...prev]
      )
    }
  }, [isAuthenticated, favorites, setLocalFavorites])

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, syncLoading }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}

export default FavoritesContext
