import { useState, useEffect } from 'react'

/**
 * Persist state to localStorage.
 * Falls back to initialValue if key doesn't exist.
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      // Ignore write errors
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

export default useLocalStorage
