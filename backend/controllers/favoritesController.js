const Favorite = require('../models/Favorite')

/**
 * @desc    Get all favorites for current user
 * @route   GET /api/favorites
 * @access  Private
 */
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      count: favorites.length,
      favorites: favorites.map((f) => f.song),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Add a song to favorites
 * @route   POST /api/favorites
 * @access  Private
 */
const addFavorite = async (req, res, next) => {
  try {
    const { song } = req.body
    if (!song || !song.id) {
      return res.status(400).json({ success: false, message: 'Song data is required.' })
    }

    await Favorite.create({
      userId: req.user._id,
      song,
      songId: song.id,
    })

    res.status(201).json({ success: true, message: 'Added to favorites!' })
  } catch (err) {
    // Duplicate key error (already favorited)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Song is already in favorites.' })
    }
    next(err)
  }
}

/**
 * @desc    Remove a song from favorites
 * @route   DELETE /api/favorites/:songId
 * @access  Private
 */
const removeFavorite = async (req, res, next) => {
  try {
    const result = await Favorite.findOneAndDelete({
      userId: req.user._id,
      songId: req.params.songId,
    })

    if (!result) {
      return res.status(404).json({ success: false, message: 'Favorite not found.' })
    }

    res.json({ success: true, message: 'Removed from favorites.' })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Check if a song is favorited
 * @route   GET /api/favorites/check/:songId
 * @access  Private
 */
const checkFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user._id,
      songId: req.params.songId,
    })
    res.json({ success: true, isFavorite: !!favorite })
  } catch (err) {
    next(err)
  }
}

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite }
