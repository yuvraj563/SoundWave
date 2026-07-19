const Settings = require('../models/Settings')

/**
 * @desc    Get user settings
 * @route   GET /api/settings
 * @access  Private
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id })
    if (!settings) {
      settings = await Settings.create({ userId: req.user._id })
    }
    res.json({ success: true, settings })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Update user settings
 * @route   PUT /api/settings
 * @access  Private
 */
const updateSettings = async (req, res, next) => {
  try {
    const allowedFields = [
      'shuffleDefault', 'repeatDefault', 'autoPlay', 'volume',
      'theme', 'lastSongId', 'lastSongData', 'lastTimestamp',
      'showRecommendations', 'showRecentlyPlayed',
    ]

    const updateData = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    }

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
      { new: true, upsert: true, runValidators: true }
    )

    res.json({ success: true, settings })
  } catch (err) {
    next(err)
  }
}

module.exports = { getSettings, updateSettings }
