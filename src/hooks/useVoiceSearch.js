import { useState, useCallback, useRef } from 'react'

/**
 * useVoiceSearch — Web Speech API hook for voice-controlled music search.
 * Supports commands like "Play Believer" or just "Believer" for search.
 *
 * @param {Function} onResult - Called with the recognized text string
 */
const useVoiceSearch = (onResult) => {
  const [isListening, setIsListening] = useState(false)
  const [error, setError]             = useState(null)
  const recognitionRef                = useRef(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice search is not supported in this browser.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-IN' // Support Indian English (Bollywood / Hindi)
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim()

      // Strip command words ("play", "search for", etc.)
      const cleaned = transcript
        .replace(/^(play|search|find|look up|search for)\s+/i, '')
        .trim()

      onResult(cleaned)
    }

    recognition.onerror = (e) => {
      setError(e.error === 'no-speech' ? 'No speech detected.' : `Voice error: ${e.error}`)
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognition.start()
  }, [isSupported, onResult])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, isSupported, error, startListening, stopListening }
}

export default useVoiceSearch
