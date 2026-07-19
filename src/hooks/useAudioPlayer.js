import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * Core audio playback hook.
 * Manages the HTMLAudioElement lifecycle.
 * Now supports setOnEnded() for auto-play next song.
 */
const useAudioPlayer = () => {
  const audioRef   = useRef(null)
  const onEndedRef = useRef(null) // Callback set by PlayerContext

  if (!audioRef.current) {
    audioRef.current = new Audio()
    audioRef.current.preload = 'metadata'
  }

  const [isPlaying, setIsPlaying]   = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]     = useState(0)
  const [volume, setVolumeState]    = useState(0.8)
  const [isMuted, setIsMuted]       = useState(false)
  const [isLoading, setIsLoading]   = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    audio.volume = volume

    const onTimeUpdate     = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => { setDuration(audio.duration || 0); setIsLoading(false) }
    const onPlay           = () => { setIsPlaying(true);  setIsLoading(false) }
    const onPause          = () => setIsPlaying(false)
    const onEnded          = () => {
      setIsPlaying(false)
      setIsLoading(false)
      // Trigger PlayerContext's playNext
      if (onEndedRef.current) onEndedRef.current()
    }
    const onWaiting        = () => setIsLoading(true)
    const onCanPlay        = () => setIsLoading(false)
    const onError          = () => { setIsPlaying(false); setIsLoading(false) }

    audio.addEventListener('timeupdate',     onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('play',           onPlay)
    audio.addEventListener('pause',          onPause)
    audio.addEventListener('ended',          onEnded)
    audio.addEventListener('waiting',        onWaiting)
    audio.addEventListener('canplay',        onCanPlay)
    audio.addEventListener('error',          onError)

    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('play',           onPlay)
      audio.removeEventListener('pause',          onPause)
      audio.removeEventListener('ended',          onEnded)
      audio.removeEventListener('waiting',        onWaiting)
      audio.removeEventListener('canplay',        onCanPlay)
      audio.removeEventListener('error',          onError)
      audio.pause()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAndPlay = useCallback((url) => {
    const audio = audioRef.current
    if (!url) return

    audio.pause()
    audio.src = url
    audio.currentTime = 0
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
    setIsLoading(true)

    audio.load()
    audio.play()
      .then(() => { setIsPlaying(true); setIsLoading(false) })
      .catch((err) => {
        console.error('[useAudioPlayer] play() rejected:', err)
        setIsPlaying(false)
        setIsLoading(false)
      })
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio.src) return

    if (audio.paused) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => { console.error('[useAudioPlayer] togglePlay error:', err); setIsPlaying(false) })
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [])

  const seek = useCallback((time) => {
    const audio = audioRef.current
    if (audio.readyState > 0) audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const setVolume = useCallback((v) => {
    audioRef.current.volume = v
    setVolumeState(v)
    if (v > 0) setIsMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    audio.muted = !audio.muted
    setIsMuted(audio.muted)
  }, [])

  // Register a callback to be called when a song ends (for auto-next)
  const setOnEnded = useCallback((cb) => {
    onEndedRef.current = cb
  }, [])

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    loadAndPlay,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setOnEnded,
  }
}

export default useAudioPlayer
