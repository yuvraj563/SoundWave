const express = require('express')
const router = express.Router()
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoritesController')
const { protect } = require('../middleware/auth')

router.use(protect) // All favorites routes require auth

router.get('/', getFavorites)
router.post('/', addFavorite)
router.get('/check/:songId', checkFavorite)
router.delete('/:songId', removeFavorite)

module.exports = router
