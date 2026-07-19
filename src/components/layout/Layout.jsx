import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MiniPlayer from '../player/MiniPlayer'
import { usePlayer } from '../../context/PlayerContext'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

const Layout = ({ children }) => {
  const location = useLocation()
  const { currentTrack } = usePlayer()

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <Sidebar />

      <main
        id="main-content"
        style={{
          marginLeft: 'var(--sidebar-width)',
          marginTop: 'var(--navbar-height)',
          paddingBottom: currentTrack ? 'calc(var(--player-height) + 32px)' : '32px',
          minHeight: 'calc(100vh - var(--navbar-height))',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.search}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <MiniPlayer />

      {/* Mobile responsive: hide sidebar */}
      <style>{`
        @media (max-width: 768px) {
          #sidebar { display: none !important; }
          #main-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}

export default Layout
