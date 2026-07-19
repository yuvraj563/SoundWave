import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MdSearch, MdClose } from 'react-icons/md'
import { MdGridView, MdViewList } from 'react-icons/md'
import { searchSongs } from '../api/combinedApi'
import TrackCard from '../components/music/TrackCard'
import TrackList from '../components/music/TrackList'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import useDebounce from '../hooks/useDebounce'

const Search = () => {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const debouncedQuery          = useDebounce(query, 450)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }
    const controller = new AbortController()
    const doSearch = async () => {
      setLoading(true)
      setError(null)
      try {
        // Jamendo API returns normalized tracks with audio field already filtered
        const tracks = await searchSongs(debouncedQuery, 100)
        setResults(tracks)
      } catch (e) {
        if (e.name !== 'CanceledError') setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    doSearch()
    return () => controller.abort()
  }, [debouncedQuery])

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 8 }}>
          <span className="gradient-text">Search</span> Music
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: 15 }}>
          Search across thousands of free songs powered by Jamendo
        </p>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 32, maxWidth: 600 }}>
          <MdSearch
            size={22}
            style={{
              position: 'absolute', left: 16, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="search-input"
            type="text"
            placeholder="Search artists, songs, albums..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '14px 48px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, color: 'var(--color-text-primary)',
              fontSize: 15, fontFamily: 'Inter, sans-serif',
              outline: 'none', transition: 'all 0.2s ease',
            }}
            onFocus={e => {
              e.target.style.border = '1px solid rgba(124,58,237,0.6)'
              e.target.style.boxShadow = '0 0 20px rgba(124,58,237,0.15)'
            }}
            onBlur={e => {
              e.target.style.border = '1px solid rgba(255,255,255,0.1)'
              e.target.style.boxShadow = 'none'
            }}
          />
          {query && (
            <button
              className="btn-icon"
              onClick={() => setQuery('')}
              id="search-clear-btn"
              aria-label="Clear search"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
            >
              <MdClose size={18} />
            </button>
          )}
        </div>

        {/* Results header */}
        {results.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>{results.length}</span> results for "
              <span style={{ color: '#a78bfa' }}>{debouncedQuery}</span>"
            </p>
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ mode: 'grid', Icon: MdGridView }, { mode: 'list', Icon: MdViewList }].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  className="btn-icon"
                  id={`view-${mode}-btn`}
                  onClick={() => setViewMode(mode)}
                  style={{
                    background: viewMode === mode ? 'rgba(124,58,237,0.25)' : 'transparent',
                    color: viewMode === mode ? '#a78bfa' : 'var(--color-text-muted)',
                    border: viewMode === mode ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                    borderRadius: 8, padding: 8,
                  }}
                  aria-label={`${mode} view`}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* States */}
        {loading && <Loader count={viewMode === 'grid' ? 12 : 8} type={viewMode === 'list' ? 'list' : 'card'} />}
        {error   && <ErrorMessage message={error} />}

        {/* Grid view */}
        {!loading && !error && results.length > 0 && viewMode === 'grid' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 20,
          }}>
            {results.map((track, idx) => (
              <TrackCard key={track.id} track={track} queue={results} index={idx} />
            ))}
          </div>
        )}

        {/* List view */}
        {!loading && !error && results.length > 0 && viewMode === 'list' && (
          <div className="glass-card" style={{ padding: '8px 0' }}>
            <TrackList tracks={results} />
          </div>
        )}

        {/* Empty states */}
        {!loading && !error && !query && (
          <EmptyState
            icon="🔍"
            title="Find your next favorite song"
            subtitle="Type an artist name, song title, or album to get started"
          />
        )}

        {!loading && !error && query && results.length === 0 && (
          <EmptyState
            icon="😕"
            title={`No results for "${query}"`}
            subtitle="Try a different search term or check your spelling"
          />
        )}
      </motion.div>
    </div>
  )
}

export default Search
