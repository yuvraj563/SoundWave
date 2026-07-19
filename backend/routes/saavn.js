const express = require('express')
const router = express.Router()
const { searchSongs, getFeatured, getByGenre, getAlbum } = require('../controllers/saavnController')

// All routes are public — no auth needed for music search
router.get('/search', searchSongs)
router.get('/featured', getFeatured)
router.get('/genre', getByGenre)
router.get('/album', getAlbum)

module.exports = router
