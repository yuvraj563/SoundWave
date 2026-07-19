import { usePlayer } from '../../context/PlayerContext'
import { formatSeconds } from '../../utils/helpers'

const ProgressBar = () => {
  const { currentTime, duration, seek } = usePlayer()
  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', minWidth: 34, textAlign: 'right' }}>
        {formatSeconds(currentTime)}
      </span>
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          id="player-progress-bar"
          aria-label="Seek"
          style={{
            width: '100%',
            accentColor: '#7c3aed',
          }}
        />
        {/* Filled track */}
        <div style={{
          position: 'absolute',
          top: '50%', left: 0,
          width: `${progress}%`,
          height: 4,
          background: 'var(--gradient-accent)',
          borderRadius: 99,
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', minWidth: 34 }}>
        {formatSeconds(duration)}
      </span>
    </div>
  )
}

export default ProgressBar
