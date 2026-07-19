import { motion, AnimatePresence } from 'framer-motion'
import { MdClose, MdDragHandle, MdQueueMusic, MdDelete } from 'react-icons/md'
import { usePlayer } from '../../context/PlayerContext'
import { truncate } from '../../utils/helpers'

/**
 * QueueDrawer — slide-in panel showing the current play queue.
 * Allows removing songs from the queue.
 */
const QueueDrawer = ({ isOpen, onClose }) => {
  const { queue, queueIndex, currentTrack, playTrack, removeFromQueue } = usePlayer()

  const upNext = queue.slice(queueIndex + 1)
  const played = queue.slice(0, queueIndex)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100 }} />

          {/* Drawer */}
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 340, maxWidth: '100vw',
              background: 'rgba(10, 10, 22, 0.98)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              zIndex: 1101,
              display: 'flex', flexDirection: 'column',
              paddingBottom: 'var(--player-height)',
            }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 18 }}>Queue</h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{queue.length} songs</p>
              </div>
              <button className="btn-icon" onClick={onClose}><MdClose size={22} /></button>
            </div>

            {/* Queue list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
              {/* Now playing */}
              {currentTrack && (
                <div style={{ padding: '12px 0 4px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', padding: '0 12px', marginBottom: 8 }}>Now Playing</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(124,58,237,0.15)', borderRadius: 10, borderLeft: '3px solid #7c3aed' }}>
                    {currentTrack.artwork ? <img src={currentTrack.artwork} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdQueueMusic size={18} color="#7c3aed" /></div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncate(currentTrack.name, 28)}</p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{truncate(currentTrack.artistName, 24)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Up next */}
              {upNext.length > 0 && (
                <div style={{ paddingTop: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', padding: '0 12px', marginBottom: 8 }}>Up Next</p>
                  {upNext.map((track, i) => (
                    <div key={`${track.id}-${i}`} className="track-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', cursor: 'pointer' }}
                      onClick={() => { playTrack(track, queue); onClose() }}>
                      {track.artwork ? <img src={track.artwork} alt="" style={{ width: 38, height: 38, borderRadius: 7, objectFit: 'cover' }} /> : <div style={{ width: 38, height: 38, borderRadius: 7, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdQueueMusic size={16} color="#7c3aed" /></div>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncate(track.name, 26)}</p>
                        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{truncate(track.artistName, 22)}</p>
                      </div>
                      <button className="btn-icon" style={{ padding: 4, opacity: 0, transition: 'opacity 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                        onClick={(e) => { e.stopPropagation(); removeFromQueue(track.id) }}>
                        <MdDelete size={15} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {queue.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
                  <MdQueueMusic size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <p style={{ fontSize: 14 }}>Queue is empty</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default QueueDrawer
