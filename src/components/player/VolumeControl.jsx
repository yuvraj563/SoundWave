import { MdVolumeOff, MdVolumeDown, MdVolumeUp } from 'react-icons/md'
import { usePlayer } from '../../context/PlayerContext'

const VolumeControl = () => {
  const { volume, isMuted, setVolume, toggleMute } = usePlayer()

  const displayVolume = isMuted ? 0 : volume
  const Icon = displayVolume === 0 ? MdVolumeOff : displayVolume < 0.5 ? MdVolumeDown : MdVolumeUp

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button className="btn-icon" onClick={toggleMute} id="volume-mute-btn" aria-label="Toggle mute">
        <Icon size={20} />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={displayVolume}
        onChange={(e) => setVolume(Number(e.target.value))}
        id="volume-slider"
        aria-label="Volume"
        style={{ width: 90, accentColor: '#7c3aed' }}
      />
    </div>
  )
}

export default VolumeControl
