const jwt = require('jsonwebtoken')

/**
 * Sign a JWT token for a user.
 * @param {string} userId - The MongoDB user ID
 * @returns {string} Signed JWT token
 */
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

/**
 * Verify a JWT token.
 * @param {string} token
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { signToken, verifyToken }
