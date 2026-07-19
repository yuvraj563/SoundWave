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

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Playlist name is required'],
      trim: true,
      minlength: [1, 'Playlist name cannot be empty'],
      maxlength: [100, 'Playlist name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: 300,
    },
    coverImage: {
      type: String,
      default: '', // Uses first song's artwork if empty
    },
    songs: {
      type: [songSchema],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Playlist', playlistSchema)
