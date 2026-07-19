import { createContext, useContext, useState, useCallback, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastContext = createContext(null)

/**
 * ToastProvider — global notification system.
 * Usage: const { toast } = useToast()
 *        toast.success('Song added!')
 *        toast.error('Something went wrong')
 *        toast.info('Loading...')
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
    warn:    (msg, dur) => addToast(msg, 'warn', dur),
  }

  const toastColors = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16,185,129,0.4)', icon: '✅' },
    error:   { bg: 'rgba(239, 68, 68, 0.15)',  border: 'rgba(239,68,68,0.4)',  icon: '❌' },
    info:    { bg: 'rgba(124, 58, 237, 0.15)', border: 'rgba(124,58,237,0.4)', icon: 'ℹ️' },
    warn:    { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245,158,11,0.4)', icon: '⚠️' },
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: 100, right: 24,
        zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {toasts.map((t) => {
            const colors = toastColors[t.type] || toastColors.info
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                onClick={() => removeToast(t.id)}
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  color: 'var(--color-text-primary)',
                  fontSize: 14,
                  fontWeight: 500,
                  maxWidth: 320,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{colors.icon}</span>
                <span style={{ lineHeight: 1.4 }}>{t.message}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default ToastContext
