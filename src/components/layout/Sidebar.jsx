import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdHome, MdSearch, MdBarChart, MdFavorite, MdQueueMusic, MdHistory, MdPerson, MdLogin } from 'react-icons/md'
import { RiMusicFill } from 'react-icons/ri'
import { useFavorites } from '../../context/FavoritesContext'
import { usePlaylists } from '../../context/PlaylistContext'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { to: '/', icon: MdHome, label: 'Home' },
  { to: '/search', icon: MdSearch, label: 'Search' },
  { to: '/chart', icon: MdBarChart, label: 'Charts' },
  { to: '/favorites', icon: MdFavorite, label: 'Favorites' },
]

const GENRES = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B']

const Sidebar = () => {
  const { favorites } = useFavorites()
  const { playlists } = usePlaylists()
  const { isAuthenticated, user } = useAuth()

  const linkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px', borderRadius: 10,
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    fontSize: 14,
    color: isActive ? 'white' : 'var(--color-text-secondary)',
    background: isActive ? 'rgba(124,58,237,0.2)' : 'transparent',
    borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
    transition: 'all 0.2s ease',
    position: 'relative',
  })

  return (
    <aside id="sidebar" style={{
      width: 'var(--sidebar-width)',
      position: 'fixed',
      top: 'var(--navbar-height)',
      left: 0,
      bottom: 'var(--player-height)',
      background: 'rgba(8, 8, 18, 0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      overflowY: 'auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 28,
    }}>
      {/* Main nav */}
      <nav>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 10, padding: '0 8px' }}>Menu</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} id={`sidebar-link-${label.toLowerCase()}`}
              style={({ isActive }) => linkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  <Icon size={20} color={isActive ? '#a78bfa' : undefined} />
                  {label}
                  {label === 'Favorites' && favorites.length > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'var(--gradient-accent)', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '1px 7px', minWidth: 20, textAlign: 'center' }}>
                      {favorites.length}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Your Library (authenticated) */}
      {isAuthenticated && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 10, padding: '0 8px' }}>Your Library</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <NavLink to="/playlists" id="sidebar-link-playlists" style={({ isActive }) => linkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  <MdQueueMusic size={20} color={isActive ? '#a78bfa' : undefined} />
                  Playlists
                  {playlists.length > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'rgba(124,58,237,0.25)', color: '#a78bfa', fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '1px 7px' }}>
                      {playlists.length}
                    </span>
                  )}
                </>
              )}
            </NavLink>
            <NavLink to="/recently-played" id="sidebar-link-recent" style={({ isActive }) => linkStyle(isActive)}>
              {({ isActive }) => (
                <><MdHistory size={20} color={isActive ? '#a78bfa' : undefined} />Recently Played</>
              )}
            </NavLink>
            <NavLink to="/profile" id="sidebar-link-profile" style={({ isActive }) => linkStyle(isActive)}>
              {({ isActive }) => (
                <><MdPerson size={20} color={isActive ? '#a78bfa' : undefined} />Profile</>
              )}
            </NavLink>
          </div>

          {/* Playlist shortcuts */}
          {playlists.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {playlists.slice(0, 5).map((pl) => (
                <NavLink key={pl._id} to={`/playlist/${pl._id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 13, color: 'var(--color-text-secondary)', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
                  <RiMusicFill size={13} color="#7c3aed" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sign in prompt for guests */}
      {!isAuthenticated && (
        <div style={{ padding: '16px 12px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Sign in for more</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>Playlists, history &amp; recommendations</p>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', background: 'var(--gradient-accent)', borderRadius: 8, textDecoration: 'none', color: 'white', fontSize: 13, fontWeight: 600 }}>
            <MdLogin size={15} /> Sign In
          </Link>
        </div>
      )}

      {/* Genres quick access */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 10, padding: '0 8px' }}>Genres</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {GENRES.map((genre) => (
            <NavLink key={genre} to={`/genre/${encodeURIComponent(genre)}`}
              id={`sidebar-genre-${genre.toLowerCase().replace(/[\s&]/g, '-')}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 13, color: 'var(--color-text-secondary)', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
              <RiMusicFill size={14} color="#7c3aed" />
              {genre}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
