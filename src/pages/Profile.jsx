import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MdFavorite, MdQueueMusic, MdHistory, MdPerson, MdEdit, MdAccessTime } from 'react-icons/md'
import { RiMusicFill } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { historyAPI } from '../api/userApi'
import { useFavorites } from '../context/FavoritesContext'
import { usePlaylists } from '../context/PlaylistContext'
import TrackCard from '../components/music/TrackCard'
import { usePlayer } from '../context/PlayerContext'
import { Link } from 'react-router-dom'

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const StatCard = ({ icon, label, value, color = '#7c3aed' }) => (
  <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>{label}</p>
    </div>
  </div>
)

const Profile = () => {
  const { user } = useAuth()
  const { favorites } = useFavorites()
  const { playlists } = usePlaylists()
  const { playTrack } = usePlayer()

  const [stats, setStats]         = useState(null)
  const [recent, setRecent]       = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    Promise.all([
      historyAPI.getStats(),
      historyAPI.getRecent(6),
    ]).then(([statsRes, recentRes]) => {
      setStats(statsRes.data.stats)
      setRecent(recentRes.data.songs || [])
    }).catch(console.error)
      .finally(() => setLoadingStats(false))
  }, [])

  if (!user) return null

  const initials = user.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?'
  const joinDate  = new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Profile Header */}
        <div className="glass-card" style={{ padding: 32, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(124,58,237,0.5)' }} />
            ) : (
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: 'white', border: '3px solid rgba(124,58,237,0.5)' }}>
                {initials}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Profile</p>
            <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 6 }}>{user.name}</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 4 }}>{user.email}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Member since {joinDate}</p>
          </div>

          <Link to="/settings" style={{ textDecoration: 'none' }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-gradient"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}>
              <MdEdit size={16} /> Edit Profile
            </motion.button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          <StatCard icon={<MdFavorite size={22} color="#ec4899" />} label="Liked Songs" value={favorites.length} color="#ec4899" />
          <StatCard icon={<MdQueueMusic size={22} color="#7c3aed" />} label="Playlists" value={playlists.length} color="#7c3aed" />
          <StatCard icon={<RiMusicFill size={22} color="#a78bfa" />} label="Total Plays" value={loadingStats ? '...' : stats?.totalPlays || 0} color="#a78bfa" />
          <StatCard icon={<MdAccessTime size={22} color="#10b981" />} label="Listening Time" value={loadingStats ? '...' : formatTime(stats?.totalSeconds || 0)} color="#10b981" />
        </div>

        {/* Top Songs */}
        {!loadingStats && stats?.topSongs?.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 20 }}>🎵 Most Played Songs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {stats.topSongs.slice(0, 5).map((song, i) => (
                <div key={song.id} className="track-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 12px', cursor: 'pointer' }}
                  onClick={() => playTrack(song)}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)', width: 20, textAlign: 'center', fontWeight: 700 }}>{i + 1}</span>
                  {song.artwork ? <img src={song.artwork} alt={song.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RiMusicFill size={16} color="#7c3aed" /></div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{song.artistName}</p>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0 }}>{song.playCount} plays</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Artists */}
        {!loadingStats && stats?.topArtists?.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 20 }}>🎤 Favorite Artists</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {stats.topArtists.map((artist) => (
                <Link key={artist.name} to={`/artist/${encodeURIComponent(artist.name)}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
                      {artist.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>{artist.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{artist.playCount} plays</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recently Played */}
        {recent.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 20 }}>🕐 Recently Played</h2>
              <Link to="/recently-played" style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>See all →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {recent.slice(0, 6).map((track, i) => <TrackCard key={`${track.id}-${i}`} track={track} queue={recent} index={i} />)}
            </div>
          </section>
        )}

      </motion.div>
    </div>
  )
}

export default Profile
