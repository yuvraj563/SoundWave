import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdEmail, MdArrowBack } from 'react-icons/md'
import { RiMusicFill } from 'react-icons/ri'
import { useToast } from '../context/ToastContext'
import { authAPI } from '../api/auth'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address.')
      return
    }
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
      toast.success('Reset code sent! Check your email.')
      // Navigate to reset page with email pre-filled
      setTimeout(() => {
        navigate('/reset-password', { state: { email } })
      }, 1500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code. Try again.')
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
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: 40,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
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
            Forgot <span className="gradient-text">Password?</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
            No worries! Enter your email and we'll send you a 6-digit code to reset your password.
          </p>
        </div>

        {sent ? (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: 24,
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 16,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
              Code Sent!
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
              Check your inbox for the 6-digit verification code. Redirecting...
            </p>
          </motion.div>
        ) : (
          /* Email form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <MdEmail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              <input
                id="forgot-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                autoFocus
              />
            </div>

            <motion.button
              type="submit"
              id="forgot-submit-btn"
              className="btn-gradient"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              style={{ marginTop: 8, padding: '14px', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Sending code...' : 'Send Reset Code'}
            </motion.button>
          </form>
        )}

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

export default ForgotPassword
