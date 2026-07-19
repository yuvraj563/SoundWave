const express = require('express')
const router = express.Router()
const { recordPlay, getRecentlyPlayed, getStats, getRecommendations } = require('../controllers/historyController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.post('/play', recordPlay)
router.get('/recent', getRecentlyPlayed)
router.get('/stats', getStats)
router.get('/recommendations', getRecommendations)

module.exports = router
