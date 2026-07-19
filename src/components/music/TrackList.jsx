import { motion, AnimatePresence } from 'framer-motion'
import { MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder, MdMusicNote } from 'react-icons/md'
import { usePlayer } from '../../context/PlayerContext'
import { useFavorites } from '../../context/FavoritesContext'
import { truncate, formatDuration } from '../../utils/helpers'

/**
 * TrackList — row/list view for an array of normalized Jamendo tracks.
 *
 * Normalized track shape: id, name, artistName, artwork, audio, duration (s), genre, album
 */
const TrackList = ({ tracks = [] }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer()
  const { isFavorite, toggleFavorite } = useFavorites()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <AnimatePresence>
        {tracks.map((track, idx) => {
          const isCurrent = currentTrack?.id === track.id
          const favored   = isFavorite(track)

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className={`track-row ${isCurrent ? 'playing' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', cursor: 'pointer' }}
              onClick={() => isCurrent ? togglePlay() : playTrack(track, tracks)}
              id={`track-row-${track.id}`}
            >
              {/* Index / Play Icon */}
              <div style={{
                width: 28, textAlign: 'center', flexShrink: 0,
                color: isCurrent ? '#a78bfa' : 'var(--color-text-muted)',
                fontSize: 13, fontWeight: 600,
              }}>
                {isCurrent && isPlaying
                  ? <MdPause size={20} color="#a78bfa" />
                  : isCurrent
                    ? <MdPlayArrow size={20} color="#a78bfa" />
                    : idx + 1
                }
              </div>

              {/* Artwork */}
              <div style={{ width: 44, height: 44, flexShrink: 0, position: 'relative' }}>
                {track.artwork ? (
                  <img
                    src={track.artwork}
                    alt={track.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', borderRadius: 6,
                    background: 'rgba(124,58,237,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MdMusicNote size={20} color="#7c3aed" />
                  </div>
                )}

                {/* EQ animation overlay when playing */}
                {isCurrent && isPlaying && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 6,
                    background: 'rgba(124,58,237,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                      {[1, 2, 3].map(b => (
                        <span key={b} style={{
                          display: 'inline-block', width: 3, background: 'white',
                          borderRadius: 2,
                          animation: `eq-bar 0.8s ease-in-out ${b * 0.15}s infinite alternate`,
                          height: 12,
                        }} />
                      ))}
                    </span>
                    <style>{`@keyframes eq-bar { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }`}</style>
                  </div>
                )}
              </div>

              {/* Track info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontWeight: 600, fontSize: 14,
                  color: isCurrent ? '#a78bfa' : 'var(--color-text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {track.name}
                </p>
                <p style={{
                  fontSize: 12, color: 'var(--color-text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {track.artistName}
                  {track.album && ` · ${truncate(track.album, 30)}`}
                </p>
              </div>

              {/* Genre tag (hidden on small screens via inline display:none) */}
              {track.genre && (
                <span style={{
                  fontSize: 11, color: 'var(--color-text-muted)',
                  flexShrink: 0,
                  display: 'none',   // shown via CSS in wider layouts if desired
                }}>
                  {track.genre}
                </span>
              )}

              {/* Duration — duration is in seconds, formatDuration expects ms */}
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)', flexShrink: 0 }}>
                {formatDuration(track.duration * 1000)}
              </span>

              {/* Favorite */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                className="btn-icon"
                onClick={(e) => { e.stopPropagation(); toggleFavorite(track) }}
                style={{ padding: 4, flexShrink: 0 }}
                id={`fav-list-${track.id}`}
                aria-label="Toggle favorite"
              >
                {favored
                  ? <MdFavorite size={18} color="#ec4899" />
                  : <MdFavoriteBorder size={18} />
                }
              </motion.button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default TrackList
