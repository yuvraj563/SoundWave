const mongoose = require('mongoose')

/**
 * ListeningHistory — aggregated listening stats per song.
 * Used for recommendations (most played artist, genre, etc.)
 */
const listeningHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    songId: {
      type: String,
      required: true,
    },
    songName: String,
    artistName: String,
    genre: String,
    album: String,
    artwork: String,
    audio: String,
    duration: Number,
    // How many times this song was played
    playCount: {
      type: Number,
      default: 1,
    },
    // Total seconds listened (for analytics)
    totalSeconds: {
      type: Number,
      default: 0,
    },
    lastPlayedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Compound unique: one record per user per song, updated on repeat plays
listeningHistorySchema.index({ userId: 1, songId: 1 }, { unique: true })

module.exports = mongoose.model('ListeningHistory', listeningHistorySchema)
