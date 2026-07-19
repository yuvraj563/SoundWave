import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdPlayArrow, MdPause, MdSkipNext, MdSkipPrevious,
  MdMusicNote, MdFavorite, MdFavoriteBorder,
  MdShuffle, MdRepeat, MdRepeatOne, MdQueueMusic,
  MdPlaylistAdd,
} from 'react-icons/md'
import { usePlayer } from '../../context/PlayerContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useAuth } from '../../context/AuthContext'
import ProgressBar from './ProgressBar'
import VolumeControl from './VolumeControl'
import { truncate } from '../../utils/helpers'
import QueueDrawer from '../queue/QueueDrawer'
import PlaylistModal from '../playlist/PlaylistModal'
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts'

const MiniPlayer = () => {
  const {
    currentTrack, isPlaying, isLoading, togglePlay, playNext, playPrev,
    isShuffled, repeatMode, toggleShuffle, cycleRepeat,
    seek, currentTime, duration, setVolume, volume, toggleMute,
  } = usePlayer()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isAuthenticated } = useAuth()

  const [queueOpen, setQueueOpen]       = useState(false)
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false)

  // Global keyboard shortcuts
  useKeyboardShortcuts({ togglePlay, seek, currentTime, duration, setVolume, volume, toggleMute, playNext, playPrev })

  const repeatIcon =
    repeatMode === 'one' ? MdRepeatOne :
    repeatMode === 'all' ? MdRepeat :
    MdRepeat

  const repeatColor = repeatMode !== 'off' ? '#a78bfa' : undefined

  return (
    <>
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            id="mini-player"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              height: 'var(--player-height)',
              background: 'rgba(10, 10, 20, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              padding: '0 20px',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            {/* Main row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

              {/* Track info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {currentTrack.artwork ? (
                    <img src={currentTrack.artwork} alt={currentTrack.name}
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MdMusicNote size={22} color="#7c3aed" />
                    </div>
                  )}
                  {isLoading && (
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {truncate(currentTrack.name, 30)}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    {truncate(currentTrack.artistName, 26)}
                  </p>
                </div>

                {/* Favorite */}
                <motion.button whileTap={{ scale: 0.85 }} className="btn-icon" onClick={() => toggleFavorite(currentTrack)} id="player-fav-btn" aria-label="Toggle favorite" style={{ flexShrink: 0, padding: 5 }}>
                  {isFavorite(currentTrack) ? <MdFavorite size={18} color="#ec4899" /> : <MdFavoriteBorder size={18} />}
                </motion.button>

                {/* Add to playlist */}
                {isAuthenticated && (
                  <motion.button whileTap={{ scale: 0.85 }} className="btn-icon" onClick={() => setPlaylistModalOpen(true)} id="player-playlist-btn" aria-label="Add to playlist" style={{ flexShrink: 0, padding: 5 }}>
                    <MdPlaylistAdd size={20} />
                  </motion.button>
                )}
              </div>

              {/* Playback controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Shuffle */}
                <motion.button whileTap={{ scale: 0.9 }} className="btn-icon" onClick={toggleShuffle} id="player-shuffle-btn" aria-label="Shuffle" style={{ padding: 5 }}>
                  <MdShuffle size={18} color={isShuffled ? '#a78bfa' : undefined} />
                </motion.button>

                <motion.button whileTap={{ scale: 0.9 }} className="btn-icon" onClick={playPrev} id="player-prev-btn" aria-label="Previous" style={{ padding: 5 }}>
                  <MdSkipPrevious size={24} />
                </motion.button>

                <motion.button whileTap={{ scale: 0.88 }} onClick={togglePlay} id="player-play-pause-btn" aria-label={isPlaying ? 'Pause' : 'Play'}
                  style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124, 58, 237, 0.5)', flexShrink: 0 }}>
                  {isPlaying ? <MdPause size={22} color="white" /> : <MdPlayArrow size={22} color="white" />}
                </motion.button>

                <motion.button whileTap={{ scale: 0.9 }} className="btn-icon" onClick={playNext} id="player-next-btn" aria-label="Next" style={{ padding: 5 }}>
                  <MdSkipNext size={24} />
                </motion.button>

                {/* Repeat */}
                <motion.button whileTap={{ scale: 0.9 }} className="btn-icon" onClick={cycleRepeat} id="player-repeat-btn" aria-label={`Repeat: ${repeatMode}`} style={{ padding: 5 }}>
                  {repeatMode === 'one' ? <MdRepeatOne size={18} color="#a78bfa" /> : <MdRepeat size={18} color={repeatColor} />}
                </motion.button>
              </div>

              {/* Right controls: volume + queue */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <VolumeControl />
                <motion.button whileTap={{ scale: 0.9 }} className="btn-icon" onClick={() => setQueueOpen(true)} id="player-queue-btn" aria-label="View queue" style={{ padding: 5 }}>
                  <MdQueueMusic size={20} />
                </motion.button>
              </div>
            </div>

            {/* Progress bar */}
            <ProgressBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Drawer */}
      <QueueDrawer isOpen={queueOpen} onClose={() => setQueueOpen(false)} />

      {/* Playlist Modal */}
      {playlistModalOpen && currentTrack && (
        <PlaylistModal song={currentTrack} onClose={() => setPlaylistModalOpen(false)} />
      )}
    </>
  )
}

export default MiniPlayer
