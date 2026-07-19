import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdCheck, MdQueueMusic, MdClose } from 'react-icons/md'
import { usePlaylists } from '../../context/PlaylistContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

/**
 * PlaylistModal — shows when user clicks "Add to Playlist" on any song.
 * Lists existing playlists to pick from, or create a new one.
 */
const PlaylistModal = ({ song, onClose }) => {
  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [newName, setNewName]   = useState('')
  const [creating, setCreating] = useState(false)
  const [adding, setAdding]     = useState(null) // playlist ID being added to

  const handleAdd = async (playlistId, playlistName) => {
    setAdding(playlistId)
    try {
      const { data } = await addSongToPlaylist(playlistId, song)
      toast.success(`Added to "${playlistName}"!`)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add song.')
    } finally {
      setAdding(null)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const playlist = await createPlaylist(newName.trim())
      await addSongToPlaylist(playlist._id, song)
      toast.success(`Added to new playlist "${newName}"!`)
      onClose()
    } catch (err) {
      toast.error('Failed to create playlist.')
    } finally {
      setCreating(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{ background: 'rgba(15,15,30,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, maxWidth: 380, width: '100%', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Sign in to save to playlists</p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Create an account to organize your music.</p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{ background: 'rgba(12,12,24,0.99)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, maxWidth: 400, width: '100%', backdropFilter: 'blur(30px)' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18 }}>Add to Playlist</h3>
            <button className="btn-icon" onClick={onClose}><MdClose size={20} /></button>
          </div>

          {/* Song info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 20 }}>
            {song.artwork ? <img src={song.artwork} alt={song.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdQueueMusic size={18} color="#7c3aed" /></div>}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.name}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{song.artistName}</p>
            </div>
          </div>

          {/* Existing playlists */}
          <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
            {playlists.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: 16 }}>No playlists yet. Create one below.</p>
            ) : (
              playlists.map((pl) => (
                <button key={pl._id} onClick={() => handleAdd(pl._id, pl.name)} disabled={!!adding}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: adding === pl._id ? 'rgba(124,58,237,0.15)' : 'transparent', border: 'none', borderRadius: 10, cursor: 'pointer', color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif', transition: 'background 0.2s', marginBottom: 4 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = adding === pl._id ? 'rgba(124,58,237,0.15)' : 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {pl.songs?.[0]?.artwork ? <img src={pl.songs[0].artwork} alt="" style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} /> : <MdQueueMusic size={18} color="#7c3aed" />}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{pl.songs?.length || 0} songs</p>
                  </div>
                  {adding === pl._id && <MdCheck size={18} color="#a78bfa" />}
                </button>
              ))
            )}
          </div>

          {/* Create new */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="New playlist name..." value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
            <button onClick={handleCreate} disabled={creating || !newName.trim()}
              style={{ padding: '10px 14px', background: 'var(--gradient-accent)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600, opacity: creating || !newName.trim() ? 0.6 : 1 }}>
              <MdAdd size={16} /> {creating ? '...' : 'Create'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PlaylistModal
