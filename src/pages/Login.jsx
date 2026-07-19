import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { RiMusicFill } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { toast } = useToast()

  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 🎵')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
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
            Welcome <span className="gradient-text">Back</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Sign in to your SoundWave account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div style={{ position: 'relative' }}>
            <MdEmail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <MdLock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
            />
            <button type="button" className="btn-icon" onClick={() => setShowPass((p) => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', padding: 4 }}>
              {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </button>
          </div>

          {/* Forgot Password */}
          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <Link to="/forgot-password" style={{ color: '#a78bfa', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            id="login-submit-btn"
            className="btn-gradient"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{ marginTop: 8, padding: '14px', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        {/* Divider */}
        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-text-muted)', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/" style={{ color: 'var(--color-text-muted)', fontSize: 13, textDecoration: 'none' }}>
            ← Continue as guest
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
