import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdPerson, MdPlayArrow } from 'react-icons/md'
import { searchSongs } from '../api/combinedApi'
import TrackCard from '../components/music/TrackCard'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import { usePlayer } from '../context/PlayerContext'

const Artist = () => {
  const { name } = useParams()
  const { playTrack } = usePlayer()
  const artistName = decodeURIComponent(name)

  const [tracks, setTracks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    searchSongs(artistName, 30)
      .then((results) => {
        // Filter to songs where artistName matches
        const filtered = results.filter((t) =>
          t.artistName?.toLowerCase().includes(artistName.toLowerCase())
        )
        setTracks(filtered.length > 0 ? filtered : results)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [artistName])

  const initials = artistName.charAt(0).toUpperCase()

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Artist Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, marginBottom: 48, flexWrap: 'wrap' }}>
          {/* Artist avatar */}
          <div style={{
            width: 180, height: 180, borderRadius: '50%',
            background: 'var(--gradient-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 64, fontWeight: 900, color: 'white', flexShrink: 0,
            boxShadow: '0 20px 60px rgba(124,58,237,0.4)',
          }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: 8 }}>Artist</p>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(28px, 5vw, 56px)', marginBottom: 16, lineHeight: 1 }}>{artistName}</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20, fontSize: 14 }}>
              {loading ? 'Loading songs...' : `${tracks.length} songs found`}
            </p>
            {tracks.length > 0 && (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-gradient"
                onClick={() => playTrack(tracks[0], tracks)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: 15 }}>
                <MdPlayArrow size={20} /> Play All
              </motion.button>
            )}
          </div>
        </div>

        {/* Songs */}
        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>Popular Songs</h2>

        {loading && <Loader count={12} />}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        {!loading && !error && tracks.length === 0 && (
          <EmptyState icon={<MdPerson size={56} color="#7c3aed" />} title="No songs found" subtitle={`Couldn't find songs for "${artistName}"`} />
        )}

        {!loading && !error && tracks.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
            {tracks.map((track, i) => (
              <TrackCard key={track.id} track={track} queue={tracks} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Artist
