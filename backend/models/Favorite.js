const mongoose = require('mongoose')

/**
 * Embedded song schema — denormalized from JioSaavn API response.
 * We store the full song object so we don't need to re-fetch from JioSaavn.
 */
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

const favoriteSchema = new mongoose.Schema(
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
    // Use JioSaavn songId for deduplication
    songId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound unique index: each user can only favorite a song once
favoriteSchema.index({ userId: 1, songId: 1 }, { unique: true })

module.exports = mongoose.model('Favorite', favoriteSchema)
