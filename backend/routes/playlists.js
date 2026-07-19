const express = require('express')
const router = express.Router()
const {
  getPlaylists, getPlaylist, createPlaylist, updatePlaylist,
  deletePlaylist, addSongToPlaylist, removeSongFromPlaylist,
} = require('../controllers/playlistsController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.get('/', getPlaylists)
router.post('/', createPlaylist)
router.get('/:id', getPlaylist)
router.put('/:id', updatePlaylist)
router.delete('/:id', deletePlaylist)
router.post('/:id/songs', addSongToPlaylist)
router.delete('/:id/songs/:songId', removeSongFromPlaylist)

module.exports = router
