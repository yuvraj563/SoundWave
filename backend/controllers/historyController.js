const RecentlyPlayed = require('../models/RecentlyPlayed')
const ListeningHistory = require('../models/ListeningHistory')
const Favorite = require('../models/Favorite')

const MAX_RECENT = 50 // Keep at most 50 recently played entries

/**
 * @desc    Record a song play (recently played + listening history)
 * @route   POST /api/history/play
 * @access  Private
 */
const recordPlay = async (req, res, next) => {
  try {
    const { song, secondsListened = 0 } = req.body
    if (!song || !song.id) {
      return res.status(400).json({ success: false, message: 'Song data is required.' })
    }

    const userId = req.user._id

    // 1) Add to recently played
    await RecentlyPlayed.create({
      userId,
      song,
      songId: song.id,
      playedAt: new Date(),
    })

    // 2) Trim to last 50 entries per user
    const count = await RecentlyPlayed.countDocuments({ userId })
    if (count > MAX_RECENT) {
      const oldest = await RecentlyPlayed.find({ userId })
        .sort({ playedAt: 1 })
        .limit(count - MAX_RECENT)
        .select('_id')
      await RecentlyPlayed.deleteMany({ _id: { $in: oldest.map((d) => d._id) } })
    }

    // 3) Update listening history (upsert — increment play count)
    await ListeningHistory.findOneAndUpdate(
      { userId, songId: song.id },
      {
        $inc: { playCount: 1, totalSeconds: secondsListened },
        $set: {
          songName: song.name,
          artistName: song.artistName,
          genre: song.genre || '',
          album: song.album || '',
          artwork: song.artwork || '',
          audio: song.audio || '',
          duration: song.duration || 0,
          lastPlayedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    )

    res.status(201).json({ success: true, message: 'Play recorded.' })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Get recently played songs (last 50)
 * @route   GET /api/history/recent
 * @access  Private
 */
const getRecentlyPlayed = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50)
    const recent = await RecentlyPlayed.find({ userId: req.user._id })
      .sort({ playedAt: -1 })
      .limit(limit)
      .lean()

    res.json({
      success: true,
      count: recent.length,
      songs: recent.map((r) => ({ ...r.song, playedAt: r.playedAt })),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Get listening analytics / stats
 * @route   GET /api/history/stats
 * @access  Private
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Most played songs (top 10)
    const topSongs = await ListeningHistory.find({ userId })
      .sort({ playCount: -1 })
      .limit(10)
      .lean()

    // Most played artist
    const artistStats = await ListeningHistory.aggregate([
      { $match: { userId } },
      { $group: { _id: '$artistName', count: { $sum: '$playCount' }, totalSeconds: { $sum: '$totalSeconds' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    // Most played genre
    const genreStats = await ListeningHistory.aggregate([
      { $match: { userId, genre: { $ne: '' } } },
      { $group: { _id: '$genre', count: { $sum: '$playCount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    // Total listening time (seconds)
    const totalTimeResult = await ListeningHistory.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalSeconds: { $sum: '$totalSeconds' } } },
    ])
    const totalSeconds = totalTimeResult[0]?.totalSeconds || 0

    // Total plays
    const totalPlaysResult = await ListeningHistory.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$playCount' } } },
    ])
    const totalPlays = totalPlaysResult[0]?.total || 0

    // Favorites count
    const favCount = await Favorite.countDocuments({ userId })

    res.json({
      success: true,
      stats: {
        topSongs: topSongs.map((s) => ({
          id: s.songId,
          name: s.songName,
          artistName: s.artistName,
          artwork: s.artwork,
          playCount: s.playCount,
        })),
        topArtists: artistStats.map((a) => ({
          name: a._id,
          playCount: a.count,
          totalSeconds: a.totalSeconds,
        })),
        topGenres: genreStats.map((g) => ({ genre: g._id, playCount: g.count })),
        totalSeconds,
        totalPlays,
        totalMinutes: Math.floor(totalSeconds / 60),
        favoritesCount: favCount,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Get personalized recommendations
 * @route   GET /api/history/recommendations
 * @access  Private
 *
 * Rule-based recommendation engine:
 * 1. Find the user's top 3 artists by play count
 * 2. Find the user's top 2 genres by play count
 * 3. Return metadata for the frontend to use as JioSaavn search queries
 *
 * This is structured so AI algorithms (KNN, Cosine Similarity, CF) can
 * replace or supplement the rule-based logic later.
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Top artists
    const topArtists = await ListeningHistory.aggregate([
      { $match: { userId } },
      { $group: { _id: '$artistName', playCount: { $sum: '$playCount' } } },
      { $sort: { playCount: -1 } },
      { $limit: 3 },
    ])

    // Top genres
    const topGenres = await ListeningHistory.aggregate([
      { $match: { userId, genre: { $ne: '' } } },
      { $group: { _id: '$genre', playCount: { $sum: '$playCount' } } },
      { $sort: { playCount: -1 } },
      { $limit: 2 },
    ])

    // Recently played artists (for "Because you listened to X")
    const recentHistory = await ListeningHistory.find({ userId })
      .sort({ lastPlayedAt: -1 })
      .limit(20)
      .lean()

    const recentArtists = [...new Set(recentHistory.map((h) => h.artistName))].slice(0, 3)

    res.json({
      success: true,
      recommendations: {
        // Each recommendation is a search query the frontend will run against JioSaavn
        basedOnArtists: topArtists.map((a) => ({
          query: a._id,
          reason: `Because you love ${a._id}`,
          type: 'artist',
        })),
        basedOnGenres: topGenres.map((g) => ({
          query: g._id,
          reason: `More ${g._id} music you might like`,
          type: 'genre',
        })),
        recentArtists: recentArtists.map((artist) => ({
          query: artist,
          reason: `Because you listened to ${artist}`,
          type: 'artist',
        })),
        // Fallback recommendations for new users
        fallback: [
          { query: 'trending hindi songs 2025', reason: 'Trending Now', type: 'trending' },
          { query: 'top bollywood hits', reason: 'Bollywood Hits', type: 'genre' },
          { query: 'latest english pop 2025', reason: 'Pop Hits', type: 'genre' },
        ],
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { recordPlay, getRecentlyPlayed, getStats, getRecommendations }
