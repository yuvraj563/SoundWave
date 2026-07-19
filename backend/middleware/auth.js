const { verifyToken } = require('../utils/jwt')
const User = require('../models/User')

/**
 * Protect routes — verify JWT from Authorization header.
 * Attaches req.user to the request if valid.
 */
const protect = async (req, res, next) => {
  try {
    // 1) Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' })
    }

    const token = authHeader.split(' ')[1]

    // 2) Verify token
    const decoded = verifyToken(token)

    // 3) Check if user still exists
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' })
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' })
  }
}

/**
 * Optional auth — attaches user if token is valid, but doesn't block.
 * Useful for routes that behave differently for authenticated users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      const user = await User.findById(decoded.id).select('-password')
      req.user = user || null
    }
  } catch {
    req.user = null
  }
  next()
}

module.exports = { protect, optionalAuth }
