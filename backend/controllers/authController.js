const User = require('../models/User')
const Settings = require('../models/Settings')
const { signToken } = require('../utils/jwt')
const { sendResetOTP } = require('../utils/email')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' })
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    }

    // Create user (password hashed in pre-save hook)
    const user = await User.create({ name, email, password })

    // Create default settings for the new user
    await Settings.create({ userId: user._id })

    // Generate JWT
    const token = signToken(user._id)

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        joinedDate: user.createdAt,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Login existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }

    // Find user and explicitly include password (select: false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    // Compare password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const token = signToken(user._id)

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        joinedDate: user.createdAt,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  const user = req.user // Set by protect middleware
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      joinedDate: user.createdAt,
    },
  })
}

/**
 * @desc    Update user profile (name, bio, avatar)
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body
    const updateData = {}
    if (name) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    })

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        joinedDate: user.createdAt,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' })
    }

    const user = await User.findById(req.user._id).select('+password')
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' })
    }

    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Password changed successfully!' })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Send password reset OTP to user's email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' })
    }

    // Always return success to prevent email enumeration
    const genericSuccess = {
      success: true,
      message: 'If an account with that email exists, a reset code has been sent.',
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.json(genericSuccess)
    }

    // Generate a cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()

    // Hash the OTP before storing (like a password)
    const hashedOtp = await bcrypt.hash(otp, 10)

    // Save to user document
    user.resetOtp = hashedOtp
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    user.resetOtpAttempts = 0
    await user.save({ validateBeforeSave: false })

    // Send OTP via email (or console in dev)
    await sendResetOTP(email, otp, user.name)

    res.json(genericSuccess)
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Verify OTP and reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' })
    }

    // Find user with OTP fields
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+resetOtp +resetOtpExpires +resetOtpAttempts +password')

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ success: false, message: 'No reset request found. Please request a new code.' })
    }

    // Check expiry
    if (user.resetOtpExpires < new Date()) {
      // Clear expired OTP
      user.resetOtp = undefined
      user.resetOtpExpires = undefined
      user.resetOtpAttempts = 0
      await user.save({ validateBeforeSave: false })
      return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' })
    }

    // Brute-force protection: max 5 attempts
    if (user.resetOtpAttempts >= 5) {
      user.resetOtp = undefined
      user.resetOtpExpires = undefined
      user.resetOtpAttempts = 0
      await user.save({ validateBeforeSave: false })
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new code.' })
    }

    // Compare OTP
    const isOtpValid = await bcrypt.compare(otp, user.resetOtp)
    if (!isOtpValid) {
      user.resetOtpAttempts += 1
      await user.save({ validateBeforeSave: false })
      const remaining = 5 - user.resetOtpAttempts
      return res.status(400).json({
        success: false,
        message: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      })
    }

    // OTP is valid — update password
    user.password = newPassword // pre-save hook will hash it
    user.resetOtp = undefined
    user.resetOtpExpires = undefined
    user.resetOtpAttempts = 0
    await user.save()

    res.json({ success: true, message: 'Password reset successfully! You can now log in.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { signup, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword }
