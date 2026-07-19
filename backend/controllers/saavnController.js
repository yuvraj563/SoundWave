const axios = require('axios')
const CryptoJS = require('crypto-js')

/**
 * JioSaavn Proxy Controller
 *
 * Proxies JioSaavn's internal API through our Express backend.
 * Strategy: search albums → fetch album details → get songs with encrypted URLs → decrypt.
 * This bypasses CORS and provides Hindi, Bollywood, Punjabi, Tamil, Telugu — all Indian music.
 */

const JIOSAAVN_DES_KEY = '38346591'

const saavnApi = axios.create({
  baseURL: 'https://www.jiosaavn.com',
  timeout: 12000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
  },
})

const BASE_PARAMS = {
  _format: 'json',
  _marker: '0',
  api_version: '4',
  ctx: 'web6dot0',
}

// ── Decryption ────────────────────────────────────────────────────────────────

function decryptMediaUrl(encryptedUrl) {
  if (!encryptedUrl) return ''
  try {
    const key = CryptoJS.enc.Utf8.parse(JIOSAAVN_DES_KEY)
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    )
    let url = decrypted.toString(CryptoJS.enc.Utf8)
    url = url.replace('http://', 'https://')
    url = url.replace('_96.mp4', '_320.mp4')
    return url
  } catch {
    return ''
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function decodeHtml(html) {
  if (!html) return ''
  const map = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&apos;': "'" }
  return html.replace(/&amp;|&lt;|&gt;|&quot;|&#039;|&apos;/g, m => map[m] || m)
}

function getHiResImage(url) {
  if (!url) return ''
  return url.replace('150x150', '500x500').replace('50x50', '500x500')
}

function normalizeTrack(raw) {
  const info = raw.more_info || {}
  const artists = info.artistMap?.primary_artists?.map(a => a.name).join(', ')
    || info.music || raw.subtitle || 'Unknown Artist'

  return {
    id:         raw.id || '',
    name:       decodeHtml(raw.title || 'Unknown Title'),
    artistName: decodeHtml(artists),
    artwork:    getHiResImage(raw.image || ''),
    audio:      decryptMediaUrl(info.encrypted_media_url),
    duration:   Number(info.duration) || 0,
    genre:      raw.language || info.language || '',
    album:      decodeHtml(info.album || ''),
  }
}

// ── API Helpers ───────────────────────────────────────────────────────────────

/**
 * Search albums on JioSaavn (this endpoint works reliably).
 */
async function searchAlbums(query, limit = 10) {
  const { data } = await saavnApi.get('/api.php', {
    params: { ...BASE_PARAMS, __call: 'search.getAlbumResults', q: query, n: limit, p: 1 },
  })
  return data?.results || []
}

/**
 * Search for the top artist ID matching a query.
 * Returns the first matching artist's ID, or null.
 */
async function searchArtistId(query) {
  try {
    const { data } = await saavnApi.get('/api.php', {
      params: { ...BASE_PARAMS, __call: 'search.getArtistResults', q: query, n: 3, p: 1 },
    })
    const results = data?.results || []
    return results.length ? results[0].id : null
  } catch {
    return null
  }
}

/**
 * Get all album IDs for an artist (top albums + singles).
 */
async function getArtistAlbumIds(artistId) {
  try {
    const { data } = await saavnApi.get('/api.php', {
      params: {
        ...BASE_PARAMS,
        __call: 'artist.getArtistPageDetails',
        artistId,
        n_song: 0,
        n_album: 20,
        page: 0,
        category: '',
        sort_order: '',
      },
    })
    const ids = []
    if (data?.topAlbums) data.topAlbums.forEach(a => { if (a.id) ids.push(a.id) })
    if (data?.singles)   data.singles.forEach(a => { if (a.id) ids.push(a.id) })
    return ids
  } catch {
    return []
  }
}

/**
 * Use autocomplete to find album IDs related to a query.
 */
async function autocompleteAlbumIds(query) {
  try {
    const { data } = await saavnApi.get('/api.php', {
      params: { ...BASE_PARAMS, __call: 'autocomplete.get', query },
    })
    const ids = []
    if (data?.albums?.data)   data.albums.data.forEach(a => { if (a.id) ids.push(a.id) })
    if (data?.topquery?.data) data.topquery.data.forEach(item => {
      if (item.type === 'album' && item.id) ids.push(item.id)
    })
    return ids
  } catch {
    return []
  }
}

/**
 * Get all songs from an album by ID.
 */
async function getAlbumSongs(albumId) {
  const { data } = await saavnApi.get('/api.php', {
    params: { ...BASE_PARAMS, __call: 'content.getAlbumDetails', albumid: albumId },
  })
  return (data?.list || [])
    .filter(s => s.more_info?.encrypted_media_url)
    .map(normalizeTrack)
    .filter(t => t.audio)
}

/**
 * Search songs via 3 strategies in parallel:
 * 1. Artist search → artist page → all albums/singles (best for "Sidhu Moosewala", "Arijit Singh")
 * 2. autocomplete.get → album IDs from search suggestions
 * 3. search.getAlbumResults → title-matched albums
 * All album IDs are merged, deduped, then songs fetched from up to 12 albums.
 */
async function searchSongsViaSaavn(query, limit = 20) {
  // Step 1: All 3 strategies in parallel
  const [artistId, autoAlbumIds, albumSearchResults] = await Promise.all([
    searchArtistId(query).catch(() => null),
    autocompleteAlbumIds(query).catch(() => []),
    searchAlbums(query, 10).catch(() => []),
  ])

  // Step 2: If we found an artist, get their albums/singles
  const artistAlbumIds = artistId
    ? await getArtistAlbumIds(artistId).catch(() => [])
    : []

  // Step 3: Merge all album IDs — artist albums first (most relevant for artist queries)
  const albumIdsFromSearch = albumSearchResults.map(a => a.id)
  const allAlbumIds = [
    ...new Set([...artistAlbumIds, ...autoAlbumIds, ...albumIdsFromSearch])
  ]

  if (!allAlbumIds.length) return []

  // Step 4: Fetch songs from up to 12 albums in parallel
  const albumsToFetch = allAlbumIds.slice(0, 12)
  const songArrays = await Promise.all(
    albumsToFetch.map(id => getAlbumSongs(id).catch(() => []))
  )

  // Step 5: Flatten, deduplicate by song name, and limit
  const allSongs = songArrays.flat()
  const seen = new Set()
  const unique = allSongs.filter(s => {
    const key = s.name.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.slice(0, limit)
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * @desc    Search songs on JioSaavn
 * @route   GET /api/saavn/search?q=...&limit=20
 * @access  Public
 */
const searchSongs = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query
    if (!q) {
      return res.status(400).json({ success: false, message: 'Query parameter "q" is required.' })
    }

    const tracks = await searchSongsViaSaavn(q, parseInt(limit))
    res.json({ success: true, data: tracks })
  } catch (err) {
    console.error('[JioSaavn Proxy] Search error:', err.message)
    res.json({ success: true, data: [] }) // Return empty instead of error to not break frontend
  }
}

/**
 * @desc    Get featured/trending songs
 * @route   GET /api/saavn/featured?limit=12
 * @access  Public
 */
const getFeatured = async (req, res, next) => {
  try {
    const { limit = 12 } = req.query
    const queries = [
      'trending hindi songs 2025',
      'latest bollywood hits',
      'arijit singh',
      'new releases hindi',
      'top punjabi songs',
    ]
    const query = queries[Math.floor(Math.random() * queries.length)]
    const tracks = await searchSongsViaSaavn(query, parseInt(limit))
    res.json({ success: true, data: tracks })
  } catch (err) {
    console.error('[JioSaavn Proxy] Featured error:', err.message)
    res.json({ success: true, data: [] })
  }
}

/**
 * @desc    Get songs by genre
 * @route   GET /api/saavn/genre?genre=...&limit=25
 * @access  Public
 */
const getByGenre = async (req, res, next) => {
  try {
    const { genre, limit = 25 } = req.query
    const genreQueries = {
      'Pop': 'pop hits', 'Rock': 'rock hits',
      'Hip-Hop': 'hip hop rap', 'Classical': 'classical raag',
      'Electronic': 'electronic edm', 'Bollywood': 'bollywood hits',
      'Romantic': 'romantic hindi songs', 'Party': 'party songs',
      'Punjabi': 'punjabi hits', 'Tamil': 'tamil hits',
      'Telugu': 'telugu hits', 'Bhojpuri': 'bhojpuri hits',
    }
    const query = genreQueries[genre] || genre || 'bollywood'
    const tracks = await searchSongsViaSaavn(query, parseInt(limit))
    res.json({ success: true, data: tracks })
  } catch (err) {
    console.error('[JioSaavn Proxy] Genre error:', err.message)
    res.json({ success: true, data: [] })
  }
}

/**
 * @desc    Get album details
 * @route   GET /api/saavn/album?id=...
 * @access  Public
 */
const getAlbum = async (req, res, next) => {
  try {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ success: false, message: 'Album id is required.' })
    }

    const { data } = await saavnApi.get('/api.php', {
      params: { ...BASE_PARAMS, __call: 'content.getAlbumDetails', albumid: id },
    })

    if (!data) return res.json({ success: true, data: null })

    const albumInfo = {
      id: String(data.albumid || id),
      name: decodeHtml(data.title || ''),
      artistName: decodeHtml(data.primary_artists || data.subtitle || ''),
      artwork: getHiResImage(data.image || ''),
      releaseDate: data.release_date || null,
      genre: data.language || '',
    }

    const songs = (data.list || [])
      .filter(s => s.more_info?.encrypted_media_url)
      .map(normalizeTrack)
      .filter(t => t.audio)

    res.json({ success: true, data: { album: albumInfo, tracks: songs } })
  } catch (err) {
    console.error('[JioSaavn Proxy] Album error:', err.message)
    res.json({ success: true, data: null })
  }
}

module.exports = { searchSongs, getFeatured, getByGenre, getAlbum }
