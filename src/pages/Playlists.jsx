import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdQueueMusic, MdDelete, MdEdit, MdCheck, MdClose } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { usePlaylists } from '../context/PlaylistContext'
import { useToast } from '../context/ToastContext'
import EmptyState from '../components/ui/EmptyState'

const Playlists = () => {
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } = usePlaylists()
  const { toast } = useToast()

  const [showCreate, setShowCreate]     = useState(false)
  const [newName, setNewName]           = useState('')
  const [editingId, setEditingId]       = useState(null)
  const [editName, setEditName]         = useState('')
  const [creating, setCreating]         = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error('Enter a playlist name.'); return }
    setCreating(true)
    try {
      await createPlaylist(newName.trim())
      setNewName('')
      setShowCreate(false)
    } catch (err) {
      toast.error('Failed to create playlist.')
    } finally {
      setCreating(false)
    }
  }

  const handleRename = async (id) => {
    if (!editName.trim()) { setEditingId(null); return }
    try {
      await renamePlaylist(id, editName.trim())
      setEditingId(null)
    } catch { toast.error('Failed to rename playlist.') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try { await deletePlaylist(id) }
    catch { toast.error('Failed to delete playlist.') }
  }

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 6 }}>
              Your <span className="gradient-text">Library</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{playlists.length} playlists</p>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-gradient"
            onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}>
            <MdAdd size={18} /> New Playlist
          </motion.button>
        </div>

        {/* Create playlist form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass-card" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <input autoFocus placeholder="Playlist name..." value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false) }}
                style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
              <button className="btn-gradient" onClick={handleCreate} disabled={creating} style={{ padding: '10px 18px', fontSize: 13 }}>
                {creating ? '...' : 'Create'}
              </button>
              <button className="btn-icon" onClick={() => setShowCreate(false)}><MdClose size={20} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {playlists.length === 0 ? (
          <EmptyState icon={<MdQueueMusic size={56} color="#7c3aed" />} title="No playlists yet" subtitle="Create your first playlist to organize your music." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            <AnimatePresence>
              {playlists.map((playlist, i) => {
                const cover = playlist.coverImage || playlist.songs?.[0]?.artwork
                return (
                  <motion.div key={playlist._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.04 }} className="glass-card" style={{ padding: 16, position: 'relative' }}>
                    {/* Cover */}
                    <Link to={`/playlist/${playlist._id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
                      <div style={{ width: '100%', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {cover ? <img src={cover} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <MdQueueMusic size={40} color="#7c3aed" />}
                      </div>
                    </Link>

                    {/* Name (editable) */}
                    {editingId === playlist._id ? (
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(playlist._id); if (e.key === 'Escape') setEditingId(null) }}
                          style={{ flex: 1, padding: '4px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(124,58,237,0.5)', borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                        <button className="btn-icon" style={{ padding: 3 }} onClick={() => handleRename(playlist._id)}><MdCheck size={16} color="#a78bfa" /></button>
                        <button className="btn-icon" style={{ padding: 3 }} onClick={() => setEditingId(null)}><MdClose size={16} /></button>
                      </div>
                    ) : (
                      <Link to={`/playlist/${playlist._id}`} style={{ textDecoration: 'none' }}>
                        <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{playlist.name}</p>
                      </Link>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{playlist.songs?.length || 0} songs</p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                      <button className="btn-icon" style={{ padding: 5, flex: 1, justifyContent: 'center' }} title="Rename"
                        onClick={() => { setEditingId(playlist._id); setEditName(playlist.name) }}><MdEdit size={16} /></button>
                      <button className="btn-icon" style={{ padding: 5, flex: 1, justifyContent: 'center', color: '#ef4444' }} title="Delete"
                        onClick={() => handleDelete(playlist._id, playlist.name)}><MdDelete size={16} /></button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Playlists
