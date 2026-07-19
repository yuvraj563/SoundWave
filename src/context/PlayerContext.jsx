import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import useAudioPlayer from '../hooks/useAudioPlayer'
import { historyAPI, settingsAPI } from '../api/userApi'
import { useAuth } from './AuthContext'

const PlayerContext = createContext(null)

// Repeat modes: 'off' → 'one' → 'all'
const REPEAT_MODES = ['off', 'one', 'all']

export const PlayerProvider = ({ children }) => {
  const audio = useAudioPlayer()
  const { isAuthenticated } = useAuth()

  const [currentTrack, setCurrentTrack] = useState(null)
  const [queue, setQueue]               = useState([])
  const [queueIndex, setQueueIndex]     = useState(0)
  const [isShuffled, setIsShuffled]     = useState(false)
  const [repeatMode, setRepeatMode]     = useState('off') // 'off' | 'one' | 'all'
  const [shuffleHistory, setShuffleHistory] = useState([]) // for smart shuffle

  // Track play start time for history recording
  const playStartTimeRef = useRef(null)

  // Keep a ref so callbacks always read the latest auth state
  const isAuthRef = useRef(false)
  useEffect(() => { isAuthRef.current = isAuthenticated }, [isAuthenticated])

  // ── Record play to backend ──────────────────────────────────────────────────
  const recordTrackPlay = useCallback(async (track, secondsListened) => {
    try {
      await historyAPI.recordPlay(track, secondsListened)
    } catch {
      // Silently fail — history recording is non-critical
    }
  }, [])

  // ── Save last played song for "Continue Listening" ──────────────────────────
  const saveLastSong = useCallback(async (track, timestamp) => {
    try {
      await settingsAPI.update({ lastSongData: track, lastSongId: track.id, lastTimestamp: timestamp })
    } catch {
      // Silently fail
    }
  }, [])

  // ── Play a track ────────────────────────────────────────────────────────────
  const playTrack = useCallback(
    (track, newQueue = null) => {
      if (!track?.audio) {
        console.warn('[PlayerContext] track.audio missing — cannot play:', track)
        return
      }

      // Record seconds listened for previous track (if user is authenticated)
      if (currentTrack && playStartTimeRef.current && isAuthRef.current) {
        const listened = (Date.now() - playStartTimeRef.current) / 1000
        if (listened > 5) {
          recordTrackPlay(currentTrack, Math.floor(listened))
        }
      }

      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue)
        const idx = newQueue.findIndex((t) => t.id === track.id)
        setQueueIndex(idx >= 0 ? idx : 0)
        setShuffleHistory([idx >= 0 ? idx : 0])
      }

      setCurrentTrack(track)
      audio.loadAndPlay(track.audio)
      playStartTimeRef.current = Date.now()

      // Record this song play immediately so RecentlyPlayed is populated
      if (isAuthRef.current) {
        recordTrackPlay(track, 0)
        saveLastSong(track, 0)
      }
    },
    [audio, currentTrack, recordTrackPlay, saveLastSong]
  )

  // ── Play next (respects shuffle + repeat) ───────────────────────────────────
  const playNext = useCallback(
    () => {
      if (!queue.length) return

      // Record seconds listened for the track that just finished
      if (currentTrack && playStartTimeRef.current && isAuthRef.current) {
        const listened = (Date.now() - playStartTimeRef.current) / 1000
        if (listened > 5) {
          recordTrackPlay(currentTrack, Math.floor(listened))
        }
      }

      let nextIdx

      if (repeatMode === 'one') {
        // Replay same song
        nextIdx = queueIndex
      } else if (isShuffled) {
        // Random — avoid last played
        const available = queue.map((_, i) => i).filter((i) => i !== queueIndex)
        nextIdx = available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : queueIndex
      } else {
        nextIdx = queueIndex + 1
        if (nextIdx >= queue.length) {
          if (repeatMode === 'all') nextIdx = 0
          else return // End of queue, no repeat
        }
      }

      const nextTrack = queue[nextIdx]
      if (nextTrack?.audio) {
        setQueueIndex(nextIdx)
        setCurrentTrack(nextTrack)
        audio.loadAndPlay(nextTrack.audio)
        playStartTimeRef.current = Date.now()

        // Record next song play immediately + save last song
        if (isAuthRef.current) {
          recordTrackPlay(nextTrack, 0)
          saveLastSong(nextTrack, 0)
        }
      }
    },
    [queue, queueIndex, audio, repeatMode, isShuffled, currentTrack, recordTrackPlay, saveLastSong]
  )

  // ── Play previous ───────────────────────────────────────────────────────────
  const playPrev = useCallback(() => {
    if (!queue.length) return

    // If >3 seconds in: restart current track
    if (audio.currentTime > 3) {
      audio.seek(0)
      return
    }

    const prevIdx = (queueIndex - 1 + queue.length) % queue.length
    const prevTrack = queue[prevIdx]
    if (prevTrack?.audio) {
      setQueueIndex(prevIdx)
      setCurrentTrack(prevTrack)
      audio.loadAndPlay(prevTrack.audio)
      playStartTimeRef.current = Date.now()
    }
  }, [queue, queueIndex, audio])

  // ── Toggle shuffle ──────────────────────────────────────────────────────────
  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev)
  }, [])

  // ── Cycle repeat mode ───────────────────────────────────────────────────────
  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      const idx = REPEAT_MODES.indexOf(prev)
      return REPEAT_MODES[(idx + 1) % REPEAT_MODES.length]
    })
  }, [])

  // ── Add to queue ─────────────────────────────────────────────────────────────
  const addToQueue = useCallback((track) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev
      return [...prev, track]
    })
  }, [])

  // ── Remove from queue ────────────────────────────────────────────────────────
  const removeFromQueue = useCallback((trackId) => {
    setQueue((prev) => {
      const newQueue = prev.filter((t) => t.id !== trackId)
      // Adjust queueIndex if needed
      const removedIdx = prev.findIndex((t) => t.id === trackId)
      if (removedIdx < queueIndex) {
        setQueueIndex((i) => Math.max(0, i - 1))
      }
      return newQueue
    })
  }, [queueIndex])

  // ── Clear queue ──────────────────────────────────────────────────────────────
  const clearQueue = useCallback(() => {
    setQueue([])
    setQueueIndex(0)
  }, [])

  // ── Auto-play next when song ends ────────────────────────────────────────────
  // We pass a callback down to useAudioPlayer via the onEnded mechanism
  const handleSongEnd = useCallback(() => {
    playNext()
  }, [playNext])

  // Expose handleSongEnd so useAudioPlayer can call it
  audio.setOnEnded && audio.setOnEnded(handleSongEnd)

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        queueIndex,
        isShuffled,
        repeatMode,
        playTrack,
        playNext,
        playPrev,
        toggleShuffle,
        cycleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        ...audio,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}

export default PlayerContext