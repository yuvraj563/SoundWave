const Playlist = require('../models/Playlist')

/**
 * @desc    Get all playlists for current user
 * @route   GET /api/playlists
 * @access  Private
 */
const getPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean()

    res.json({ success: true, playlists })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Get a single playlist by ID
 * @route   GET /api/playlists/:id
 * @access  Private
 */
const getPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean()

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' })
    }
    res.json({ success: true, playlist })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Create a new playlist
 * @route   POST /api/playlists
 * @access  Private
 */
const createPlaylist = async (req, res, next) => {
  try {
    const { name, description } = req.body
    if (!name) {
      return res.status(400).json({ success: false, message: 'Playlist name is required.' })
    }

    const playlist = await Playlist.create({
      userId: req.user._id,
      name: name.trim(),
      description: description || '',
    })

    res.status(201).json({ success: true, message: 'Playlist created!', playlist })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Rename/update a playlist
 * @route   PUT /api/playlists/:id
 * @access  Private
 */
const updatePlaylist = async (req, res, next) => {
  try {
    const { name, description, coverImage } = req.body
    const updateData = {}
    if (name) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description
    if (coverImage !== undefined) updateData.coverImage = coverImage

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    )

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' })
    }

    res.json({ success: true, message: 'Playlist updated!', playlist })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Delete a playlist
 * @route   DELETE /api/playlists/:id
 * @access  Private
 */
const deletePlaylist = async (req, res, next) => {
  try {
    const result = await Playlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!result) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' })
    }

    res.json({ success: true, message: 'Playlist deleted.' })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Add a song to a playlist
 * @route   POST /api/playlists/:id/songs
 * @access  Private
 */
const addSongToPlaylist = async (req, res, next) => {
  try {
    const { song } = req.body
    if (!song || !song.id) {
      return res.status(400).json({ success: false, message: 'Song data is required.' })
    }

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' })
    }

    // Prevent duplicates
    const exists = playlist.songs.some((s) => s.id === song.id)
    if (exists) {
      return res.status(409).json({ success: false, message: 'Song already in this playlist.' })
    }

    playlist.songs.push(song)
    await playlist.save()

    res.json({ success: true, message: `Added "${song.name}" to "${playlist.name}"!`, playlist })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Remove a song from a playlist
 * @route   DELETE /api/playlists/:id/songs/:songId
 * @access  Private
 */
const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' })
    }

    const initialLength = playlist.songs.length
    playlist.songs = playlist.songs.filter((s) => s.id !== req.params.songId)

    if (playlist.songs.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Song not found in playlist.' })
    }

    await playlist.save()
    res.json({ success: true, message: 'Song removed from playlist.', playlist })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
}
