import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdArrowBack, MdPlayArrow, MdAlbum } from 'react-icons/md'
import { getAlbumTracks, getAlbumInfo } from '../api/combinedApi'
import TrackList from '../components/music/TrackList'
import Loader from '../components/ui/Loader'
import ErrorMessage from '../components/ui/ErrorMessage'
import { usePlayer } from '../context/PlayerContext'
import { formatDuration } from '../utils/helpers'

const AlbumDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playTrack } = usePlayer()
  const [albumInfo, setAlbumInfo] = useState(null)
  const [tracks, setTracks]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true)
      setError(null)
      try {
        const [info, albumTracks] = await Promise.all([
          getAlbumInfo(id),
          getAlbumTracks(id),
        ])
        setAlbumInfo(info)
        setTracks(albumTracks)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAlbum()
  }, [id])

  // Total duration — track.duration is in seconds
  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0)

  return (
    <div className="page-container">
      <button
        className="btn-icon"
        onClick={() => navigate(-1)}
        id="album-back-btn"
        style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)' }}
      >
        <MdArrowBack size={20} /> Back
      </button>

      {loading && <Loader count={1} type="card" />}
      {error   && <ErrorMessage message={error} />}

      {!loading && !error && albumInfo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {/* Album header */}
          <div style={{
            display: 'flex', gap: 32, marginBottom: 40, flexWrap: 'wrap', alignItems: 'flex-end',
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {albumInfo.artwork ? (
                <img
                  src={albumInfo.artwork}
                  alt={albumInfo.name}
                  style={{
                    width: 200, height: 200, objectFit: 'cover',
                    borderRadius: 16,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  }}
                />
              ) : (
                <div style={{
                  width: 200, height: 200, borderRadius: 16,
                  background: 'rgba(124,58,237,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MdAlbum size={80} color="#7c3aed" />
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#a78bfa', marginBottom: 8,
              }}>
                Album
              </p>
              <h1 style={{
                fontWeight: 900, fontSize: 'clamp(22px, 4vw, 36px)',
                lineHeight: 1.2, marginBottom: 10,
              }}>
                {albumInfo.name}
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 16, marginBottom: 4 }}>
                {albumInfo.artistName}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 20 }}>
                {albumInfo.releaseDate
                  ? new Date(albumInfo.releaseDate).getFullYear()
                  : ''
                } · {tracks.length} tracks · {formatDuration(totalDuration * 1000)}
              </p>

              {tracks.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-gradient"
                  id="album-play-all-btn"
                  onClick={() => playTrack(tracks[0], tracks)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}
                >
                  <MdPlayArrow size={22} /> Play All
                </motion.button>
              )}
            </div>
          </div>

          {/* Track list */}
          <div className="glass-card" style={{ padding: '8px 0' }}>
            <TrackList tracks={tracks} />
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AlbumDetail
