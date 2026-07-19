import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder, MdMusicNote, MdPlaylistAdd } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { usePlayer } from '../../context/PlayerContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useAuth } from '../../context/AuthContext'
import { truncate, formatDuration } from '../../utils/helpers'
import PlaylistModal from '../playlist/PlaylistModal'

/**
 * TrackCard — grid view card for a single track.
 * Normalized track shape: id, name, artistName, artwork, audio, duration, genre, album
 */
const TrackCard = ({ track, queue = [], index = 0 }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isAuthenticated } = useAuth()
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)

  const isCurrentTrack = currentTrack?.id === track.id
  const favored        = isFavorite(track)

  const handlePlay = (e) => {
    e.stopPropagation()
    if (isCurrentTrack) {
      togglePlay()
    } else {
      playTrack(track, queue.length ? queue : [track])
    }
  }

  const handleFav = (e) => {
    e.stopPropagation()
    toggleFavorite(track)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, delay: index * 0.04 }}
        className="glass-card"
        style={{
          padding: 16,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          ...(isCurrentTrack && {
            borderColor: 'rgba(124, 58, 237, 0.6)',
            boxShadow: '0 0 24px rgba(124, 58, 237, 0.25)',
          }),
        }}
        onClick={handlePlay}
        id={`track-card-${track.id}`}
      >
        {/* Artwork */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          {track.artwork ? (
            <img src={track.artwork} alt={track.name}
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 10, display: 'block' }}
              loading="lazy" />
          ) : (
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: 10, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdMusicNote size={40} color="#7c3aed" />
            </div>
          )}

          {/* Play overlay */}
          <div className="play-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 10, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isCurrentTrack ? 1 : 0, transition: 'opacity 0.2s ease' }}>
            <motion.div whileTap={{ scale: 0.9 }}
              style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124, 58, 237, 0.6)' }}>
              {isCurrentTrack && isPlaying ? <MdPause size={26} color="white" /> : <MdPlayArrow size={26} color="white" />}
            </motion.div>
          </div>
          <style>{`.glass-card:hover .play-overlay { opacity: 1 !important; }`}</style>
        </div>

        {/* Track name */}
        <p style={{ fontWeight: 600, fontSize: 14, color: isCurrentTrack ? '#a78bfa' : 'var(--color-text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
          {truncate(track.name, 28)}
        </p>

        {/* Artist — clickable link */}
        <Link
          to={`/artist/${encodeURIComponent(track.artistName)}`}
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
          {truncate(track.artistName, 24)}
        </Link>

        {/* Duration + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {formatDuration(track.duration * 1000)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Add to playlist */}
            {isAuthenticated && (
              <motion.button whileTap={{ scale: 0.85 }} className="btn-icon" onClick={(e) => { e.stopPropagation(); setShowPlaylistModal(true) }} style={{ padding: 3 }} aria-label="Add to playlist" id={`playlist-btn-${track.id}`}>
                <MdPlaylistAdd size={17} />
              </motion.button>
            )}
            {/* Favorite */}
            <motion.button whileTap={{ scale: 0.85 }} className="btn-icon" onClick={handleFav} style={{ padding: 3 }} id={`fav-btn-${track.id}`} aria-label={favored ? 'Remove from favorites' : 'Add to favorites'}>
              {favored ? <MdFavorite size={17} color="#ec4899" /> : <MdFavoriteBorder size={17} />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Playlist modal */}
      {showPlaylistModal && (
        <PlaylistModal song={track} onClose={() => setShowPlaylistModal(false)} />
      )}
    </>
  )
}

export default TrackCard
