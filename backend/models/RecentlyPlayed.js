const mongoose = require('mongoose')

const songSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    artistName: String,
    artwork: String,
    audio: String,
    duration: Number,
    genre: String,
    album: String,
  },
  { _id: false }
)

const recentlyPlayedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    song: {
      type: songSchema,
      required: true,
    },
    songId: {
      type: String,
      required: true,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
)

// Index for efficient queries sorted by time
recentlyPlayedSchema.index({ userId: 1, playedAt: -1 })

module.exports = mongoose.model('RecentlyPlayed', recentlyPlayedSchema)
