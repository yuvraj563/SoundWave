import { MdErrorOutline, MdRefresh } from 'react-icons/md'

const ErrorMessage = ({ message = 'Something went wrong.', onRetry }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 16, padding: '48px 24px', textAlign: 'center',
  }}>
    <div style={{
      width: 64, height: 64, borderRadius: '50%',
      background: 'rgba(239, 68, 68, 0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <MdErrorOutline size={32} color="#ef4444" />
    </div>
    <div>
      <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 6 }}>
        Oops! Something went wrong
      </p>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{message}</p>
    </div>
    {onRetry && (
      <button className="btn-gradient" onClick={onRetry} style={{
        display: 'flex', alignItems: 'center', gap: 8, fontSize: 14
      }}>
        <MdRefresh size={18} /> Try Again
      </button>
    )}
  </div>
)

export default ErrorMessage
