import React from 'react'

const Loader = ({ count = 6, type = 'card' }) => {
  if (type === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)'
          }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skeleton" style={{ height: 14, width: '60%' }} />
              <div className="skeleton" style={{ height: 12, width: '40%' }} />
            </div>
            <div className="skeleton" style={{ width: 40, height: 12 }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '20px',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 16,
          padding: 16,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="skeleton" style={{ width: '100%', paddingTop: '100%', borderRadius: 10, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: '55%' }} />
        </div>
      ))}
    </div>
  )
}

export default Loader
