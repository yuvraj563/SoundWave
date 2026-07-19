import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdLock, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md'
import { RiMusicFill } from 'react-icons/ri'
import { useToast } from '../context/ToastContext'
import { authAPI } from '../api/auth'

const OTP_LENGTH = 6

const ResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  // Pre-fill email from navigation state (from ForgotPassword page)
  const prefilledEmail = location.state?.email || ''

  const [email, setEmail]         = useState(prefilledEmail)
  const [otp, setOtp]             = useState(Array(OTP_LENGTH).fill(''))
  const [newPassword, setNewPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [resendCooldown, setResendCooldown] = useState(prefilledEmail ? 60 : 0)

  const otpRefs = useRef([])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Focus first OTP input on mount
  useEffect(() => {
    if (otpRefs.current[0]) otpRefs.current[0].focus()
  }, [])

  // ── OTP input handlers ──────────────────────────────────────────────────
  const handleOtpChange = useCallback((index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtp((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    // Auto-focus next input
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }, [])

  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }, [otp])

  const handleOtpPaste = useCallback((e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const digits = pasted.split('')
    setOtp((prev) => {
      const next = [...prev]
      digits.forEach((d, i) => { next[i] = d })
      return next
    })
    // Focus the input after the last pasted digit
    const focusIdx = Math.min(digits.length, OTP_LENGTH - 1)
    otpRefs.current[focusIdx]?.focus()
  }, [])

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return
    try {
      await authAPI.forgotPassword(email)
      toast.success('New code sent! Check your email.')
      setResendCooldown(60)
      setOtp(Array(OTP_LENGTH).fill(''))
      otpRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.')
    }
  }

  // ── Submit reset ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')

    if (!email) {
      toast.error('Please enter your email address.')
      return
    }
    if (otpString.length !== OTP_LENGTH) {
      toast.error('Please enter the complete 6-digit code.')
      return
    }
    if (!newPassword) {
      toast.error('Please enter a new password.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { data } = await authAPI.resetPassword({ email, otp: otpString, newPassword })
      toast.success(data.message || 'Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '13px 44px 13px 44px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
    fontSize: 15,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'all 0.2s ease',
  }

  const focusStyle = (e) => { e.target.style.borderColor = 'rgba(124,58,237,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }
  const blurStyle  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }

  // Password strength
  const strength = newPassword.length >= 6
    ? (newPassword.length >= 8
      ? (newPassword.match(/[A-Z]/)
        ? (newPassword.match(/[0-9]/) ? 4 : 3)
        : 2)
      : 1)
    : 0

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--gradient-bg)',
    }}>
      {/* Background glows */}
      <div style={{ position: 'fixed', top: '15%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: 40,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--gradient-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 32px rgba(124,58,237,0.5)',
          }}>
            <RiMusicFill size={28} color="white" />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 28, marginBottom: 6 }}>
            Reset <span className="gradient-text">Password</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Enter the code sent to your email and set a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email (editable if not pre-filled) */}
          {!prefilledEmail && (
            <div style={{ position: 'relative' }}>
              <MdLock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              <input
                id="reset-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          )}

          {/* OTP digits */}
          <div>
            <label style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Verification Code
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  style={{
                    width: 48,
                    height: 56,
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: "'Courier New', monospace",
                    background: digit ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${digit ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 12,
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    caretColor: '#7c3aed',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                  onBlur={(e) => { e.target.style.borderColor = digit ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                />
              ))}
            </div>
            {/* Resend */}
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              {resendCooldown > 0 ? (
                <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                  Resend code in <span style={{ color: '#a78bfa', fontWeight: 600 }}>{resendCooldown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#a78bfa',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    padding: 0,
                  }}
                >
                  Didn't receive a code? Resend
                </button>
              )}
            </div>
          </div>

          {/* New Password */}
          <div style={{ position: 'relative' }}>
            <MdLock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              id="reset-password"
              type={showPass ? 'text' : 'password'}
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
            <button type="button" className="btn-icon" onClick={() => setShowPass((p) => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', padding: 4 }}>
              {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div style={{ position: 'relative' }}>
            <MdLock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              id="reset-confirm-password"
              type={showPass ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Password strength indicator */}
          {newPassword && (
            <div style={{ display: 'flex', gap: 4, marginTop: -6 }}>
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  style={{
                    height: 3,
                    flex: 1,
                    borderRadius: 99,
                    background: level <= strength
                      ? (strength <= 1 ? '#ef4444' : strength <= 2 ? '#f59e0b' : strength <= 3 ? '#22c55e' : '#7c3aed')
                      : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            id="reset-submit-btn"
            className="btn-gradient"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{ marginTop: 8, padding: '14px', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </motion.button>
        </form>

        {/* Back to login */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login" style={{ color: 'var(--color-text-muted)', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <MdArrowBack size={16} />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPassword
