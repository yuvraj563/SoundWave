import { motion, AnimatePresence } from 'framer-motion'
import { MdFavorite } from 'react-icons/md'
import { MdGridView, MdViewList } from 'react-icons/md'
import { useFavorites } from '../context/FavoritesContext'
import TrackList from '../components/music/TrackList'
import TrackCard from '../components/music/TrackCard'
import EmptyState from '../components/ui/EmptyState'
import { useState } from 'react'

const Favorites = () => {
  const { favorites } = useFavorites()
  const [viewMode, setViewMode] = useState('grid')

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 8 }}>
              Your <span className="gradient-text">Favorites</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>
              {favorites.length} saved {favorites.length === 1 ? 'track' : 'tracks'} · stored locally
            </p>
          </div>

          {favorites.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[{ mode: 'grid', Icon: MdGridView }, { mode: 'list', Icon: MdViewList }].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  className="btn-icon"
                  id={`fav-view-${mode}`}
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
          )}
        </div>

        {favorites.length === 0 ? (
          <EmptyState
            icon={<MdFavorite size={56} color="#ec4899" />}
            title="No favorites yet"
            subtitle="Tap the heart icon on any track to save it here. Your favorites are kept in your browser."
          />
        ) : viewMode === 'grid' ? (
          <AnimatePresence>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 20,
            }}>
              {favorites.map((track, idx) => (
                <TrackCard key={track.id} track={track} queue={favorites} index={idx} />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="glass-card" style={{ padding: '8px 0' }}>
            <TrackList tracks={favorites} />
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Favorites
