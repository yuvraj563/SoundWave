import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdPerson, MdLock, MdImage, MdDarkMode, MdLightMode, MdShuffle, MdRepeat, MdAutorenew, MdSave } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authAPI } from '../api/auth'
import { settingsAPI } from '../api/userApi'

const SettingSection = ({ title, children }) => (
  <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
    <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
      {title}
    </h2>
    {children}
  </div>
)

const Settings = () => {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: '' })
  const [passForm, setPassForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [avatar, setAvatar]           = useState(user?.avatar || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPass, setSavingPass]       = useState(false)

  const handleProfileChange = (e) => setProfileForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  const handlePassChange    = (e) => setPassForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  // ── Avatar from file → base64 ───────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Avatar must be under 2MB.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target.result)
    reader.readAsDataURL(file)
  }

  // ── Save Profile ────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const { data } = await authAPI.updateProfile({ name: profileForm.name, bio: profileForm.bio, avatar })
      updateUser(data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Change Password ─────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!passForm.currentPassword || !passForm.newPassword) { toast.error('Fill in all password fields.'); return }
    if (passForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters.'); return }
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match.'); return }
    setSavingPass(true)
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setSavingPass(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: 'var(--color-text-primary)',
    fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none',
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?'

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 8 }}>
          <span className="gradient-text">Settings</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>Manage your account and preferences</p>

        {/* Profile */}
        <SettingSection title="👤 Profile Information">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            {/* Avatar preview */}
            <div style={{ flexShrink: 0 }}>
              {avatar ? (
                <img src={avatar} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(124,58,237,0.5)' }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white' }}>{initials}</div>
              )}
              <label htmlFor="avatar-upload" style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 12, color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}>
                Change photo
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200 }}>
              <input name="name" placeholder="Display name" value={profileForm.name} onChange={handleProfileChange} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(124,58,237,0.6)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              <input name="bio" placeholder="Bio (optional)" value={profileForm.bio} onChange={handleProfileChange} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(124,58,237,0.6)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Email: {user?.email}</p>
            </div>
          </div>
          <motion.button className="btn-gradient" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveProfile} disabled={savingProfile}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14, opacity: savingProfile ? 0.7 : 1 }}>
            <MdSave size={16} /> {savingProfile ? 'Saving...' : 'Save Profile'}
          </motion.button>
        </SettingSection>

        {/* Password */}
        <SettingSection title="🔒 Change Password">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, marginBottom: 20 }}>
            {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
              <input key={field} type="password" name={field} placeholder={{ currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password' }[field]}
                value={passForm[field]} onChange={handlePassChange} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(124,58,237,0.6)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            ))}
          </div>
          <motion.button className="btn-gradient" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleChangePassword} disabled={savingPass}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14, opacity: savingPass ? 0.7 : 1 }}>
            <MdLock size={16} /> {savingPass ? 'Changing...' : 'Change Password'}
          </motion.button>
        </SettingSection>

      </motion.div>
    </div>
  )
}

export default Settings
