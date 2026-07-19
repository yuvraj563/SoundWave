import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdGridView, MdViewList } from 'react-icons/md'
import { getSongsByGenre } from '../api/combinedApi'
import GenreCard from '../components/music/GenreCard'
import TrackList from '../components/music/TrackList'
import TrackCard from '../components/music/TrackCard'
import Loader from '../components/ui/Loader'
import ErrorMessage from '../components/ui/ErrorMessage'

const GENRES = ['Bollywood', 'Pop', 'Rock', 'Hip-Hop', 'Romantic', 'Punjabi', 'Classical', 'Electronic']

const Charts = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeGenre = searchParams.get('genre') || 'Pop'
  const [tracks, setTracks]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [viewMode, setViewMode] = useState('list')

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true)
      setError(null)
      try {
        // Jamendo API already filters out tracks without audio
        const data = await getSongsByGenre(activeGenre, 25)
        setTracks(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTracks()
  }, [activeGenre])

  const handleGenreClick = (genre) => {
    setSearchParams({ genre })
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 8 }}>
          Top <span className="gradient-text">Charts</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: 15 }}>
          Top tracks across every genre, updated daily
        </p>

        {/* Genre selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: 10,
          marginBottom: 36,
        }}>
          {GENRES.map(genre => (
            <GenreCard
              key={genre}
              genre={genre}
              isActive={genre === activeGenre}
              onClick={handleGenreClick}
            />
          ))}
        </div>

        {/* Active genre header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 22 }}>
              Top {activeGenre} Tracks
            </h2>
            {!loading && !error && (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {tracks.length} songs available
              </p>
            )}
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[{ mode: 'list', Icon: MdViewList }, { mode: 'grid', Icon: MdGridView }].map(({ mode, Icon }) => (
              <button
                key={mode}
                className="btn-icon"
                id={`charts-view-${mode}`}
                onClick={() => setViewMode(mode)}
                style={{
                  background: viewMode === mode ? 'rgba(124,58,237,0.25)' : 'transparent',
                  color: viewMode === mode ? '#a78bfa' : 'var(--color-text-muted)',
                  border: viewMode === mode ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                  borderRadius: 8, padding: 8,
                }}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
        </div>

        {/* Track display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGenre + viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {loading && <Loader count={viewMode === 'grid' ? 12 : 8} type={viewMode === 'list' ? 'list' : 'card'} />}
            {error   && <ErrorMessage message={error} />}

            {!loading && !error && viewMode === 'list' && (
              <div className="glass-card" style={{ padding: '8px 0' }}>
                <TrackList tracks={tracks} />
              </div>
            )}

            {!loading && !error && viewMode === 'grid' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 20,
              }}>
                {tracks.map((track, idx) => (
                  <TrackCard key={track.id} track={track} queue={tracks} index={idx} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Charts
