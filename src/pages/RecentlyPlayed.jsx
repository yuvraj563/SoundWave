import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MdHistory, MdPlayArrow } from 'react-icons/md'
import { historyAPI } from '../api/userApi'
import TrackCard from '../components/music/TrackCard'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import { usePlayer } from '../context/PlayerContext'

const RecentlyPlayed = () => {
  const { playTrack } = usePlayer()
  const [songs, setSongs]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    historyAPI.getRecent(50)
      .then(({ data }) => setSongs(data.songs || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 6 }}>
              Recently <span className="gradient-text">Played</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Your last {songs.length} played songs</p>
          </div>
          {songs.length > 0 && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-gradient"
              onClick={() => playTrack(songs[0], songs)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}>
              <MdPlayArrow size={18} /> Play All
            </motion.button>
          )}
        </div>

        {loading && <Loader count={12} />}
        {!loading && songs.length === 0 && (
          <EmptyState icon={<MdHistory size={56} color="#7c3aed" />} title="No history yet" subtitle="Songs you play will appear here." />
        )}
        {!loading && songs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
            {songs.map((track, i) => <TrackCard key={`${track.id}-${i}`} track={track} queue={songs} index={i} />)}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default RecentlyPlayed
