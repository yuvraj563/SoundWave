import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { playlistsAPI } from '../api/userApi'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const PlaylistContext = createContext(null)

export const PlaylistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading]     = useState(false)

  // ── Load playlists on auth change ───────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists()
    } else {
      setPlaylists([])
    }
  }, [isAuthenticated])

  const fetchPlaylists = async () => {
    setLoading(true)
    try {
      const { data } = await playlistsAPI.getAll()
      setPlaylists(data.playlists)
    } catch (err) {
      console.error('[PlaylistContext] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Create playlist ─────────────────────────────────────────────────────────
  const createPlaylist = useCallback(async (name, description = '') => {
    const { data } = await playlistsAPI.create(name, description)
    setPlaylists((prev) => [data.playlist, ...prev])
    toast.success(`Playlist "${name}" created!`)
    return data.playlist
  }, [toast])

  // ── Rename playlist ─────────────────────────────────────────────────────────
  const renamePlaylist = useCallback(async (id, name) => {
    const { data } = await playlistsAPI.update(id, { name })
    setPlaylists((prev) => prev.map((p) => p._id === id ? data.playlist : p))
    toast.success('Playlist renamed!')
  }, [toast])

  // ── Delete playlist ─────────────────────────────────────────────────────────
  const deletePlaylist = useCallback(async (id) => {
    await playlistsAPI.delete(id)
    setPlaylists((prev) => prev.filter((p) => p._id !== id))
    toast.success('Playlist deleted.')
  }, [toast])

  // ── Add song to playlist ────────────────────────────────────────────────────
  const addSongToPlaylist = useCallback(async (playlistId, song) => {
    const { data } = await playlistsAPI.addSong(playlistId, song)
    setPlaylists((prev) => prev.map((p) => p._id === playlistId ? data.playlist : p))
    return data
  }, [])

  // ── Remove song from playlist ───────────────────────────────────────────────
  const removeSongFromPlaylist = useCallback(async (playlistId, songId) => {
    const { data } = await playlistsAPI.removeSong(playlistId, songId)
    setPlaylists((prev) => prev.map((p) => p._id === playlistId ? data.playlist : p))
    toast.success('Song removed from playlist.')
  }, [toast])

  return (
    <PlaylistContext.Provider value={{
      playlists,
      loading,
      fetchPlaylists,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
    }}>
      {children}
    </PlaylistContext.Provider>
  )
}

export const usePlaylists = () => {
  const ctx = useContext(PlaylistContext)
  if (!ctx) throw new Error('usePlaylists must be used within PlaylistProvider')
  return ctx
}

export default PlaylistContext
