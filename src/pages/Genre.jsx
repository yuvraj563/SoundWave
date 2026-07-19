import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdPlayArrow } from 'react-icons/md'
import { getSongsByGenre } from '../api/combinedApi'
import TrackCard from '../components/music/TrackCard'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import { usePlayer } from '../context/PlayerContext'

const GENRE_COLORS = {
  'Bollywood': ['#7c3aed', '#ec4899'],
  'Pop':       ['#ec4899', '#f97316'],
  'Rock':      ['#ef4444', '#7c3aed'],
  'Hip-Hop':   ['#f59e0b', '#10b981'],
  'Jazz':      ['#0ea5e9', '#7c3aed'],
  'Electronic':['#06b6d4', '#7c3aed'],
  'Classical': ['#10b981', '#0ea5e9'],
  'Romantic':  ['#ec4899', '#f43f5e'],
  'Punjabi':   ['#f97316', '#eab308'],
  'R&B':       ['#7c3aed', '#0ea5e9'],
}

const Genre = () => {
  const { name }   = useParams()
  const { playTrack } = usePlayer()
  const genreName  = decodeURIComponent(name)

  const [tracks, setTracks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    getSongsByGenre(genreName, 24)
      .then(setTracks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [genreName])

  const colors = GENRE_COLORS[genreName] || ['#7c3aed', '#ec4899']

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div style={{
          borderRadius: 24, padding: '48px 40px', marginBottom: 40,
          background: `linear-gradient(135deg, ${colors[0]}33, ${colors[1]}33)`,
          border: `1px solid ${colors[0]}44`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${colors[0]}55, transparent 70%)`, pointerEvents: 'none' }} />

          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: colors[0], marginBottom: 8 }}>Genre</p>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(32px, 6vw, 64px)', marginBottom: 16 }}>{genreName}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 14 }}>
            {loading ? 'Loading...' : `${tracks.length} songs`}
          </p>
          {tracks.length > 0 && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-gradient"
              onClick={() => playTrack(tracks[0], tracks)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: 15 }}>
              <MdPlayArrow size={20} /> Play All
            </motion.button>
          )}
        </div>

        {loading && <Loader count={12} />}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        {!loading && !error && tracks.length === 0 && (
          <EmptyState icon="🎵" title="No songs found" subtitle={`Nothing found for ${genreName}`} />
        )}
        {!loading && !error && tracks.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
            {tracks.map((track, i) => <TrackCard key={track.id} track={track} queue={tracks} index={i} />)}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Genre
