import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdPlayArrow, MdQueueMusic, MdDelete, MdShuffle, MdArrowBack } from 'react-icons/md'
import { usePlaylists } from '../context/PlaylistContext'
import { usePlayer } from '../context/PlayerContext'
import TrackList from '../components/music/TrackList'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'

const PlaylistDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playlists, removeSongFromPlaylist } = usePlaylists()
  const { playTrack, toggleShuffle, isShuffled } = usePlayer()
  const { toast } = useToast()

  const playlist = playlists.find((p) => p._id === id)

  if (!playlist) {
    return (
      <div className="page-container">
        <Loader count={1} />
      </div>
    )
  }

  const cover = playlist.coverImage || playlist.songs?.[0]?.artwork

  const handlePlayAll = () => {
    if (!playlist.songs.length) { toast.info('This playlist is empty.'); return }
    playTrack(playlist.songs[0], playlist.songs)
    toast.info(`Playing "${playlist.name}"`)
  }

  const handleRemoveSong = async (songId, songName) => {
    try {
      await removeSongFromPlaylist(playlist._id, songId)
    } catch { toast.error('Failed to remove song.') }
  }

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
          <button className="btn-icon" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}><MdArrowBack size={22} /></button>

          {/* Cover */}
          <div style={{ width: 200, height: 200, borderRadius: 20, overflow: 'hidden', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            {cover ? <img src={cover} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <MdQueueMusic size={64} color="#7c3aed" />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: 8 }}>Playlist</p>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(24px, 4vw, 48px)', marginBottom: 12, lineHeight: 1.1 }}>{playlist.name}</h1>
            {playlist.description && <p style={{ color: 'var(--color-text-secondary)', marginBottom: 12, fontSize: 14 }}>{playlist.description}</p>}
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 20 }}>{playlist.songs.length} songs</p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-gradient"
                onClick={handlePlayAll} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: 15 }}>
                <MdPlayArrow size={20} /> Play All
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={toggleShuffle}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', fontSize: 14, background: isShuffled ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.08)', border: `1px solid ${isShuffled ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 99, color: isShuffled ? '#a78bfa' : 'var(--color-text-secondary)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                <MdShuffle size={18} /> Shuffle
              </motion.button>
            </div>
          </div>
        </div>

        {/* Track list */}
        {playlist.songs.length === 0 ? (
          <EmptyState icon={<MdQueueMusic size={48} color="#7c3aed" />} title="Playlist is empty" subtitle="Search for songs and add them to this playlist." />
        ) : (
          <div className="glass-card" style={{ padding: '8px 0' }}>
            <TrackList tracks={playlist.songs} showRemove onRemove={handleRemoveSong} />
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PlaylistDetail
