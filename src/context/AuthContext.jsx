import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext(null)

const TOKEN_KEY = 'soundwave_token'
const USER_KEY  = 'soundwave_user'

export const AuthProvider = ({ children }) => {
  const [user, setUser]             = useState(null)
  const [token, setToken]           = useState(() => localStorage.getItem(TOKEN_KEY))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading]   = useState(true) // Initial auth check

  // ── On mount: validate stored token ────────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    // Verify token is still valid by calling /api/auth/me
    authAPI.getMe()
      .then(({ data }) => {
        setUser(data.user)
        setToken(storedToken)
        setIsAuthenticated(true)
      })
      .catch(() => {
        // Token invalid/expired — clear storage
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setIsAuthenticated(false)
      })
      .finally(() => setIsLoading(false))
  }, [])

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    const { token: newToken, user: newUser } = data

    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)
    setIsAuthenticated(true)

    return data
  }, [])

  // ── Signup ──────────────────────────────────────────────────────────────────
  const signup = useCallback(async (name, email, password) => {
    const { data } = await authAPI.signup({ name, email, password })
    const { token: newToken, user: newUser } = data

    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)
    setIsAuthenticated(true)

    return data
  }, [])

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  // ── Update user data in state (after profile edit) ──────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
