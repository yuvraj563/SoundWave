import { BrowserRouter, Routes, Route } from 'react-router-dom'

// ── Context Providers ──────────────────────────────────────────────────────────
import { AuthProvider }      from './context/AuthContext'
import { ToastProvider }     from './context/ToastContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { PlaylistProvider }  from './context/PlaylistContext'
import { PlayerProvider }    from './context/PlayerContext'

// ── Route Guards ───────────────────────────────────────────────────────────────
import ProtectedRoute  from './components/auth/ProtectedRoute'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute'

// ── Layout ─────────────────────────────────────────────────────────────────────
import Layout from './components/layout/Layout'

// ── Pages ──────────────────────────────────────────────────────────────────────
import Home           from './pages/Home'
import Search         from './pages/Search'
import Charts         from './pages/Charts'
import Favorites      from './pages/Favorites'
import AlbumDetail    from './pages/AlbumDetail'
import Login          from './pages/Login'
import Signup         from './pages/Signup'
import Profile        from './pages/Profile'
import Settings       from './pages/Settings'
import Playlists      from './pages/Playlists'
import PlaylistDetail from './pages/PlaylistDetail'
import RecentlyPlayed from './pages/RecentlyPlayed'
import Artist          from './pages/Artist'
import Genre           from './pages/Genre'
import ForgotPassword  from './pages/ForgotPassword'
import ResetPassword   from './pages/ResetPassword'

function App() {
  return (
    <BrowserRouter>
      {/*
        Provider order matters:
        AuthProvider (no deps) → ToastProvider (no deps) →
        FavoritesProvider (needs Auth) → PlaylistProvider (needs Auth + Toast) →
        PlayerProvider (needs settings)
      */}
      <AuthProvider>
        <ToastProvider>
          <FavoritesProvider>
            <PlaylistProvider>
              <PlayerProvider>
                <Routes>
                  {/* ── Auth pages — redirect to / if already logged in ── */}
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <Login />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <PublicOnlyRoute>
                        <Signup />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <PublicOnlyRoute>
                        <ForgotPassword />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <PublicOnlyRoute>
                        <ResetPassword />
                      </PublicOnlyRoute>
                    }
                  />

                  {/* ── App shell: Navbar + Sidebar + MiniPlayer ── */}
                  <Route
                    path="/*"
                    element={
                      <Layout>
                        <Routes>

                          {/* ── Guest-accessible pages (no auth needed) ── */}
                          <Route path="/"              element={<Home />} />
                          <Route path="/search"        element={<Search />} />
                          <Route path="/chart"         element={<Charts />} />
                          <Route path="/favorites"     element={<Favorites />} />
                          <Route path="/album/:id"     element={<AlbumDetail />} />
                          <Route path="/artist/:name"  element={<Artist />} />
                          <Route path="/genre/:genre"  element={<Genre />} />

                          {/* ── Protected pages (require login) ── */}
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings"
                            element={
                              <ProtectedRoute>
                                <Settings />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/playlists"
                            element={
                              <ProtectedRoute>
                                <Playlists />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/playlist/:id"
                            element={
                              <ProtectedRoute>
                                <PlaylistDetail />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/recently-played"
                            element={
                              <ProtectedRoute>
                                <RecentlyPlayed />
                              </ProtectedRoute>
                            }
                          />

                        </Routes>
                      </Layout>
                    }
                  />
                </Routes>
              </PlayerProvider>
            </PlaylistProvider>
          </FavoritesProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
