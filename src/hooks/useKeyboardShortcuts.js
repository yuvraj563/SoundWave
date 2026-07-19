import { useEffect } from 'react'

/**
 * useKeyboardShortcuts — Global keyboard shortcut handler for the music player.
 *
 * Shortcuts:
 *   Space      → Play / Pause
 *   ←          → Seek back 10s
 *   →          → Seek forward 10s
 *   ↑          → Volume up 10%
 *   ↓          → Volume down 10%
 *   M          → Mute / Unmute
 *   N          → Next track
 *   P          → Previous track
 */
const useKeyboardShortcuts = ({ togglePlay, seek, currentTime, duration, setVolume, volume, toggleMute, playNext, playPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in input fields
      const tag = e.target.tagName.toLowerCase()
      if (['input', 'textarea', 'select'].includes(tag)) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay?.()
          break

        case 'ArrowLeft':
          e.preventDefault()
          seek?.(Math.max(0, currentTime - 10))
          break

        case 'ArrowRight':
          e.preventDefault()
          seek?.(Math.min(duration, currentTime + 10))
          break

        case 'ArrowUp':
          e.preventDefault()
          setVolume?.(Math.min(1, volume + 0.1))
          break

        case 'ArrowDown':
          e.preventDefault()
          setVolume?.(Math.max(0, volume - 0.1))
          break

        case 'KeyM':
          toggleMute?.()
          break

        case 'KeyN':
          playNext?.()
          break

        case 'KeyP':
          playPrev?.()
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, seek, currentTime, duration, setVolume, volume, toggleMute, playNext, playPrev])
}

export default useKeyboardShortcuts
