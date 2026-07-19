import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdEmail, MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { RiMusicFill } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const Signup = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { toast } = useToast()

  const [form, setForm]         = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields.')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await signup(form.name, form.email, form.password)
      toast.success('Account created! Welcome to SoundWave 🎵')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.')
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--gradient-bg)' }}>
      <div style={{ position: 'fixed', top: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 32px rgba(124,58,237,0.5)' }}>
            <RiMusicFill size={28} color="white" />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 28, marginBottom: 6 }}>
            Join <span className="gradient-text">SoundWave</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Create your free account today
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name */}
          <div style={{ position: 'relative' }}>
            <MdPerson size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input id="signup-name" type="text" name="name" placeholder="Full name" value={form.name} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <MdEmail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input id="signup-email" type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <MdLock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input id="signup-password" type={showPass ? 'text' : 'password'} name="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            <button type="button" className="btn-icon" onClick={() => setShowPass((p) => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', padding: 4 }}>
              {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div style={{ position: 'relative' }}>
            <MdLock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input id="signup-confirm-password" type={showPass ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          {/* Password strength indicator */}
          {form.password && (
            <div style={{ display: 'flex', gap: 4, marginTop: -6 }}>
              {[1,2,3,4].map((level) => {
                const strength = form.password.length >= 6 ? (form.password.length >= 8 ? (form.password.match(/[A-Z]/) ? (form.password.match(/[0-9]/) ? 4 : 3) : 2) : 1) : 0
                return (
                  <div key={level} style={{ height: 3, flex: 1, borderRadius: 99, background: level <= strength ? (strength <= 1 ? '#ef4444' : strength <= 2 ? '#f59e0b' : strength <= 3 ? '#22c55e' : '#7c3aed') : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                )
              })}
            </div>
          )}

          <motion.button type="submit" id="signup-submit-btn" className="btn-gradient" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}
            style={{ marginTop: 8, padding: '14px', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-text-muted)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/" style={{ color: 'var(--color-text-muted)', fontSize: 13, textDecoration: 'none' }}>← Continue as guest</Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Signup
