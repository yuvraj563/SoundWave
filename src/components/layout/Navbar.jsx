import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdHome, MdSearch, MdBarChart, MdFavorite, MdMenu, MdClose,
  MdPerson, MdSettings, MdLogout, MdQueueMusic, MdLogin,
} from 'react-icons/md'
import { RiMusicFill } from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const NAV_LINKS = [
  { to: '/', icon: MdHome, label: 'Home' },
  { to: '/search', icon: MdSearch, label: 'Search' },
  { to: '/chart', icon: MdBarChart, label: 'Charts' },
  { to: '/favorites', icon: MdFavorite, label: 'Favorites' },
]

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen]     = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out. See you soon! 👋')
    navigate('/')
    setDropdownOpen(false)
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?'

  return (
    <>
      <nav id="navbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 'var(--navbar-height)',
        background: 'rgba(10, 10, 20, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 24,
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}>
            <RiMusicFill size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            SoundWave
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }} className="desktop-nav">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} id={`nav-link-${label.toLowerCase()}`}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 99,
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500, fontSize: 14,
                color: isActive ? 'white' : 'var(--color-text-secondary)',
                background: isActive ? 'rgba(124,58,237,0.25)' : 'transparent',
                border: isActive ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              })}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </div>

        {/* Auth area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }} className="desktop-nav">
          {isAuthenticated ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setDropdownOpen((o) => !o)}
                id="user-avatar-btn"
                style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.5)', cursor: 'pointer', overflow: 'hidden', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{initials}</span>
                )}
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, background: 'rgba(12,12,26,0.98)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '8px 0', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 999 }}>
                    <div style={{ padding: '10px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{user.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                    {[
                      { to: '/profile', icon: MdPerson, label: 'Profile' },
                      { to: '/playlists', icon: MdQueueMusic, label: 'My Library' },
                      { to: '/settings', icon: MdSettings, label: 'Settings' },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: 14, transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'transparent' }}>
                        <Icon size={17} />{label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4 }}>
                      <button onClick={handleLogout}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 14, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <MdLogout size={17} />Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-gradient"
                id="nav-login-btn"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontSize: 13 }}>
                <MdLogin size={16} /> Sign In
              </motion.button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen((o) => !o)}
          style={{ marginLeft: isAuthenticated ? 0 : 'auto', display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 8 }}
          id="mobile-menu-btn" aria-label="Toggle menu" className="hamburger-btn">
          {menuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            id="mobile-nav-menu"
            style={{ position: 'fixed', top: 'var(--navbar-height)', left: 0, right: 0, background: 'rgba(10,10,20,0.97)', backdropFilter: 'blur(20px)', zIndex: 899, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {NAV_LINKS.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, textDecoration: 'none', fontWeight: isActive ? 600 : 500, fontSize: 15, color: isActive ? 'white' : 'var(--color-text-secondary)', background: isActive ? 'rgba(124,58,237,0.2)' : 'transparent' })}>
                <Icon size={20} />{label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: 15 }}>
                  <MdPerson size={20} />Profile
                </NavLink>
                <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 15, fontFamily: 'Inter, sans-serif' }}>
                  <MdLogout size={20} />Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: 15 }}>
                <MdLogin size={20} />Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}

export default Navbar
