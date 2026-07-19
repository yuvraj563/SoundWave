const mongoose = require('mongoose')

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Playback defaults
    shuffleDefault: { type: Boolean, default: false },
    repeatDefault: { type: String, enum: ['off', 'one', 'all'], default: 'off' },
    autoPlay: { type: Boolean, default: true },
    volume: { type: Number, default: 0.8, min: 0, max: 1 },
    // Theme
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    // Continue Listening
    lastSongId: { type: String, default: null },
    lastSongData: { type: Object, default: null }, // Full song object for resume
    lastTimestamp: { type: Number, default: 0 },  // Seconds
    // Notification preferences
    showRecommendations: { type: Boolean, default: true },
    showRecentlyPlayed: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Settings', settingsSchema)
