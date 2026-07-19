import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdSearch, MdPlayArrow, MdTrendingUp } from 'react-icons/md'
import { getFeaturedTracks, getSongsByGenre } from '../api/combinedApi'
import TrackCard from '../components/music/TrackCard'
import GenreCard from '../components/music/GenreCard'
import Loader from '../components/ui/Loader'
import ErrorMessage from '../components/ui/ErrorMessage'
import { usePlayer } from '../context/PlayerContext'

const GENRES = ['Bollywood', 'Pop', 'Rock', 'Hip-Hop', 'Romantic', 'Punjabi', 'Classical', 'Electronic']

const Home = () => {
  const navigate = useNavigate()
  const { playTrack } = usePlayer()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [heroTrack, setHeroTrack] = useState(null)

  const fetchFeatured = async () => {
    setLoading(true)
    setError(null)
    try {
      // Jamendo API already filters out tracks without audio in normalizeTrack
      const tracks = await getFeaturedTracks(12)
      setFeatured(tracks)
      if (tracks.length > 0) setHeroTrack(tracks[0])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFeatured() }, [])

  return (
    <div className="page-container">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          borderRadius: 24, overflow: 'hidden', marginBottom: 48,
          position: 'relative', minHeight: 320,
          background: heroTrack?.artwork
            ? `linear-gradient(135deg, rgba(10,10,20,0.75) 40%, rgba(124,58,237,0.3)), url(${heroTrack.artwork}) center/cover`
            : 'linear-gradient(135deg, #1a0a2e, #0a0a2e)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: 40,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Decorative glows */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: 200,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(124,58,237,0.25)',
              border: '1px solid rgba(124,58,237,0.5)',
              borderRadius: 99, padding: '4px 14px',
              marginBottom: 16, fontSize: 12, fontWeight: 600,
              color: '#a78bfa',
            }}
          >
            <MdTrendingUp size={14} /> Trending Now
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontWeight: 900, lineHeight: 1.1, marginBottom: 12,
              background: 'linear-gradient(135deg, #ffffff, #d8b4fe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Discover Music<br />You'll Love
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}
          >
            <br />
          </motion.p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn-gradient"
              id="hero-search-btn"
              onClick={() => navigate('/search')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
            >
              <MdSearch size={18} /> Start Searching
            </motion.button>

            {heroTrack && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                id="hero-play-btn"
                onClick={() => playTrack(heroTrack, featured)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 99, color: 'white',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  fontWeight: 600, padding: '10px 24px', fontSize: 14,
                  transition: 'all 0.2s ease',
                }}
              >
                <MdPlayArrow size={18} /> Play Featured
              </motion.button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Genres */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>Browse Genres</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 12,
        }}>
          {GENRES.map(genre => (
            <GenreCard
              key={genre}
              genre={genre}
              onClick={() => navigate(`/chart?genre=${encodeURIComponent(genre)}`)}
            />
          ))}
        </div>
      </section>

      {/* Featured Tracks */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 800, fontSize: 22 }}>Featured Tracks</h2>
          <button
            className="btn-icon"
            onClick={() => navigate('/chart')}
            id="see-all-btn"
            style={{
              fontSize: 13, color: '#a78bfa', fontWeight: 600,
              border: 'none', cursor: 'pointer', background: 'transparent',
            }}
          >
            See all →
          </button>
        </div>

        {loading && <Loader count={8} />}
        {error && <ErrorMessage message={error} onRetry={fetchFeatured} />}

        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 20,
          }}>
            {featured.slice(0, 8).map((track, idx) => (
              // Normalized tracks use `id` as key
              <TrackCard key={track.id} track={track} queue={featured} index={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
