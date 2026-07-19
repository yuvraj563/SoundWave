import { motion } from 'framer-motion'

const GENRE_STYLES = {
  Pop:        { emoji: '🎤', gradient: 'linear-gradient(135deg, #f472b6, #ec4899)' },
  Rock:       { emoji: '🎸', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  'Hip-Hop':  { emoji: '🎧', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  Jazz:       { emoji: '🎷', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  Classical:  { emoji: '🎻', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  Electronic: { emoji: '🎛️', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  Country:    { emoji: '🤠', gradient: 'linear-gradient(135deg, #84cc16, #65a30d)' },
  'R&B':      { emoji: '🎼', gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
}

const GenreCard = ({ genre, isActive, onClick }) => {
  const style = GENRE_STYLES[genre] || { emoji: '🎵', gradient: 'linear-gradient(135deg, #7c3aed, #ec4899)' }

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(genre)}
      id={`genre-card-${genre.toLowerCase().replace(/[\s&]/g, '-')}`}
      style={{
        border: isActive ? '2px solid rgba(255,255,255,0.6)' : '2px solid transparent',
        borderRadius: 14,
        padding: '18px 16px',
        cursor: 'pointer',
        background: style.gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        boxShadow: isActive ? '0 0 24px rgba(255,255,255,0.2)' : '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s ease',
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1 }}>{style.emoji}</span>
      <span style={{
        color: 'white', fontWeight: 700, fontSize: 13,
        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}>
        {genre}
      </span>
    </motion.button>
  )
}

export default GenreCard
export { GENRE_STYLES }
