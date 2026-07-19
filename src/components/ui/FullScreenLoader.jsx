import { motion } from 'framer-motion'
import { RiMusicFill } from 'react-icons/ri'

/**
 * FullScreenLoader
 * Shown while AuthContext verifies the stored JWT via GET /api/auth/me.
 * Matches the existing purple/dark SoundWave aesthetic exactly.
 */
const FullScreenLoader = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gradient-bg)',
        zIndex: 9999,
      }}
    >
      {/* Background glows — same as Login / Signup pages */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Pulsing logo */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'var(--gradient-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 48px rgba(124,58,237,0.55)',
          marginBottom: 24,
        }}
      >
        <RiMusicFill size={36} color="white" />
      </motion.div>

      {/* Brand name */}
      <h1
        style={{
          fontWeight: 900,
          fontSize: 28,
          marginBottom: 8,
          fontFamily: 'Inter, sans-serif',
        }}
        className="gradient-text"
      >
        SoundWave
      </h1>

      {/* Subtitle */}
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 14,
          marginBottom: 36,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Loading your music…
      </p>

      {/* Animated dot-bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{ height: [6, 22, 6], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.12,
              ease: 'easeInOut',
            }}
            style={{
              width: 4,
              borderRadius: 99,
              background: 'var(--gradient-accent)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default FullScreenLoader
